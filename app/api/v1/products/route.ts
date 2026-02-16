// D:\B2B\app\api\v1\products\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Product from '@/app/models/Product';
import { uploadToCloudinary } from '@/app/utils/cloudinary';

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    
    // Extract basic product data
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;
    const colorCode = formData.get('colorCode') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const compareAtPrice = formData.get('compareAtPrice') 
      ? parseFloat(formData.get('compareAtPrice') as string) 
      : undefined;
    
    // Boolean fields
    const isAvailable = formData.get('isAvailable') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const isNewArrival = formData.get('isNewArrival') === 'true';
    const isPublished = formData.get('isPublished') === 'true';
    
    // Parse JSON arrays
    let sizes: string[] = [];
    try {
      sizes = JSON.parse(formData.get('sizes') as string) || [];
    } catch (error) {
      console.error('Error parsing sizes:', error);
      sizes = [];
    }
    
    let features: any[] = [];
    try {
      features = JSON.parse(formData.get('features') as string) || [];
    } catch (error) {
      console.error('Error parsing features:', error);
      features = [];
    }
    
    let rentalPrices: any[] = [];
    try {
      rentalPrices = JSON.parse(formData.get('rentalPrices') as string) || [];
    } catch (error) {
      console.error('Error parsing rental prices:', error);
      rentalPrices = [];
    }
    
    // Handle product images
    const productImages = formData.getAll('images') as File[];
    const keepImages = formData.get('keepImages') as string;
    
    let uploadedImages: string[] = [];
    
    // Add kept images
    if (keepImages) {
      uploadedImages = keepImages.split(',');
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
    
    // Validate required fields
    if (!name || !slug || !category || !description) {
      return NextResponse.json(
        { status: false, message: 'Name, slug, category, and description are required' },
        { status: 400 }
      );
    }
    
    if (!color) {
      return NextResponse.json(
        { status: false, message: 'Color is required' },
        { status: 400 }
      );
    }
    
    if (!price || price <= 0) {
      return NextResponse.json(
        { status: false, message: 'Valid price is required' },
        { status: 400 }
      );
    }
    
    if (sizes.length === 0) {
      return NextResponse.json(
        { status: false, message: 'At least one size is required' },
        { status: 400 }
      );
    }
    
    if (features.length === 0) {
      return NextResponse.json(
        { status: false, message: 'At least one feature is required' },
        { status: 400 }
      );
    }
    
    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { status: false, message: 'At least one product image is required' },
        { status: 400 }
      );
    }
    
    // Filter active rental prices
    const activeRentalPrices = rentalPrices.filter(rp => rp.isActive);
    if (activeRentalPrices.length === 0) {
      return NextResponse.json(
        { status: false, message: 'At least one active rental price is required' },
        { status: 400 }
      );
    }
    
    // Calculate discount percentage if compareAtPrice exists
    let discountPercentage;
    if (compareAtPrice && compareAtPrice > price) {
      discountPercentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100 * 10) / 10;
    }
    
    // Determine status based on publish and availability
    let status: 'draft' | 'available' | 'unavailable' | 'archived' = 'draft';
    if (isPublished) {
      status = isAvailable ? 'available' : 'unavailable';
    }
    
    // Create product object
    const productData = {
      slug: slug.toLowerCase().trim(),
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      images: uploadedImages,
      color: color.trim(),
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
      status // This now matches the enum values
    };
    
    // Create product
    const product = await Product.create(productData);
    
    return NextResponse.json({
      status: true,
      message: 'Product created successfully',
      data: product
    }, { status: 200 });

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
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

// GET - Fetch all products with filters (updated status values)
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
    const newArrival = searchParams.get('newArrival');
    const available = searchParams.get('available');
    const color = searchParams.get('color');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sizes = searchParams.get('sizes')?.split(',');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      // Map status values if needed
      if (status === 'in-stock' || status === 'low-stock' || status === 'out-of-stock') {
        // For backward compatibility, map to new status values
        if (status === 'in-stock') query.status = 'available';
        else if (status === 'out-of-stock') query.status = 'unavailable';
        // Skip low-stock as it doesn't exist in new schema
      } else {
        query.status = status;
      }
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (newArrival === 'true') {
      query.isNewArrival = true;
    }

    if (available === 'true') {
      query.isAvailable = true;
      query.isPublished = true;
      query.status = 'available';
    }

    if (color) {
      query.color = { $regex: color, $options: 'i' };
    }

    if (sizes && sizes.length > 0) {
      query.sizes = { $in: sizes };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } }
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

// GET product by ID
export async function GET_byId(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id).lean();
    
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

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const existingProduct = await Product.findById(params.id);
    
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
    
    const product = await Product.findByIdAndDelete(params.id);
    
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

// GET product by slug
export async function GET_bySlug(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    
    const product = await Product.findOne({ slug: params.slug }).lean();
    
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
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// GET product statistics
export async function GET_statistics(request: NextRequest) {
  try {
    await connectDB();
    
    const [
      totalProducts,
      available,
      unavailable,
      featured,
      newArrivals,
      draftCount,
      byCategory
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true, isPublished: true }),
      Product.countDocuments({ isAvailable: false, isPublished: true }),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({ isNewArrival: true }),
      Product.countDocuments({ status: 'draft' }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    const categoryStats: Record<string, number> = {};
    byCategory.forEach((item: any) => {
      categoryStats[item._id] = item.count;
    });
    
    return NextResponse.json({
      status: true,
      data: {
        totalProducts,
        available,
        unavailable,
        featured,
        newArrivals,
        draftCount,
        byCategory: categoryStats
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}