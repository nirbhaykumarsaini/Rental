import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Cart from '@/app/models/Cart';
import { authenticate } from '@/app/middlewares/authMiddleware';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    const body = await request.json();
    const { cartItemId } = body;

    if (!cartItemId) {
      return NextResponse.json(
        { status: false, message: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { status: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item:any) => item._id.toString() !== cartItemId);
    
    if (cart.items.length === initialLength) {
      return NextResponse.json(
        { status: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    await cart.save();

    return NextResponse.json({
      status: true,
      message: 'Item removed from cart successfully',
      data: {
        cartItemId,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice
      }
    });

  } catch (error: any) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}