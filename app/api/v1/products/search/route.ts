// D:\DressRentalBackend\app\api\v1\products\search\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product from '@/app/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sizes = searchParams.get('sizes')?.split(',');
    const colors = searchParams.get('colors')?.split(',');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = {
      isPublished: true,
      isAvailable: true,
      status: 'available'
    };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } }
      ];
    }

    // Apply filters
    if (category && category !== 'All') {
      searchQuery.category = category;
    }

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    if (sizes && sizes.length > 0) {
      searchQuery.sizes = { $in: sizes };
    }

    if (colors && colors.length > 0) {
      searchQuery.color = { $in: colors };
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'relevance':
      default:
        if (query) {
          // Text search relevance
          sort = { score: { $meta: 'textScore' } };
        } else {
          sort = { createdAt: -1 };
        }
        break;
    }

    // Execute search
    let products;
    let total;

    if (query && sortBy === 'relevance') {
      // Use text search for relevance
      [products, total] = await Promise.all([
        Product.find(
          { $text: { $search: query }, ...searchQuery },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit)
          .select('-__v')
          .lean(),
        Product.countDocuments({ $text: { $search: query }, ...searchQuery })
      ]);
    } else {
      // Regular search
      [products, total] = await Promise.all([
        Product.find(searchQuery)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-__v')
          .lean(),
        Product.countDocuments(searchQuery)
      ]);
    }

    // Get search suggestions if query exists
    let suggestions: string[] = [];
    if (query && query.length > 2) {
      const suggestionResults = await Product.find({
        isPublished: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      })
        .limit(5)
        .select('name category')
        .lean();

      suggestions = [
        ...new Set(suggestionResults.flatMap(p => [p.name, p.category]))
      ].filter(Boolean).slice(0, 5);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      status: true,
      message: 'Search results fetched successfully',
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      suggestions,
      query
    });

  } catch (error: any) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to search products' },
      { status: 500 }
    );
  }
}