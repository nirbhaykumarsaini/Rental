import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const hierarchy = await Category.find();

    return NextResponse.json({
      status: true,
      data: hierarchy
    });

  } catch (error: any) {
    console.error('Error fetching category hierarchy:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch category hierarchy' },
      { status: 500 }
    );
  }
}