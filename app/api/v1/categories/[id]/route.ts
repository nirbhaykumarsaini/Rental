import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';
import Product from '@/app/models/Product';
import mongoose from 'mongoose';

// GET - Fetch single category by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const withSubcategories = searchParams.get('withSubcategories') === 'true';
    const withProductCount = searchParams.get('withProductCount') === 'true';

    // Build query - check if id is ObjectId or slug
    let query: any;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id) };
    } else {
      query = { slug: id };
    }

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

    const category = await Category.findOne(query)
      .populate(populateOptions)
      .select('-__v')
      .lean();

    if (!category) {
      return NextResponse.json(
        { status: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      data: category
    });

  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { status: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Prevent circular reference
    if (body.parentId && body.parentId === id) {
      return NextResponse.json(
        { status: false, message: 'Category cannot be its own parent' },
        { status: 400 }
      );
    }

    // Validate parent category exists if changing parent
    if (body.parentId && body.parentId !== category.parentId?.toString()) {
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
    }

    // Update fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.parentId !== undefined) updateData.parentId = body.parentId || null;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.updatedBy !== undefined) updateData.updatedBy = new mongoose.Types.ObjectId(body.updatedBy);

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('subCategories');

    return NextResponse.json({
      status: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });

  } catch (error: any) {
    console.error('Error updating category:', error);
    
    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { status: false, message: 'Category slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { status: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has subcategories
    const subcategories = await Category.countDocuments({ parentId: id });
    if (subcategories > 0) {
      return NextResponse.json(
        { 
          status: false, 
          message: 'Cannot delete category that has subcategories. Please delete subcategories first or reassign them.' 
        },
        { status: 400 }
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return NextResponse.json(
        { 
          status: false, 
          message: 'Cannot delete category that has products. Please reassign products first.' 
        },
        { status: 400 }
      );
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      status: true,
      message: 'Category deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}