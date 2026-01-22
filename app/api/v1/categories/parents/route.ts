import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';

    const query: any = { parentId: null };
    if (active) {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .select('id name slug color')
      .lean();

    return NextResponse.json({
      status: true,
      data: categories
    });

  } catch (error: any) {
    console.error('Error fetching parent categories:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch parent categories' },
      { status: 500 }
    );
  }
}