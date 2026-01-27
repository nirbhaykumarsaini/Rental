// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Category from '@/app/models/Category';
import Product from '@/app/models/Product';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/app/utils/cloudinary';

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

    // Build query
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
        options: { sort: { name: 1 } }
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

// PUT - Update category with image handling
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { status: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const isActive = formData.get('isActive') === 'true';
    const updatedBy = formData.get('updatedBy') as string;
    const imageFile = formData.get('category_image') as File;
    const removeImage = formData.get('removeImage') === 'true';

    // Update fields
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) {
      // Validate slug
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return NextResponse.json(
          { status: false, message: 'Invalid slug format' },
          { status: 400 }
        );
      }
      
      // Check if slug is already used by another category
      const existingCategory = await Category.findOne({ 
        slug, 
        _id: { $ne: id } 
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { status: false, message: 'Slug is already in use' },
          { status: 409 }
        );
      }
      
      updateData.slug = slug;
    }
    
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Handle image upload/removal
    let oldImagePublicId: string | null = null;
    
    // Delete old image if requested or if uploading new image
    if (removeImage || (imageFile && imageFile.size > 0)) {
      if (category.category_image) {
        oldImagePublicId = getPublicIdFromUrl(category.category_image);
      }
      
      if (removeImage) {
        updateData.category_image = '';
      }
    }
    
    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadResult = await uploadToCloudinary(imageFile, 'categories');
        updateData.category_image = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return NextResponse.json(
          { status: false, message: 'Failed to upload category image' },
          { status: 500 }
        );
      }
    }
    
    if (updatedBy && mongoose.Types.ObjectId.isValid(updatedBy)) {
      updateData.updatedBy = new mongoose.Types.ObjectId(updatedBy);
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    // Delete old image from Cloudinary after successful update
    if (oldImagePublicId && !removeImage) {
      try {
        await deleteFromCloudinary(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old image from Cloudinary:', deleteError);
        // Don't fail the request if image deletion fails
      }
    }

    return NextResponse.json({
      status: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });

  } catch (error: any) {
    console.error('Error updating category:', error);
    
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

// DELETE - Delete category with image cleanup
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

    // Delete image from Cloudinary
    if (category.category_image) {
      const publicId = getPublicIdFromUrl(category.category_image);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
          // Continue with deletion even if image delete fails
        }
      }
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