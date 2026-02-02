import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Cart from '@/app/models/Cart';
import { authenticate } from '@/app/middlewares/authMiddleware';
import mongoose from 'mongoose';

// GET - Get user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    // Find user's cart with populated product info
    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'name slug images variants isPublished status minOrderQuantity',
        model: 'Product'
      })
      .lean();

    if (!cart) {
      return NextResponse.json({
        status: true,
        data: {
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      });
    }

    // Validate cart items (check if products are still available)
    const validatedItems = cart.items.map((item: any) => {
      const product = item.productId;
      const isProductAvailable = product && 
        product.isPublished && 
        product.status === 'in-stock';

      let isVariantAvailable = true;
      if (item.variantId) {
        const variant = product.variants?.find((v: any) => v._id.toString() === item.variantId);
        if (!variant || !variant.isActive) {
          isVariantAvailable = false;
        }
        
        if (item.sizeId) {
          const size = variant?.sizes?.find((s: any) => s._id.toString() === item.sizeId);
          if (!size || !size.isActive || size.inventory < item.quantity) {
            isVariantAvailable = false;
          }
        }
      }

      return {
        ...item,
        isAvailable: isProductAvailable && isVariantAvailable,
        product: product ? {
          name: product.name,
          slug: product.slug,
          images: product.images,
          status: product.status,
          minOrderQuantity: product.minOrderQuantity
        } : null
      };
    });

    return NextResponse.json({
      status: true,
      data: {
        ...cart,
        items: validatedItems
      }
    });

  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    const result = await Cart.findOneAndDelete({ userId });
    
    return NextResponse.json({
      status: true,
      message: result ? 'Cart cleared successfully' : 'Cart was already empty'
    });

  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    const body = await request.json();
    
    const { productId, variantId, sizeId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { status: false, message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Here you would fetch the product to get its details
    // This is a simplified version - you should add proper product fetching logic
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId &&
      item.variantId === variantId &&
      item.sizeId === sizeId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        variantId,
        sizeId,
        quantity,
        price: 0, // You should fetch the actual price from the product
        name: '', // You should fetch the actual name from the product
        color: '', // You should fetch from variant
        size: '', // You should fetch from size
        image: '' // You should fetch from product/variant
      });
    }

    await cart.save();

    return NextResponse.json({
      status: true,
      message: 'Item added to cart successfully',
      data: cart
    });

  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}