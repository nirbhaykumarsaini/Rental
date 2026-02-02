import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Cart from '@/app/models/Cart';
import { authenticate } from '@/app/middlewares/authMiddleware';
import Product from '@/app/models/Product';

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
        model: Product
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
    const validatedItems = cart.items.map((item: { productId: string; variantId: string; sizeId: string; quantity: number; }) => {
      const product = item.productId as any;
      const isProductAvailable = product && 
        product.isPublished && 
        product.status === 'in-stock';

      let isVariantAvailable = true;
      if (item.variantId) {
        const variant = product.variants?.find((v: { _id: { toString: () => string; }; }) => v._id.toString() === item.variantId);
        if (!variant || !variant.isActive) {
          isVariantAvailable = false;
        }
        
        if (item.sizeId) {
          const size = variant?.sizes?.find((s: { _id: { toString: () => string; }; }) => s._id.toString() === item.sizeId);
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