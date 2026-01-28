import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import { authenticate } from "@/app/middlewares/authMiddleware";
import mongoose from "mongoose";
import { OrderStatus, PaymentStatus } from "@/app/models/Order";
import Product from "@/app/models/Product";

// GET - Get single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: "Invalid order ID format" },
        { status: 400 },
      );
    }

    const order = await Order.findOne({ _id: id, userId })
      .populate('items.productId', 'name slug images')
      .lean();

    if (!order) {
      return NextResponse.json(
        { status: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Order fetched successfully",
      data: order
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch order" },
      { status: 500 },
    );
  }
}

// PUT - Update order (cancel order for user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    await connectDB();
    
    const { userId } = await authenticate(request);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { status: false, message: "Invalid order ID format" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { action, reason } = body;

    if (action !== 'cancel') {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { status: false, message: "Invalid action" },
        { status: 400 },
      );
    }

    // Find order
    const order = await Order.findOne({ _id: id, userId }).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { status: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = [
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ];

    if (nonCancellableStatuses.includes(order.orderStatus)) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { 
          status: false, 
          message: `Order cannot be cancelled in ${order.orderStatus} status` 
        },
        { status: 400 },
      );
    }

    // Restore inventory for all order items
    try {
      // Filter items that have variant and size information
      const itemsToRestore = order.items.filter((item: { variantId: any; sizeId: any; }) => 
        item.variantId && item.sizeId
      );
      
      if (itemsToRestore.length > 0) {
        // Restore inventory for each item
        for (const item of itemsToRestore) {
          const product = await Product.findById(item.productId).session(session);
          
          if (product) {
            const variant = product.variants.id(item.variantId);
            if (variant) {
              const size = variant.sizes.id(item.sizeId);
              if (size) {
                // Restore the inventory
                size.inventory += item.quantity;
                
                // Update product status based on new inventory
                const totalInventory = product.variants.reduce((total: number, variant: any) => {
                  return total + variant.sizes.reduce((sum: number, size: any) => sum + size.inventory, 0);
                }, 0);
                
                if (totalInventory === 0) {
                  product.status = 'out-of-stock';
                } else if (totalInventory <= 10) {
                  product.status = 'low-stock';
                } else {
                  product.status = 'in-stock';
                }
                
                await product.save({ session });
              }
            }
          }
        }
      }
    } catch (inventoryError: any) {
      console.error("Error restoring inventory:", inventoryError);
    }

    // Update order status
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    if (reason) {
      order.cancelledReason = reason;
    }

    // Update payment status for COD orders
    if (order.paymentMethod === 'cod' && order.paymentStatus === PaymentStatus.PENDING) {
      order.paymentStatus = PaymentStatus.FAILED;
    }

    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      status: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error: any) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error updating order:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to update order" },
      { status: 500 },
    );
  }
}