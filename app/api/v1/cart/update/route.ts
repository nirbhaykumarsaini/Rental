import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';
import { authenticate } from '@/app/middlewares/authMiddleware';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { status: false, message: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { status: false, message: 'Quantity must be at least 1' },
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

    const itemIndex = cart.items.findIndex((item: { _id: { toString: () => string; }; }) => item._id.toString() === cartItemId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { status: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Fetch product to check inventory
    const product = await Product.findById(cart.items[itemIndex].productId).lean();
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product no longer exists' },
        { status: 400 }
      );
    }

    // Check inventory for variant products
    if (product.hasVariants && cart.items[itemIndex].variantId) {
      const variant = product.variants.find((v: any) => 
        v._id.toString() === cart.items[itemIndex].variantId
      );
      
      if (variant) {
        if (cart.items[itemIndex].sizeId) {
          const size = variant.sizes.find((s: any) => 
            s._id.toString() === cart.items[itemIndex].sizeId
          );
          
          if (size && size.inventory < quantity) {
            return NextResponse.json(
              { 
                status: false, 
                message: `Only ${size.inventory} items available in stock` 
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Check minimum order quantity
    if (quantity < product.minOrderQuantity) {
      return NextResponse.json(
        { 
          status: false, 
          message: `Minimum order quantity is ${product.minOrderQuantity}` 
        },
        { status: 400 }
      );
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return NextResponse.json({
      status: true,
      message: 'Cart item updated successfully',
      data: {
        cartItemId,
        quantity,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice
      }
    });

  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update cart item' },
      { status: 500 }
    );
  }
}