import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product from '@/app/models/Product';

// GET - Fetch all products with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Execute query
    const products = await Product.find({ isPublished: true })
      .lean()
      .then(docs => docs.map(doc => {
        // Remove the id virtual field that Mongoose adds
        const { id, __v, ...rest } = doc;
        return rest;
      }));

    return NextResponse.json({
      status: true,
      data: products
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}