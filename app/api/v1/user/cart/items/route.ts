// D:\B2B\app\api\v1\cart\items\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Cart from '@/app/models/Cart';
import { verifyToken } from '@/app/lib/auth/jwt';
import { authenticate } from '@/app/middlewares/authMiddleware';

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const { userId } = await authenticate(request);

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { status: false, message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { status: false, message: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }

    // Find cart
    const cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      return NextResponse.json(
        { status: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item:any) => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { status: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate cart totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.rentalPrice * item.quantity), 0);
    cart.total = cart.subtotal;
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    await cart.save();

    return NextResponse.json({
      status: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      data: cart
    });

  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { status: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Find cart
    const cart = await Cart.findOne({ userId: userId });
    
    if (!cart) {
      return NextResponse.json(
        { status: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove item
    cart.items = cart.items.filter((item:any) => item.productId.toString() !== productId);

    // Recalculate cart totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.rentalPrice * item.quantity), 0);
    cart.total = cart.subtotal;
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    await cart.save();

    return NextResponse.json({
      status: true,
      message: 'Item removed from cart',
      data: cart
    });

  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}