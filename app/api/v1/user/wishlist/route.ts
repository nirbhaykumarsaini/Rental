// D:\B2B\app\api\v1\user\wishlist\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Wishlist from '@/app/models/Wishlist';
import Product from '@/app/models/Product';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';
import mongoose from 'mongoose';

// GET - Get user's wishlist with populated products
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Find user's wishlist
    let wishlist = await Wishlist.findOne({ userId });

    // If no wishlist exists, create one
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [],
      });
    }

    // Populate product details
    const populatedWishlist = await Wishlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          items: {
            $push: {
              _id: '$items._id',
              addedAt: '$items.addedAt',
              product: '$productDetails',
            },
          },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },
    ]);

    const result = populatedWishlist[0] || { items: [] };

    return NextResponse.json({
      status: true,
      message: 'Wishlist fetched successfully',
      data: result.items || [],
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Parse request body
    const { productId } = await request.json();

    if (!productId) {
      throw new APIError('Product ID is required', 400);
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new APIError('Product not found', 404);
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [{ productId }],
      });
    } else {
      // Check if product already in wishlist
      const existingItem = wishlist.items.find(
        (item:any) => item.productId.toString() === productId
      );

      if (!existingItem) {
        wishlist.items.push({ productId });
        await wishlist.save();
      }
    }

    return NextResponse.json({
      status: true,
      message: 'Product added to wishlist successfully',
      data: wishlist,
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
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
      throw new APIError('Wishlist not found', 404);
    }

    // Remove item
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();

    return NextResponse.json({
      status: true,
      message: 'Product removed from wishlist successfully',
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}