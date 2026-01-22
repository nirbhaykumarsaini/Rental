import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';
import Product from '@/app/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [
      totalCategories,
      mainCategories,
      activeCategories,
      featuredCategories,
      productsByCategory
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ parentId: null }),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isFeatured: true }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const subCategories = totalCategories - mainCategories;
    const totalProductsByCategory = productsByCategory.reduce((sum, item) => sum + item.count, 0);

    const statistics = {
      totalCategories,
      mainCategories,
      subCategories,
      activeCategories,
      featuredCategories,
      totalProductsByCategory
    };

    return NextResponse.json({
      status: true,
      data: statistics
    });

  } catch (error: any) {
    console.error('Error fetching category statistics:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}