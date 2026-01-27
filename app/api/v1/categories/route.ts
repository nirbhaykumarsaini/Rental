// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '@/app/utils/cloudinary';
import Product from '@/app/models/Product';

// GET - Fetch all categories with product count using aggregation
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const withProductCount = searchParams.get('withProductCount') === 'true';
    const skip = (page - 1) * limit;

    // Build base query for match stage
    const matchQuery: any = {};
    
    if (active === 'true') {
      matchQuery.isActive = true;
    } else if (active === 'false') {
      matchQuery.isActive = false;
    }

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Add match stage if filters exist
    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery });
    }

    // Add product count using $lookup
    if (withProductCount) {
      pipeline.push(
        {
          $lookup: {
            from: 'products',
            let: { categorySlug: { $toString: '$slug' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$category', '$$categorySlug']
                  },
                  isPublished: true // Only count published products
                }
              }
            ],
            as: 'products'
          }
        },
        {
          $addFields: {
            productCount: { $size: '$products' }
          }
        },
        {
          $project: {
            products: 0 // Remove the products array from final result
          }
        }
      );
    }

    // Add sort, skip, and limit
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          __v: 0,
          updatedAt: 0 // Remove if you need updatedAt
        }
      }
    );

    // Get total count for pagination
    const totalPipeline = [];
    if (Object.keys(matchQuery).length > 0) {
      totalPipeline.push({ $match: matchQuery });
    }
    totalPipeline.push({ $count: 'total' });

    const [categories, totalResult] = await Promise.all([
      Category.aggregate(pipeline),
      Category.aggregate(totalPipeline)
    ]);

    const total = totalResult[0]?.total || 0;

    // Pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      status: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category with image upload
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const isActive = formData.get('isActive') === 'true';
    const createdBy = formData.get('createdBy') as string;
    const imageFile = formData.get('category_image') as File;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let categorySlug = slug;
    if (!categorySlug && name) {
      categorySlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
    }

    // Validate slug
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categorySlug)) {
      return NextResponse.json(
        { status: false, message: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: categorySlug });
    if (existingCategory) {
      return NextResponse.json(
        { status: false, message: 'Category slug already exists' },
        { status: 409 }
      );
    }

    let imageUrl = '';
    
    // Upload image to Cloudinary if provided
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadResult = await uploadToCloudinary(imageFile, 'categories');
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return NextResponse.json(
          { status: false, message: 'Failed to upload category image' },
          { status: 500 }
        );
      }
    }

    // Create category data
    const categoryData: any = {
      name,
      slug: categorySlug,
      isActive,
      category_image: imageUrl
    };

    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      categoryData.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    // Create category
    const category = await Category.create(categoryData);
    
    return NextResponse.json({
      status: true,
      message: 'Category created successfully',
      data: category
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { status: false, message: 'Category slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}