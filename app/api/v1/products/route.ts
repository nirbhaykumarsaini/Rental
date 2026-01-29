// D:\B2B\app\api\v1\products\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product, { IProduct } from '@/app/models/Product';
import { uploadToCloudinary } from '@/app/utils/cloudinary';
import mongoose from 'mongoose';

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    
    // Extract product data
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const minOrderQuantity = parseInt(formData.get('minOrderQuantity') as string) || 1;
    const hasVariants = formData.get('hasVariants') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const isPublished = formData.get('isPublished') === 'true';
    
    // Handle tags
    const tagsStr = formData.get('tags') as string;
    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()) : [];
    
    // Handle variants JSON
    const variantsStr = formData.get('variants') as string;
    let variants = [];
    if (variantsStr && hasVariants) {
      try {
        variants = JSON.parse(variantsStr);
        
        // Clean variant data - remove empty or invalid _id fields
        variants = variants.map((variant: any, index: number) => {
          // Clean sizes array
          const cleanedSizes = (variant.sizes || []).map((size: any) => {
            // Create clean size object
            const cleanSize: any = {
              size: size.size || '',
              inventory: parseInt(size.inventory) || 0,
              sku: size.sku || '',
              isActive: size.isActive !== false
            };
            
            // Only include _id if it's a valid MongoDB ObjectId
            if (size._id && size._id !== '' && mongoose.Types.ObjectId.isValid(size._id)) {
              cleanSize._id = new mongoose.Types.ObjectId(size._id);
            } else if (size._id === '' || size._id === null || size._id === undefined) {
              // Remove empty _id - let MongoDB generate it
              delete size._id;
            }
            
            return cleanSize;
          }).filter((size: any) => size.size && size.sku); // Filter out incomplete sizes
          
          return {
            color: variant.color || `Color ${index + 1}`,
            colorCode: variant.colorCode || '#000000',
            images: variant.images || [],
            price: parseFloat(variant.price) || 0,
            compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
            sizes: cleanedSizes,
            isActive: variant.isActive !== false
          };
        }).filter((variant: { color: any; colorCode: any; }) => variant.color && variant.colorCode); // Filter out incomplete variants
      } catch (error) {
        console.error('Error parsing variants:', error);
        variants = [];
      }
    }
    
    // Handle main images upload
    const mainImages = formData.getAll('mainImages') as File[];
    const uploadedMainImages: string[] = [];
    
    for (const image of mainImages) {
      if (image.size > 0) {
        try {
          const uploaded = await uploadToCloudinary(image, 'products');
          uploadedMainImages.push(uploaded.secure_url);
        } catch (uploadError) {
          console.error('Error uploading main image:', uploadError);
        }
      }
    }
    
    // Handle variant images (if any)
    if (hasVariants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variantImages = formData.getAll(`variantImages_${i}`) as File[];
        const uploadedVariantImages: string[] = [];
        
        for (const image of variantImages) {
          if (image.size > 0) {
            try {
              const uploaded = await uploadToCloudinary(image, 'products/variants');
              uploadedVariantImages.push(uploaded.secure_url);
            } catch (uploadError) {
              console.error('Error uploading variant image:', uploadError);
            }
          }
        }
        
        if (uploadedVariantImages.length > 0) {
          variants[i].images = uploadedVariantImages;
        }
      }
    }
    
    // Validate required data
    if (!name || !slug || !category || !description) {
      return NextResponse.json(
        { status: false, message: 'Name, slug, category, and description are required' },
        { status: 400 }
      );
    }
    
    if (uploadedMainImages.length === 0) {
      return NextResponse.json(
        { status: false, message: 'At least one main image is required' },
        { status: 400 }
      );
    }
    
    // Create product object
    const productData: Partial<IProduct> = {
      slug: slug.toLowerCase().trim(),
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      minOrderQuantity: Math.max(1, minOrderQuantity),
      images: uploadedMainImages,
      tags: tags.filter(tag => tag.length > 0),
      hasVariants,
      variants: hasVariants ? variants : [],
      isFeatured,
      isPublished,
      status: 'draft'
    };
    
    // Set main image
    if (uploadedMainImages.length > 0) {
      productData.mainImage = uploadedMainImages[0];
    }
    
    // Additional optional fields
    const weight = formData.get('weight') as string;
    if (weight && !isNaN(parseFloat(weight))) {
      productData.weight = parseFloat(weight);
    }
    
    // Handle dimensions
    const length = formData.get('dimensions.length') as string;
    const width = formData.get('dimensions.width') as string;
    const height = formData.get('dimensions.height') as string;
    
    if (length && width && height && 
        !isNaN(parseFloat(length)) && 
        !isNaN(parseFloat(width)) && 
        !isNaN(parseFloat(height))) {
      productData.dimensions = {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height)
      };
    }
    
    // Log cleaned data for debugging
    console.log('Cleaned product data:', JSON.stringify({
      ...productData,
      variants: productData.variants?.map(v => ({
        ...v,
        sizes: v.sizes?.map(s => ({
          size: s.size,
          inventory: s.inventory,
          sku: s.sku,
          isActive: s.isActive
          // _id intentionally omitted for clarity
        }))
      }))
    }, null, 2));
    
    // Create product
    const product = await Product.create(productData);
    
    return NextResponse.json({
      status: true,
      message: 'Product created successfully',
      data: product
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { status: false, message: 'Product slug already exists' },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { status: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    
    // Handle cast errors (including the _id cast error)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { status: false, message: `Invalid data format: ${error.message}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}


// GET - Fetch all products with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      query['variants.price'] = {};
      if (minPrice) query['variants.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['variants.price'].$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      status: true,
      data: products,
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

