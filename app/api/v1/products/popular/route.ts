// D:\DressRentalBackend\app\api\v1\products\popular\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product from '@/app/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get popular products based on:
    // 1. High view count (if you track views)
    // 2. Featured products
    // 3. New arrivals
    // 4. Low rental prices
    // 5. Recently created
    const popularProducts = await Product.find({
      isPublished: true,
      isAvailable: true,
      status: 'available'
    })
    .sort({
      isFeatured: -1,
      isNewArrival: -1,
      createdAt: -1,
      price: 1 // Lower price first
    })
    .limit(limit)
    .select('-__v')
    .lean();

    return NextResponse.json({
      status: true,
      message: 'Popular products fetched successfully',
      data: popularProducts
    });

  } catch (error: any) {
    console.error('Error fetching popular products:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch popular products' },
      { status: 500 }
    );
  }
}