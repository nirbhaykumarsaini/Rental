// D:\B2B\app\api\v1\user\wishlist\check\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Wishlist from '@/app/models/Wishlist';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';

// GET - Check if product is in wishlist
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Get productId from query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      throw new APIError('Product ID is required', 400);
    }

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return NextResponse.json({
        status: true,
        data: { isInWishlist: false },
      }, { status: 200 });
    }

    // Check if product exists in wishlist
    const isInWishlist = wishlist.items.some(
      item => item.productId.toString() === productId
    );

    return NextResponse.json({
      status: true,
      data: { isInWishlist },
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}