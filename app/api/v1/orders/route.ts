import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import Address from "@/app/models/Address";
import { authenticate } from "@/app/middlewares/authMiddleware";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/app/models/Order";
import User from "@/app/models/User";

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
          (v: any) => v._id.toString() === cartItem.variantId.toString(),
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
      } 
      // else {
      //   // For non-variant products, check overall inventory
      //   if (product.totalInventory < cartItem.quantity) {
      //     throw new Error(
      //       `Only ${product.totalInventory} items available for ${cartItem.name}`,
      //     );
      //   }
      // }

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
      { status: 200 },
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

// GET - Get all orders with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const customerEmail = searchParams.get('customerEmail');
    const orderNumber = searchParams.get('orderNumber');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.first_name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.last_name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone_number': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.totalAmount.$lte = parseFloat(maxAmount);
    }

    // Customer email filter
    if (customerEmail) {
      // Assuming customer email is stored in user, you might need to join
      const users = await User.find({ email: customerEmail });
      const userIds = users.map((user: { _id: any; }) => user._id);
      filter.userId = { $in: userIds };
    }

    // Order number filter
    if (orderNumber) {
      filter.orderNumber = { $regex: orderNumber, $options: 'i' };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Order.countDocuments(filter);

    // Get orders with pagination and populate user details
    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'name email mobile',
      })
      .lean();

    // Format orders for response
    const formattedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.userId?.name || `${order.shippingAddress.first_name} ${order.shippingAddress.last_name}`,
      customerEmail: order.userId?.email || order.shippingAddress.email || '',
      customerPhone: order.shippingAddress.phone_number,
      status: order.orderStatus,
      totalAmount: order.totalAmount,
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice,
      })),
      shippingAddress: {
        street: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.pin_code,
        country: order.shippingAddress.country,
      },
      billingAddress: order.billingAddress ? {
        street: order.billingAddress.address,
        city: order.billingAddress.city,
        state: order.billingAddress.state,
        zipCode: order.billingAddress.pin_code,
        country: order.billingAddress.country,
      } : undefined,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderDate: order.createdAt,
      shippingDate: order.shippingDate,
      deliveryDate: order.deliveredAt,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json(
      {
        status: true,
        message: "Orders fetched successfully",
        data: {
          orders: formattedOrders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch order" },
      { status: 500 },
    );
  }
}
