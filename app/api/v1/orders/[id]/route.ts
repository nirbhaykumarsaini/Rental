import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import { authenticate } from "@/app/middlewares/authMiddleware";
import mongoose from "mongoose";
import { OrderStatus, PaymentStatus } from "@/app/models/Order";
import Product from "@/app/models/Product";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";

// GET - Get single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      .populate("items.productId", "name slug images")
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
      data: order,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch order" },
      { status: 500 },
    );
  }
}

// POST - Update order (cancel order for user)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const body = await request.json();
    const { action, reason } = body;

    if (action !== "cancel") {
      return NextResponse.json(
        { status: false, message: "Invalid action" },
        { status: 400 },
      );
    }

    // Find order
    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return NextResponse.json(
        { status: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = [
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ];

    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return NextResponse.json(
        {
          status: false,
          message: `Order cannot be cancelled in ${order.orderStatus} status`,
        },
        { status: 400 },
      );
    }

    // Restore inventory for all order items
    try {
      // Filter items that have variant and size information
      const itemsToRestore = order.items.filter(
        (item: { variantId: any; sizeId: any }) =>
          item.variantId && item.sizeId,
      );

      if (itemsToRestore.length > 0) {
        // Restore inventory for each item
        for (const item of itemsToRestore) {
          const product = await Product.findById(item.productId);

          if (product) {
            const variantId = new mongoose.Types.ObjectId(item.variantId);
            const sizeId = new mongoose.Types.ObjectId(item.sizeId);

            const variant = product.variants.find(
              (v: any) => v._id && v._id.toString() === variantId.toString(),
            );
            if (variant) {
              const size = variant.sizes.find(
                (s: any) => s._id && s._id.toString() === sizeId.toString(),
              );

              if (size) {
                // Restore the inventory
                size.inventory += item.quantity;

                // Update product status based on new inventory
                const totalInventory = product.variants.reduce(
                  (total: number, variant: any) => {
                    return (
                      total +
                      variant.sizes.reduce(
                        (sum: number, size: any) => sum + size.inventory,
                        0,
                      )
                    );
                  },
                  0,
                );

                if (totalInventory === 0) {
                  product.status = "out-of-stock";
                } else if (totalInventory <= 10) {
                  product.status = "low-stock";
                } else {
                  product.status = "in-stock";
                }

                await product.save();
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
    if (
      order.paymentMethod === "cod" &&
      order.paymentStatus === PaymentStatus.PENDING
    ) {
      order.paymentStatus = PaymentStatus.FAILED;
    }

    await order.save();

    return NextResponse.json({
      status: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to update order" },
      { status: 500 },
    );
  }
}

// PUT - Update order status or other details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      trackingNumber,
      courierName,
      notes,
      adminNotes,
      cancelledReason,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError("Invalid order ID", 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new APIError("Order not found", 404);
    }

    const updates: any = {};
    const updateFields: string[] = [];

    // Update status if provided
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      if (status === OrderStatus.CANCELLED) {
        // Handle cancellation
        updates.orderStatus = status;
        updates.cancelledAt = new Date();
        updates.cancelledReason = cancelledReason || "Cancelled by admin";

        // If order was paid, refund payment
        if (order.paymentStatus === PaymentStatus.PAID) {
          updates.paymentStatus = PaymentStatus.REFUNDED;
        }
      } else if (status === OrderStatus.SHIPPED) {
        updates.orderStatus = status;
        updates.shippingDate = new Date();
      } else if (status === OrderStatus.DELIVERED) {
        updates.orderStatus = status;
        updates.deliveredAt = new Date();
      } else {
        updates.orderStatus = status;
      }
      updateFields.push("status");
    }

    // Update tracking info
    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
      updateFields.push("trackingNumber");
    }

    if (courierName) {
      updates.courierName = courierName;
      updateFields.push("courierName");
    }

    // Update notes
    if (notes !== undefined) {
      updates.notes = notes;
      updateFields.push("notes");
    }

    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
      updateFields.push("adminNotes");
    }

    // Update order
    if (updateFields.length > 0) {
      Object.assign(order, updates);
      await order.save();
    }

    return NextResponse.json(
      {
        status: true,
        message: `Order ${updateFields.join(", ")} updated successfully`,
        data: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          trackingNumber: order.trackingNumber,
          updatedAt: order.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}
