import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import { authenticate } from "@/app/middlewares/authMiddleware";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);

    const body = await request.json();
    const { productId, variantId, sizeId, quantity = 1 } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { status: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { status: false, message: "Invalid product ID format" },
        { status: 400 },
      );
    }

    // Fetch product with inventory details
    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json(
        { status: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Check if product is available
    if (!product.isPublished || product.status !== "in-stock") {
      return NextResponse.json(
        { status: false, message: "Product is not available" },
        { status: 400 },
      );
    }

    let selectedVariant: any = null;
    let selectedSize: any = null;
    let price = 0;
    let color = "";
    let size = "";
    let image = product.images[0];

    // Handle variant selection
    if (product.hasVariants && product.variants.length > 0) {
      if (!variantId) {
        return NextResponse.json(
          {
            status: false,
            message: "Variant selection is required for this product",
          },
          { status: 400 },
        );
      }

      selectedVariant = product.variants.find(
        (v: any) => v._id.toString() === variantId,
      );
      if (!selectedVariant || !selectedVariant.isActive) {
        return NextResponse.json(
          { status: false, message: "Selected variant is not available" },
          { status: 400 },
        );
      }

      // Handle size selection
      if (selectedVariant.sizes && selectedVariant.sizes.length > 0) {
        if (!sizeId) {
          return NextResponse.json(
            {
              status: false,
              message: "Size selection is required for this variant",
            },
            { status: 400 },
          );
        }

        selectedSize = selectedVariant.sizes.find(
          (s: any) => s._id.toString() === sizeId,
        );
        if (!selectedSize || !selectedSize.isActive) {
          return NextResponse.json(
            { status: false, message: "Selected size is not available" },
            { status: 400 },
          );
        }

        // Check inventory
        if (selectedSize.inventory < quantity) {
          return NextResponse.json(
            {
              status: false,
              message: `Only ${selectedSize.inventory} items available in stock`,
            },
            { status: 400 },
          );
        }

        size = selectedSize.size;
      }

      price = selectedVariant.price;
      color = selectedVariant.color;
      image = selectedVariant.images[0] || product.images[0];
    } else {
      // For non-variant products
      price = product.variants?.[0]?.price || 0;
      if (price === 0) {
        return NextResponse.json(
          { status: false, message: "Product price not found" },
          { status: 400 },
        );
      }

      // Check minimum order quantity
      if (quantity < product.minOrderQuantity) {
        return NextResponse.json(
          {
            status: false,
            message: `Minimum order quantity is ${product.minOrderQuantity}`,
          },
          { status: 400 },
        );
      }
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => {
      if (product.hasVariants) {
        return (
          item.productId.toString() === productId &&
          item.variantId === variantId &&
          item.sizeId === sizeId
        );
      }
      return item.productId.toString() === productId;
    });

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check inventory again for updated quantity
      if (selectedSize && selectedSize.inventory < newQuantity) {
        return NextResponse.json(
          {
            status: false,
            message: `Only ${selectedSize.inventory} items available in stock`,
          },
          { status: 400 },
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        variantId: variantId || undefined,
        sizeId: sizeId || undefined,
        quantity,
        price,
        name: product.name,
        color: color || undefined,
        size: size || undefined,
        image: image || undefined,
      });
    }

    await cart.save();

    return NextResponse.json(
      {
        status: true,
        message: "Item added to cart successfully",
        data: {
          cartId: cart._id,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error adding item to cart:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          status: false,
          message:
            "Validation error: " +
            Object.values(error.errors)
              .map((e: any) => e.message)
              .join(", "),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { status: false, message: error.message || "Failed to add item to cart" },
      { status: 500 },
    );
  }
}
