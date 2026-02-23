// D:\B2B\app\api\v1\orders\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Order from '@/app/models/Order';
import { authenticate } from '@/app/middlewares/authMiddleware';

// GET - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { userId } = await authenticate(request);

    const order = await Order.findOne({
      _id: params.id,
      userId
    }).lean();

    if (!order) {
      return NextResponse.json(
        { status: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      data: order
    });

  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}