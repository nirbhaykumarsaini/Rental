import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const categoryId = searchParams.get('categoryId');

    if (!slug) {
      return NextResponse.json(
        { status: false, message: 'Slug is required' },
        { status: 400 }
      );
    }

    const query: any = { slug };
    
    // Exclude current category when checking for updates
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(categoryId) };
    }

    const existingCategory = await Category.findOne(query).select('_id').lean();
    const available = !existingCategory;

    return NextResponse.json({
      status: true,
      data: { available }
    });

  } catch (error: any) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}