// D:\B2B\app\api\v1\orders\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order, { OrderStatus, PaymentStatus } from "@/app/models/Order";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single order by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError("Invalid order ID", 400);
    }

    const order = await Order.findById(id)
      .populate({
        path: 'userId',
        select: 'name email mobile',
      })
      .lean();

    if (!order) {
      throw new APIError("Order not found", 404);
    }

    // Format order for response
    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.userId?.name || `${order.shippingAddress.first_name} ${order.shippingAddress.last_name}`,
      customerEmail: order.userId?.email || '',
      customerPhone: order.shippingAddress.phone_number,
      status: order.orderStatus,
      totalAmount: order.totalAmount,
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        productId: item.productId.toString(),
        productName: item.productName,
        productSlug: item.productSlug,
        variantId: item.variantId,
        sizeId: item.sizeId,
        color: item.color,
        size: item.size,
        sku: item.sku,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice,
        image: item.image,
      })),
      shippingAddress: {
        firstName: order.shippingAddress.first_name,
        lastName: order.shippingAddress.last_name,
        street: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.pin_code,
        country: order.shippingAddress.country,
        phoneNumber: order.shippingAddress.phone_number,
        addressType: order.shippingAddress.address_type,
      },
      billingAddress: order.billingAddress ? {
        firstName: order.billingAddress.first_name,
        lastName: order.billingAddress.last_name,
        street: order.billingAddress.address,
        city: order.billingAddress.city,
        state: order.billingAddress.state,
        zipCode: order.billingAddress.pin_code,
        country: order.billingAddress.country,
        phoneNumber: order.billingAddress.phone_number,
        addressType: order.billingAddress.address_type,
      } : undefined,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      discount: order.discount,
      tax: order.tax,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderDate: order.createdAt,
      shippingDate: order.shippingDate,
      deliveryDate: order.deliveredAt,
      expectedDeliveryDate: order.expectedDeliveryDate,
      cancelledAt: order.cancelledAt,
      cancelledReason: order.cancelledReason,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      notes: order.notes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json(
      {
        status: true,
        message: "Order fetched successfully",
        data: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}

// PUT - Update order status or other details
export async function PUT(request: NextRequest, { params }: RouteParams) {

  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, courierName, notes, adminNotes, cancelledReason } = body;

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
      updateFields.push('status');
    }

    // Update tracking info
    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
      updateFields.push('trackingNumber');
    }

    if (courierName) {
      updates.courierName = courierName;
      updateFields.push('courierName');
    }

    // Update notes
    if (notes !== undefined) {
      updates.notes = notes;
      updateFields.push('notes');
    }

    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
      updateFields.push('adminNotes');
    }

    // Update order
    if (updateFields.length > 0) {
      Object.assign(order, updates);
      await order.save();
    }

    return NextResponse.json(
      {
        status: true,
        message: `Order ${updateFields.join(', ')} updated successfully`,
        data: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          trackingNumber: order.trackingNumber,
          updatedAt: order.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  } 
}

// DELETE - Cancel order (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError("Invalid order ID", 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new APIError("Order not found", 404);
    }

    // Check if order can be cancelled
    if (order.orderStatus === OrderStatus.DELIVERED || order.orderStatus === OrderStatus.SHIPPED) {
      throw new APIError("Cannot cancel shipped or delivered orders", 400);
    }

    // Update order status to cancelled
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelledReason = "Cancelled by admin";

    // Refund payment if paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      order.paymentStatus = PaymentStatus.REFUNDED;
    }

    await order.save();

    return NextResponse.json(
      {
        status: true,
        message: "Order cancelled successfully",
        data: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          cancelledAt: order.cancelledAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}