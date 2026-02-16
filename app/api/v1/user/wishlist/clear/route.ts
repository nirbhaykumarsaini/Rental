// D:\B2B\app\api\v1\user\wishlist\clear\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Wishlist from '@/app/models/Wishlist';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';

// DELETE - Clear entire wishlist
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      throw new APIError('Wishlist not found', 404);
    }

    // Clear all items
    wishlist.items = [];
    await wishlist.save();

    return NextResponse.json({
      status: true,
      message: 'Wishlist cleared successfully',
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}