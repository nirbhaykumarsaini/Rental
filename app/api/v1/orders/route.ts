import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import Address from "@/app/models/Address";
import { authenticate } from "@/app/middlewares/authMiddleware";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/app/models/Order";

// POST - Create new order (Cash on Delivery)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await authenticate(request);
    const body = await request.json();

    const {
      addressId,
      shippingCharge = 0,
      discount = 0,
      tax = 0,
      notes,
      useBillingAddress = false,
      billingAddressId,
      items, // Array of cart item IDs to purchase
    } = body;

    // Validate required fields
    if (!addressId) {
      throw new Error("Shipping address ID is required");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Please select at least one item to purchase");
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Filter cart items based on requested items
    const cartItemsToPurchase = cart.items.filter(
      (item: { _id: { toString: () => any } }) =>
        items.includes(item._id.toString()),
    );

    if (cartItemsToPurchase.length === 0) {
      throw new Error("No valid items selected for purchase");
    }

    // Validate all requested items exist in cart
    const requestedIds = new Set(items);
    const foundIds = new Set(
      cartItemsToPurchase.map((item: { _id: { toString: () => any } }) =>
        item._id.toString(),
      ),
    );

    const missingItems = items.filter((id) => !foundIds.has(id));
    if (missingItems.length > 0) {
      throw new Error(
        `Some items not found in cart: ${missingItems.join(", ")}`,
      );
    }

    // Get shipping address
    const shippingAddressDoc = await Address.findOne({
      _id: addressId,
      userId,
    }).lean();

    if (!shippingAddressDoc) {
      throw new Error("Shipping address not found");
    }

    // Get billing address (if different from shipping)
    let billingAddress = shippingAddressDoc;
    if (useBillingAddress && billingAddressId) {
      const billingAddressDoc = await Address.findOne({
        _id: billingAddressId,
        userId,
      }).lean();

      if (billingAddressDoc) {
        billingAddress = billingAddressDoc;
      }
    }

    // Prepare order items and validate inventory
    const orderItems = [];
    const inventoryUpdates = [];

    for (const cartItem of cartItemsToPurchase) {
      const product = await Product.findById(cartItem.productId).lean();

      if (!product) {
        throw new Error(`Product ${cartItem.name} is no longer available`);
      }

      if (!product.isPublished || product.status !== "in-stock") {
        throw new Error(
          `Product ${cartItem.name} is not available for purchase`,
        );
      }

      // Check if variant selection is required
      if (product.hasVariants) {
        if (!cartItem.variantId) {
          throw new Error(`Please select a variant for ${cartItem.name}`);
        }

        const variant = product.variants.find(
          (v: any) => v._id.toString() === cartItem.variantId,
        );

        if (!variant || !variant.isActive) {
          throw new Error(
            `Selected variant for ${cartItem.name} is not available`,
          );
        }

        // Check size selection if variant has sizes
        if (variant.sizes && variant.sizes.length > 0) {
          if (!cartItem.sizeId) {
            throw new Error(`Please select a size for ${cartItem.name}`);
          }

          const size = variant.sizes.find(
            (s: any) => s._id.toString() === cartItem.sizeId,
          );

          if (!size || !size.isActive) {
            throw new Error(
              `Selected size for ${cartItem.name} is not available`,
            );
          }

          if (size.inventory < cartItem.quantity) {
            throw new Error(
              `Only ${size.inventory} items available for ${cartItem.name} (${size.size})`,
            );
          }

          // Track inventory update
          inventoryUpdates.push({
            productId: product._id,
            variantId: cartItem.variantId,
            sizeId: cartItem.sizeId,
            quantity: cartItem.quantity,
          });
        }
      } else {
        // For non-variant products, check overall inventory
        if (product.totalInventory < cartItem.quantity) {
          throw new Error(
            `Only ${product.totalInventory} items available for ${cartItem.name}`,
          );
        }
      }

      // Validate minimum order quantity
      if (cartItem.quantity < product.minOrderQuantity) {
        throw new Error(
          `Minimum order quantity for ${cartItem.name} is ${product.minOrderQuantity}`,
        );
      }

      // Create order item
      orderItems.push({
        productId: cartItem.productId,
        productName: cartItem.name || product.name,
        productSlug: product.slug,
        variantId: cartItem.variantId || undefined,
        sizeId: cartItem.sizeId || undefined,
        color: cartItem.color || undefined,
        size: cartItem.size || undefined,
        sku: cartItem.sku || undefined,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
        totalPrice: cartItem.price * cartItem.quantity,
        image: cartItem.image || product.images[0],
      });
    }

    // Update inventory for all items
    for (const update of inventoryUpdates) {
      await Product.updateOne(
        {
          _id: update.productId,
          "variants._id": update.variantId,
          "variants.sizes._id": update.sizeId,
        },
        {
          $inc: { "variants.$.sizes.$[size].inventory": -update.quantity },
        },
        {
          arrayFilters: [{ "size._id": update.sizeId }],
        },
      );
    }

    // Calculate subtotal from selected items
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create shipping address object
    const shippingAddress = {
      first_name: shippingAddressDoc.first_name,
      last_name: shippingAddressDoc.last_name,
      address: shippingAddressDoc.address,
      city: shippingAddressDoc.city,
      state: shippingAddressDoc.state,
      pin_code: shippingAddressDoc.pin_code,
      phone_number: shippingAddressDoc.phone_number,
      country: shippingAddressDoc.country || "India",
      address_type: shippingAddressDoc.address_type || "home",
    };

    // Create billing address object
    const billingAddressObj =
      useBillingAddress && billingAddressId !== addressId
        ? {
            first_name: billingAddress.first_name,
            last_name: billingAddress.last_name,
            address: billingAddress.address,
            city: billingAddress.city,
            state: billingAddress.state,
            pin_code: billingAddress.pin_code,
            phone_number: billingAddress.phone_number,
            country: billingAddress.country || "India",
            address_type: billingAddress.address_type || "home",
          }
        : undefined;

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `${dateStr}${random}`;

    // Create order
    const orderData = {
      userId,
      orderNumber,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddressObj,
      subtotal,
      shippingCharge,
      discount,
      tax,
      totalAmount: subtotal + shippingCharge + tax - discount,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      notes: notes || undefined,
    };

    const order = await Order.create([orderData]);
    const createdOrder = order[0];

    // Remove purchased items from cart (keep the rest)
    const remainingCartItems = cart.items.filter(
      (item: { _id: { toString: () => any } }) =>
        !items.includes(item._id.toString()),
    );

    if (remainingCartItems.length > 0) {
      cart.items = remainingCartItems;
      await cart.save();
    } else {
      // If all items purchased, delete the cart
      await Cart.findOneAndDelete({ userId });
    }

    return NextResponse.json(
      {
        status: true,
        message: "Order created successfully",
        data: createdOrder,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating order:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("not available") ||
      error.message.includes("Please select") ||
      error.message.includes("Only") ||
      error.message.includes("Minimum")
    ) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 },
      );
    }

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
      { status: false, message: error.message || "Failed to create order" },
      { status: 500 },
    );
  }
}

// GET - Get all orders for authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { userId };
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      filter.orderStatus = status;
    }

    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    return NextResponse.json({
      status: true,
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page * limit < totalOrders,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
