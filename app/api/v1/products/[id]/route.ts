import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Product, {
  IProductVariant,
  IProductVariantSize,
} from "@/app/models/Product";
import {
  extractPublicIdsFromProduct,
  deleteMultipleFromCloudinary,
  uploadToCloudinary,
} from "@/app/utils/cloudinary";
import mongoose from "mongoose";

// Type for route params (Next.js 13+ uses Promise)
type RouteParams = Promise<{ id: string }>;

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams },
) {
  try {
    await connectDB();

    // Await the params Promise in Next.js 13+
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id).select("-__v").lean();

    if (!product) {
      return NextResponse.json(
        { status: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const existingProduct = await Product.findById((await params).id);
    
    if (!existingProduct) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Extract and update fields
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;
    const colorCode = formData.get('colorCode') as string;
    const price = parseFloat(formData.get('price') as string) || existingProduct.price;
    const compareAtPrice = formData.get('compareAtPrice') 
      ? parseFloat(formData.get('compareAtPrice') as string) 
      : existingProduct.compareAtPrice;
    
    const isAvailable = formData.get('isAvailable') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const isNewArrival = formData.get('isNewArrival') === 'true';
    const isPublished = formData.get('isPublished') === 'true';
    
    // Parse JSON arrays
    let sizes: string[] = [];
    try {
      sizes = JSON.parse(formData.get('sizes') as string) || existingProduct.sizes;
    } catch (error) {
      sizes = existingProduct.sizes;
    }
    
    let features: any[] = [];
    try {
      features = JSON.parse(formData.get('features') as string) || existingProduct.features;
    } catch (error) {
      features = existingProduct.features;
    }
    
    let rentalPrices: any[] = [];
    try {
      rentalPrices = JSON.parse(formData.get('rentalPrices') as string) || existingProduct.rentalPrices;
    } catch (error) {
      rentalPrices = existingProduct.rentalPrices;
    }
    
    // Handle images
    const productImages = formData.getAll('images') as File[];
    const keepImages = formData.get('keepImages') as string;
    
    let uploadedImages: string[] = [];
    
    // Add kept images
    if (keepImages) {
      uploadedImages = keepImages.split(',');
    } else {
      // Keep existing images if not specified
      uploadedImages = existingProduct.images || [];
    }
    
    // Upload new images
    for (const image of productImages) {
      if (image.size > 0) {
        try {
          const uploaded = await uploadToCloudinary(image, 'products');
          uploadedImages.push(uploaded.secure_url);
        } catch (uploadError) {
          console.error('Error uploading product image:', uploadError);
        }
      }
    }
    
    // Calculate discount percentage
    let discountPercentage;
    if (compareAtPrice && compareAtPrice > price) {
      discountPercentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100 * 10) / 10;
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        slug: slug?.toLowerCase().trim(),
        category,
        description,
        images: uploadedImages,
        color,
        colorCode,
        price,
        compareAtPrice,
        discountPercentage,
        sizes,
        features,
        rentalPrices,
        isAvailable,
        isFeatured,
        isNewArrival,
        isPublished,
        status: isPublished 
          ? (isAvailable ? 'available' : 'unavailable') 
          : 'draft'
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      status: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
    
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { status: false, message: 'Product slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const product = await Product.findByIdAndDelete((await params).id);
    
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
