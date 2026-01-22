import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product from '@/app/models/Product';
import { 
  extractPublicIdsFromProduct, 
  deleteMultipleFromCloudinary,
  getPublicIdFromUrl,
  uploadToCloudinary
} from '@/app/utils/cloudinary';
import mongoose from 'mongoose';

// Type for route params (Next.js 13+ uses Promise)
type RouteParams = Promise<{ id: string }>;

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    await connectDB();
    
    // Await the params Promise in Next.js 13+
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const product = await Product.findById(id).select('-__v').lean();
    
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: true,
      data: product
    });

  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    await connectDB();
    
    // Await the params Promise
    const { id } = await params;
    
    console.log('Updating product ID:', id); // Debug log
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: `Invalid product ID: ${id}` },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Extract updated data
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const minOrderQuantity = parseInt(formData.get('minOrderQuantity') as string) || 1;
    const hasVariants = formData.get('hasVariants') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const isPublished = formData.get('isPublished') === 'true';
    
    // Update basic fields
    product.name = name;
    product.slug = slug;
    product.category = category;
    product.description = description;
    product.minOrderQuantity = minOrderQuantity;
    product.hasVariants = hasVariants;
    product.isFeatured = isFeatured;
    product.isPublished = isPublished;
    
    // Handle tags
    const tagsStr = formData.get('tags') as string;
    if (tagsStr) {
      product.tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // Handle main images
    const mainImages = formData.getAll('images') as File[];
    if (mainImages.length > 0) {
      // Upload new images
      const uploadedMainImages: string[] = [];
      for (const image of mainImages) {
        if (image.size > 0) {
          try {
            const uploaded = await uploadToCloudinary(image, 'products');
            uploadedMainImages.push(uploaded.secure_url);
          } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
          }
        }
      }
      
      // Keep existing images that weren't removed
      const keepImages = formData.get('keepImages') as string;
      const keepImagesArray = keepImages ? keepImages.split(',').filter(img => img) : [];
      product.images = [...keepImagesArray, ...uploadedMainImages];
      
      // Update main image if needed
      if (uploadedMainImages.length > 0 && !product.mainImage) {
        product.mainImage = uploadedMainImages[0];
      }
    }
    
    // Handle variants
    const variantsStr = formData.get('variants') as string;
    if (variantsStr) {
      try {
        const variants = JSON.parse(variantsStr);
        
        // Handle variant images
        for (let i = 0; i < variants.length; i++) {
          const variantImages = formData.getAll(`variantImages_${i}`) as File[];
          if (variantImages.length > 0) {
            const uploadedVariantImages: string[] = [];
            for (const image of variantImages) {
              if (image.size > 0) {
                try {
                  const uploaded = await uploadToCloudinary(image, 'products/variants');
                  uploadedVariantImages.push(uploaded.secure_url);
                } catch (error) {
                  console.error('Error uploading variant image to Cloudinary:', error);
                }
              }
            }
            
            // Keep existing variant images
            const keepVariantImages = formData.get(`keepVariantImages_${i}`) as string;
            const keepVariantImagesArray = keepVariantImages ? keepVariantImages.split(',').filter(img => img) : [];
            variants[i].images = [...keepVariantImagesArray, ...uploadedVariantImages];
          }
        }
        
        product.variants = variants;
      } catch (error) {
        console.error('Error parsing variants JSON:', error);
      }
    }
    
    // Update additional fields
    const subcategory = formData.get('subcategory') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const weight = formData.get('weight') as string;
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (weight !== undefined) product.weight = parseFloat(weight) || undefined;
    if (metaTitle !== undefined) product.metaTitle = metaTitle;
    if (metaDescription !== undefined) product.metaDescription = metaDescription;
    
    // Handle dimensions
    const length = formData.get('dimensions.length') as string;
    const width = formData.get('dimensions.width') as string;
    const height = formData.get('dimensions.height') as string;
    
    if (length && width && height) {
      product.dimensions = {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height)
      };
    } else if (length === '' && width === '' && height === '') {
      product.dimensions = undefined;
    }
    
    // Update status based on inventory if has variants
    if (product.hasVariants && product.variants.length > 0) {
      const totalInventory = product.variants.reduce((total, variant) => {
        return total + (variant.sizes || []).reduce((sum, size) => sum + (size.inventory || 0), 0);
      }, 0);
      
      if (totalInventory === 0) {
        product.status = 'out-of-stock';
      } else if (totalInventory <= 10) {
        product.status = 'low-stock';
      } else {
        product.status = 'in-stock';
      }
    }
    
    await product.save();
    
    return NextResponse.json({
      status: true,
      message: 'Product updated successfully',
      data: product
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
      { 
        status: false, 
        message: error.message || 'Failed to update product',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product by ID with Cloudinary cleanup
export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    await connectDB();
    
    // Await the params Promise
    const { id } = await params;
    
    console.log('Deleting product ID:', id); // Debug log
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: `Invalid product ID: ${id}` },
        { status: 400 }
      );
    }
    
    // Find product first to get image URLs
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Extract all Cloudinary public IDs from the product
    const publicIds = extractPublicIdsFromProduct(product);
    
    // Delete images from Cloudinary if there are any
    if (publicIds.length > 0) {
      try {
        await deleteMultipleFromCloudinary(publicIds);
        console.log(`Deleted ${publicIds.length} images from Cloudinary for product ${id}`);
      } catch (cloudinaryError) {
        console.error('Error deleting images from Cloudinary:', cloudinaryError);
        // Continue with product deletion even if Cloudinary deletion fails
      }
    }
    
    // Delete the product from database
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json({
      status: true,
      message: 'Product deleted successfully',
      deletedImages: publicIds.length
    });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Failed to delete product',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}