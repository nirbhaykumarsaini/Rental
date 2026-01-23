import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category, { ICategory } from '@/app/models/Category';
import Product from '@/app/models/Product';
import mongoose from 'mongoose';

// GET - Fetch all categories with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const parentId = searchParams.get('parentId');
    const featured = searchParams.get('featured');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const withSubcategories = searchParams.get('withSubcategories') === 'true';
    const withProductCount = searchParams.get('withProductCount') === 'true';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (parentId === 'null' || parentId === '') {
      query.parentId = null;
    } else if (parentId) {
      if (mongoose.Types.ObjectId.isValid(parentId)) {
        query.parentId = new mongoose.Types.ObjectId(parentId);
      }
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build population options
    const populateOptions = [];
    if (withSubcategories) {
      populateOptions.push({
        path: 'subCategories',
        match: { isActive: true },
        options: { sort: { sortOrder: 1, name: 1 } }
      });
    }
    if (withProductCount) {
      populateOptions.push({
        path: 'productCount'
      });
    }

    // Execute query with pagination
    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populateOptions)
        .select('-__v')
        .lean(),
      Category.countDocuments(query)
    ]);

    // For hierarchy view
    if (withSubcategories && parentId === 'null') {
      const hierarchy = await Category.find();
      return NextResponse.json({
        status: true,
        data: hierarchy,
        pagination: {
          page,
          limit,
          total,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    // Calculate pagination metadata
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

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { status: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
    }

    // Validate parent category exists if provided
    if (body.parentId) {
      if (!mongoose.Types.ObjectId.isValid(body.parentId)) {
        return NextResponse.json(
          { status: false, message: 'Invalid parent category ID' },
          { status: 400 }
        );
      }
      
      const parentCategory = await Category.findById(body.parentId);
      if (!parentCategory) {
        return NextResponse.json(
          { status: false, message: 'Parent category not found' },
          { status: 404 }
        );
      }

      // Check for circular reference
      if (body.parentId === body._id) {
        return NextResponse.json(
          { status: false, message: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }
    }

    // Set default values
    const categoryData: Partial<ICategory> = {
      name: body.name,
      slug: body.slug,
      parentId: body.parentId || null,
      color: body.color || '#3B82F6',
      sortOrder: body.sortOrder || 0,
      isFeatured: body.isFeatured || false,
      isActive: body.isActive !== undefined ? body.isActive : true
    };

    // Optional fields
    if (body.description) categoryData.description = body.description;
    if (body.icon) categoryData.icon = body.icon;
    if (body.metaTitle) categoryData.metaTitle = body.metaTitle;
    if (body.metaDescription) categoryData.metaDescription = body.metaDescription;
    if (body.createdBy) categoryData.createdBy = new mongoose.Types.ObjectId(body.createdBy);

    // Create category
    const category = await Category.create(categoryData);
    
    return NextResponse.json({
      status: true,
      message: 'Category created successfully',
      data: category
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Handle duplicate slug error
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