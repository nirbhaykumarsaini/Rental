// D:\B2B\app\api\v1\user\orders\[orderId]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Order from '@/app/models/Order';


// PUT - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    const { orderId } = await params;
    const body = await request.json();

    // Validate orderId
    if (!orderId) {
      return NextResponse.json(
        { status: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find order and ensure it belongs to the user
    const order = await Order.findOne({
      _id: orderId    });

    if (!order) {
      return NextResponse.json(
        { status: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Define allowed updates based on order status
    const allowedUpdates: { [key: string]: string[] } = {
      pending: ['orderStatus', 'paymentStatus', 'address', 'deliveryDate', 'returnDate'],
      confirmed: ['orderStatus', 'paymentStatus'],
      processing: ['orderStatus', 'paymentStatus'],
      shipped: ['orderStatus', 'paymentStatus', 'trackingDetails'],
      delivered: ['paymentStatus', 'trackingDetails'],
      cancelled: [],
      refunded: []
    };

    const currentStatus = order.orderStatus;
    const updates = Object.keys(body);
    
    // Check if updates are allowed
    const isAllowed = updates.every(update => 
      allowedUpdates[currentStatus]?.includes(update)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { 
          status: false, 
          message: `Cannot update order in ${currentStatus} status` 
        },
        { status: 400 }
      );
    }

    // Validate order status transition
    if (body.orderStatus) {
      const validTransitions: { [key: string]: string[] } = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered', 'cancelled'],
        delivered: ['refunded'],
        cancelled: [],
        refunded: []
      };

      if (!validTransitions[currentStatus]?.includes(body.orderStatus)) {
        return NextResponse.json(
          { 
            status: false, 
            message: `Cannot transition from ${currentStatus} to ${body.orderStatus}` 
          },
          { status: 400 }
        );
      }

      // AUTO-UPDATE PAYMENT STATUS WHEN ORDER IS DELIVERED
      if (body.orderStatus === 'delivered') {
        // For Cash on Delivery, mark as paid when delivered
        if (order.paymentMethod === 'cod') {
          body.paymentStatus = 'paid';
        }
        
        // Add delivery timestamp
        body.deliveredAt = new Date();
      }

      // Handle cancellation
      if (body.orderStatus === 'cancelled') {
        // If payment was made, mark for refund
        if (order.paymentStatus === 'paid') {
          body.paymentStatus = 'refunded';
        }
      }
    }

    // Handle payment status updates
    if (body.paymentStatus) {
      // Validate payment status transitions
      const validPaymentTransitions: { [key: string]: string[] } = {
        pending: ['paid', 'failed'],
        paid: ['refunded'],
        failed: ['pending'],
        refunded: []
      };

      if (body.paymentStatus === 'paid' && order.orderStatus === 'delivered') {
        // Allow payment status update when delivered
        // This is valid
      } else if (!validPaymentTransitions[order.paymentStatus]?.includes(body.paymentStatus)) {
        return NextResponse.json(
          { 
            status: false, 
            message: `Cannot change payment status from ${order.paymentStatus} to ${body.paymentStatus}` 
          },
          { status: 400 }
        );
      }

      // Add payment timestamp
      if (body.paymentStatus === 'paid') {
        body.paidAt = new Date();
      }
    }

    // Apply updates
    Object.assign(order, body);
    await order.save();

    return NextResponse.json({
      status: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (error: any) {
    console.error('Error updating order:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { status: false, message: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { status: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();

    const { orderId } = params;

    // Validate orderId
    if (!orderId) {
      return NextResponse.json(
        { status: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find order and ensure it belongs to the user
    const order = await Order.findOne({
      _id: orderId
    });

    if (!order) {
      return NextResponse.json(
        { status: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return NextResponse.json(
        { 
          status: false, 
          message: `Order cannot be cancelled in ${order.orderStatus} status` 
        },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    order.orderStatus = 'cancelled';
    
    // If payment was made, update payment status to refunded
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    return NextResponse.json({
      status: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error: any) {
    console.error('Error cancelling order:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { status: false, message: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: false, message: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}