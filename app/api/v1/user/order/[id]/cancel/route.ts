// D:\B2B\app\api\v1\orders\[id]\cancel\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Order from '@/app/models/Order';
import { authenticate } from '@/app/middlewares/authMiddleware';

// PUT - Cancel order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const { userId } = await authenticate(request);

    const order = await Order.findOne({
      _id: params.id,
      userId: userId
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
        { status: false, message: 'Order cannot be cancelled at this stage' },
        { status: 400 }
      );
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return NextResponse.json({
      status: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}