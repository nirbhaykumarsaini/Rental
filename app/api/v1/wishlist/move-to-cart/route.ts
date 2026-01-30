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
        (item: { _id: { toString: () => any; }; }) => item._id.toString() === wishlistItemId,
      );

      if (itemIndex === -1) {
        throw new Error("Wishlist item not found");
      }

      const wishlistItem = wishlist.items[itemIndex];

      // Get product details for cart
      const product = await Product.findById(wishlistItem.productId).session(
        session,
      );
      if (!product) {
        throw new Error("Product not found");
      }

      if (!product.isPublished || product.status !== "in-stock") {
        throw new Error("Product is not available for purchase");
      }

      // Prepare cart item data
      let price = 0;
      let color = "";
      let image = product.images[0];

      // Convert wishlistItem.variantId to string for comparison
      const variantIdString = wishlistItem.variantId?.toString();

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
        }
      } else if (product.hasVariants && product.variants && product.variants.length > 0) {
        // No variant specified or no variantId, use first variant
        price = product.variants[0].price || 0;
        color = product.variants[0].color || "";
        image = (product.variants[0].images && product.variants[0].images.length > 0) 
          ? product.variants[0].images[0] 
          : image;
      } else {
        // Product without variants
        price = product.price || 0;
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

      // Check if item already exists in cart
      const existingCartItemIndex = cart.items.findIndex(
        (item: { productId: { toString: () => string; }; variantId: string; }) =>
          item.productId.toString() === wishlistItem.productId.toString() &&
          (item.variantId === variantIdString || (!item.variantId && !variantIdString))
      );

      if (existingCartItemIndex > -1) {
        // Update quantity if already in cart
        cart.items[existingCartItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          productId: wishlistItem.productId,
          variantId: variantIdString || undefined,
          quantity,
          price,
          name: product.name,
          color: color || undefined,
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
      error.message.includes("not available")
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
