// D:\B2B\app\api\v1\cart\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';
import { verifyToken } from '@/app/lib/auth/jwt';
import { authenticate } from '@/app/middlewares/authMiddleware';

// GET - Get user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const { userId } = await authenticate(request);

    // Find or create cart for user
    let cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      cart = await Cart.create({
        userId: userId,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0
      });
    }

    return NextResponse.json({
      status: true,
      data: cart
    });

  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const { userId } = await authenticate(request);

    const body = await request.json();
    const { 
      productId, 
      name, 
      image, 
      rentalDays, 
      rentalPrice,
      startDate,
      endDate,
      selectedSize,
      selectedColor,
      measurements,
      quantity = 1 
    } = body;

    // Validate required fields
    if (!productId || !rentalDays || !rentalPrice || !startDate || !endDate) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.isAvailable || !product.isPublished) {
      return NextResponse.json(
        { status: false, message: 'Product is not available' },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0
      });
    }

    // Check if item already exists in cart (same product, size, dates)
    const existingItemIndex = cart.items.findIndex((item:any) => 
      item.productId.toString() === productId &&
      item.selectedSize === selectedSize &&
      item.startDate === startDate &&
      item.endDate === endDate
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name: name || product.name,
        slug: product.slug,
        image: image || product.images[0],
        price: product.price,
        rentalDays,
        rentalPrice,
        startDate,
        endDate,
        selectedSize,
        selectedColor: selectedColor || product.color,
        measurements,
        quantity
      });
    }

    // Recalculate cart totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.rentalPrice * item.quantity), 0);
    cart.total = cart.subtotal; // Add tax/discount logic if needed
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    await cart.save();

    return NextResponse.json({
      status: true,
      message: 'Item added to cart',
      data: cart
    });

  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}