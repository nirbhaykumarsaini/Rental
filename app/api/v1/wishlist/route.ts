import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Wishlist from '@/app/models/Wishlist';
import Product from '@/app/models/Product';
import { authenticate } from '@/app/middlewares/authMiddleware';
import mongoose from 'mongoose';

// GET - Get user's wishlist with populated product details
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    const wishlist = await Wishlist.findOne({ userId, isDefault: true })
      .populate({
        path: 'items.productId',
        select: 'name slug images price variants hasVariants isPublished status minOrderQuantity category',
        model: 'Product'
      })
      .lean();

    if (!wishlist) {
      return NextResponse.json({
        status: true,
        data: {
          items: [],
          itemCount: 0,
          name: 'My Wishlist',
          isDefault: true
        }
      });
    }

    // Process items to include variant-specific data if needed
    const processedItems = wishlist.items.map((item: any) => {
      const product = item.productId;
      let variant = null;
      let currentPrice = 0;
      let isAvailable = false;
      let images = product?.images || [];

      if (product) {
        // Check if product is available
        isAvailable = product.isPublished && product.status === 'in-stock';

        // Get variant-specific data if variantId exists
        if (item.variantId && product.variants) {
          variant = product.variants.find((v: any) => 
            v._id.toString() === item.variantId
          );
          if (variant) {
            currentPrice = variant.price;
            images = variant.images.length > 0 ? variant.images : images;
          }
        } else {
          // Get base product price (first variant or base price)
          currentPrice = product.variants?.[0]?.price || 0;
        }

        return {
          _id: item._id,
          productId: product._id,
          variantId: item.variantId || null,
          addedAt: item.addedAt,
          note: item.note || '',
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            images,
            price: currentPrice,
            hasVariants: product.hasVariants,
            isPublished: product.isPublished,
            status: product.status,
            isAvailable,
            category: product.category,
            minOrderQuantity: product.minOrderQuantity
          },
          variant: variant ? {
            color: variant.color,
            colorCode: variant.colorCode,
            price: variant.price
          } : null
        };
      }

      return null;
    }).filter(Boolean); // Remove null items

    return NextResponse.json({
      status: true,
      data: {
        ...wishlist,
        items: processedItems
      }
    });

  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    const body = await request.json();
    const { productId, variantId, note } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { status: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { status: false, message: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Check if product exists and is published
    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Optional: Check if variant exists
    if (variantId && product.variants) {
      const variantExists = product.variants.some((v: any) => 
        v._id.toString() === variantId
      );
      if (!variantExists) {
        return NextResponse.json(
          { status: false, message: 'Variant not found' },
          { status: 400 }
        );
      }
    }

    // Find or create default wishlist for user
    let wishlist = await Wishlist.findOne({ userId, isDefault: true });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [],
        name: 'My Wishlist',
        isDefault: true
      });
    }

    // Check if product already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex((item: { productId: { toString: () => any; }; variantId: any; }) => {
      const sameProduct = item.productId.toString() === productId;
      const sameVariant = variantId ? item.variantId === variantId : true;
      return sameProduct && sameVariant;
    });

    if (existingItemIndex > -1) {
      return NextResponse.json(
        { status: false, message: 'Product is already in your wishlist' },
        { status: 409 }
      );
    }

    // Add new item to wishlist
    wishlist.items.push({
      productId: new mongoose.Types.ObjectId(productId),
      variantId: variantId || undefined,
      note: note || undefined,
      addedAt: new Date()
    });

    await wishlist.save();

    return NextResponse.json({
      status: true,
      message: 'Product added to wishlist successfully',
      data: {
        wishlistId: wishlist._id,
        itemCount: wishlist.itemCount,
        addedProductId: productId
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { status: false, message: 'Wishlist constraint violation' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// PUT - Update wishlist item (note, etc.)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
    const body = await request.json();
    const { wishlistItemId, note } = body;

    if (!wishlistItemId) {
      return NextResponse.json(
        { status: false, message: 'Wishlist item ID is required' },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ userId, isDefault: true });
    if (!wishlist) {
      return NextResponse.json(
        { status: false, message: 'Wishlist not found' },
        { status: 404 }
      );
    }

    const itemIndex = wishlist.items.findIndex((item: { _id: { toString: () => any; }; }) => 
      item._id.toString() === wishlistItemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { status: false, message: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    // Update note if provided
    if (note !== undefined) {
      wishlist.items[itemIndex].note = note;
    }

    await wishlist.save();

    return NextResponse.json({
      status: true,
      message: 'Wishlist item updated successfully',
      data: {
        wishlistItemId,
        note: wishlist.items[itemIndex].note
      }
    });

  } catch (error: any) {
    console.error('Error updating wishlist item:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update wishlist item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    
     const body = await request.json();
    const { wishlistItemId } = body;

    if (!wishlistItemId) {
      return NextResponse.json(
        { status: false, message: 'Wishlist item ID is required' },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ userId, isDefault: true });
    if (!wishlist) {
      return NextResponse.json(
        { status: false, message: 'Wishlist not found' },
        { status: 404 }
      );
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter((item: { _id: { toString: () => any; }; }) => 
      item._id.toString() !== wishlistItemId
    );
    
    if (wishlist.items.length === initialLength) {
      return NextResponse.json(
        { status: false, message: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    await wishlist.save();

    return NextResponse.json({
      status: true,
      message: 'Item removed from wishlist successfully',
      data: {
        wishlistItemId,
        itemCount: wishlist.itemCount
      }
    });

  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}