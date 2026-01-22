import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product, { IProduct } from '@/app/models/Product';
import { uploadToCloudinary } from '@/app/utils/cloudinary';


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
    if (variantsStr) {
      variants = JSON.parse(variantsStr);
    }
    
    // Handle main images upload
    const mainImages = formData.getAll('mainImages') as File[];
    const uploadedMainImages: string[] = [];
    
    for (const image of mainImages) {
      if (image.size > 0) {
        const uploaded = await uploadToCloudinary(image, 'products');
        uploadedMainImages.push(uploaded.secure_url);
      }
    }
    
    // Handle variant images (if any)
    if (hasVariants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variantImages = formData.getAll(`variantImages_${i}`) as File[];
        const uploadedVariantImages: string[] = [];
        
        for (const image of variantImages) {
          if (image.size > 0) {
            const uploaded = await uploadToCloudinary(image, 'products/variants');
            uploadedVariantImages.push(uploaded.secure_url);
          }
        }
        
        if (uploadedVariantImages.length > 0) {
          variants[i].images = uploadedVariantImages;
        }
      }
    }
    
    // Create product object
    const productData: Partial<IProduct> = {
      slug,
      name,
      category,
      description,
      minOrderQuantity,
      images: uploadedMainImages,
      tags,
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
    const subcategory = formData.get('subcategory') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const weight = formData.get('weight') as string;
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    
    if (subcategory) productData.subcategory = subcategory;
    if (shortDescription) productData.shortDescription = shortDescription;
    if (weight) productData.weight = parseFloat(weight);
    if (metaTitle) productData.metaTitle = metaTitle;
    if (metaDescription) productData.metaDescription = metaDescription;
    
    // Handle dimensions
    const length = formData.get('dimensions.length') as string;
    const width = formData.get('dimensions.width') as string;
    const height = formData.get('dimensions.height') as string;
    
    if (length && width && height) {
      productData.dimensions = {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height)
      };
    }
    
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
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}