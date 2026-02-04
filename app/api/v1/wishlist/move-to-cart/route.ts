import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Wishlist from "@/app/models/Wishlist";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import { authenticate } from "@/app/middlewares/authMiddleware";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);

    const body = await request.json();
    const { wishlistItemId, quantity = 1 } = body;

    if (!wishlistItemId) {
      return NextResponse.json(
        { status: false, message: "Wishlist item ID is required" },
        { status: 400 },
      );
    }

    // Start a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the wishlist item
      const wishlist = await Wishlist.findOne({
        userId,
        isDefault: true,
      }).session(session);
      if (!wishlist) {
        throw new Error("Wishlist not found");
      }

      const itemIndex = wishlist.items.findIndex(
        (item: { _id: { toString: () => any } }) =>
          item._id.toString() === wishlistItemId,
      );

      if (itemIndex === -1) {
        throw new Error("Wishlist item not found");
      }

      const wishlistItem = wishlist.items[itemIndex];

      // Get product details for cart - convert to plain object
      const productDoc = await Product.findById(wishlistItem.productId).session(
        session,
      );
      if (!productDoc) {
        throw new Error("Product not found");
      }

      // Convert to plain object to work with the interface
      const product = productDoc.toObject() as any;

      if (!product.isPublished || product.status !== "in-stock") {
        throw new Error("Product is not available for purchase");
      }

      // Prepare cart item data
      let price = 0;
      let color = "";
      let size = "";
      let image = product.images[0];
      
      // Convert IDs to strings for comparison
      const variantIdString = wishlistItem.variantId?.toString();
      const sizeIdString = wishlistItem.sizeId?.toString();

      if (variantIdString && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v: any) => {
          if (!v._id) return false;
          // Compare both as strings to handle ObjectId vs string comparison
          const vIdStr = v._id.toString ? v._id.toString() : String(v._id);
          return vIdStr === variantIdString;
        });

        if (variant) {
          price = variant.price || 0;
          color = variant.color || "";
          image = (variant.images && variant.images.length > 0) ? variant.images[0] : image;
          
          // Find size if sizeId is provided
          if (sizeIdString && variant.sizes && variant.sizes.length > 0) {
            const sizeObj = variant.sizes.find((s: any) => {
              if (!s._id) return false;
              const sIdStr = s._id.toString ? s._id.toString() : String(s._id);
              return sIdStr === sizeIdString;
            });
            
            if (sizeObj) {
              size = sizeObj.value || "";
            }
          }
        }
      } else if (product.hasVariants && product.variants && product.variants.length > 0) {
        // No variant specified or no variantId, use first variant
        const firstVariant = product.variants[0];
        price = firstVariant.price || 0;
        color = firstVariant.color || "";
        image = (firstVariant.images && firstVariant.images.length > 0)
          ? firstVariant.images[0]
          : image;
          
        // Find size if sizeId is provided
        if (sizeIdString && firstVariant.sizes && firstVariant.sizes.length > 0) {
          const sizeObj = firstVariant.sizes.find((s: any) => {
            if (!s._id) return false;
            const sIdStr = s._id.toString ? s._id.toString() : String(s._id);
            return sIdStr === sizeIdString;
          });
          
          if (sizeObj) {
            size = sizeObj.value || "";
          }
        }
      } else {
        // Product without variants - but your schema doesn't have a root price field
        // So if there are no variants, we can't get a price
        // This should not happen if hasVariants is false and variants array is empty
        throw new Error("Product has no variants and no base price available");
      }

      if (price === 0) {
        throw new Error("Could not determine product price");
      }

      // Find or create cart
      let cart = await Cart.findOne({ userId }).session(session);
      if (!cart) {
        cart = await Cart.create(
          [
            {
              userId,
              items: [],
            },
          ],
          { session },
        );
        cart = cart[0];
      }

      // Check if item already exists in cart with same variantId AND sizeId
      const existingCartItemIndex = cart.items.findIndex(
        (item: {
          productId: { toString: () => string };
          variantId?: string;
          sizeId?: string;
        }) => {
          // Compare productId
          const sameProduct = item.productId.toString() === wishlistItem.productId.toString();
          
          // Compare variantId (both could be undefined or null)
          const sameVariant = 
            (item.variantId === variantIdString) || 
            (!item.variantId && !variantIdString);
          
          // Compare sizeId (both could be undefined or null)
          const sameSize = 
            (item.sizeId === sizeIdString) || 
            (!item.sizeId && !sizeIdString);
          
          return sameProduct && sameVariant && sameSize;
        }
      );

      if (existingCartItemIndex > -1) {
        // Update quantity if already in cart
        cart.items[existingCartItemIndex].quantity += quantity;
      } else {
        // Add new item to cart with both variantId and sizeId
        cart.items.push({
          productId: wishlistItem.productId,
          variantId: variantIdString || undefined,
          sizeId: sizeIdString || undefined,
          quantity,
          price,
          name: product.name,
          color: color || undefined,
          size: size || undefined,
          image: image || undefined,
        });
      }

      // Remove from wishlist
      wishlist.items.splice(itemIndex, 1);

      // Save both documents
      await cart.save({ session });
      await wishlist.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        status: true,
        message: "Item moved to cart successfully",
        data: {
          cartItemId:
            existingCartItemIndex > -1
              ? cart.items[existingCartItemIndex]._id
              : cart.items[cart.items.length - 1]._id,
          wishlistItemId,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          wishlistItemCount: wishlist.itemCount,
        },
      });
    } catch (error: any) {
      // Rollback transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error("Error moving item to cart:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("not available") ||
      error.message.includes("no variants") ||
      error.message.includes("Could not determine")
    ) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        status: false,
        message: error.message || "Failed to move item to cart",
      },
      { status: 500 },
    );
  }
}