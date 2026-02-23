// D:\B2B\app\api\v1\orders\active-rentals\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Order from '@/app/models/Order';
import { authenticate } from '@/app/middlewares/authMiddleware';


// GET - Get user's active rentals
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
     const { userId } = await authenticate(request);

    const activeStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const now = new Date();

    const activeRentals = await Order.find({
      userId: userId,
      orderStatus: { $in: activeStatuses },
      returnDate: { $gte: now }
    }).sort({ deliveryDate: 1 }).lean();

    return NextResponse.json({
      status: true,
      data: activeRentals
    });

  } catch (error: any) {
    console.error('Error fetching active rentals:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch active rentals' },
      { status: 500 }
    );
  }
}