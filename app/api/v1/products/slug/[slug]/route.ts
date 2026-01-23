import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product from '@/app/models/Product';

// GET - Fetch product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    const product = await Product.findOne({ slug }).select('-__v').lean();
    
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: true,
      data: product
    });

  } catch (error: any) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}