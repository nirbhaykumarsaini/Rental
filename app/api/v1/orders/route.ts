import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/config/db";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import Order, {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/app/models/Order";
import Address from "@/app/models/Address";
import { authenticate } from "@/app/middlewares/authMiddleware";
import User from "@/app/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    const body = await request.json();

    const {
      addressId,
      items, // cart item IDs
      shippingCharge = 0,
      discount = 0,
      tax = 0,
      useBillingAddress = false,
      billingAddressId,
      notes,
    } = body;

    if (!addressId || !items?.length) {
      return NextResponse.json(
        { status: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { status: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const selectedCartItems = cart.items.filter((i: any) =>
      items.includes(i._id.toString())
    );

    if (!selectedCartItems.length) {
      return NextResponse.json(
        { status: false, message: "No valid cart items selected" },
        { status: 400 }
      );
    }

    const shippingAddress = await Address.findOne({
      _id: addressId,
      userId,
    }).lean();

    if (!shippingAddress) {
      return NextResponse.json(
        { status: false, message: "Shipping address not found" },
        { status: 400 }
      );
    }

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const cartItem of selectedCartItems) {
      const product = await Product.findById(cartItem.productId).lean();

      if (!product || !product.isPublished || product.status !== "in-stock") {
        throw new Error(`${cartItem.name} is not available`);
      }

      let variant: any = null;
      let size: any = null;

      if (product.hasVariants) {
        if (!cartItem.variantId) {
          throw new Error(`Variant required for ${cartItem.name}`);
        }

        variant = product.variants.find(
          (v: any) =>
            v._id.toString() === cartItem.variantId.toString() &&
            v.isActive
        );

        if (!variant) {
          throw new Error(
            `Selected variant for ${cartItem.name} is not available`
          );
        }

        if (variant.sizes?.length > 0) {
          if (!cartItem.sizeId) {
            throw new Error(`Size required for ${cartItem.name}`);
          }

          size = variant.sizes.find(
            (s: any) =>
              s._id.toString() === cartItem.sizeId.toString() && s.isActive
          );

          if (!size) {
            throw new Error(
              `Selected size for ${cartItem.name} is not available`
            );
          }

          if (size.inventory < cartItem.quantity) {
            throw new Error(
              `Only ${size.inventory} items available for ${cartItem.name}`
            );
          }

          // Inventory update
          await Product.updateOne(
            {
              _id: product._id,
              "variants._id": variant._id,
            },
            {
              $inc: {
                "variants.$[v].sizes.$[s].inventory":
                  -cartItem.quantity,
              },
            },
            {
              arrayFilters: [
                { "v._id": variant._id },
                { "s._id": size._id },
              ],
            }
          );
        }
      }

      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: cartItem.name,
        variantId: variant?._id,
        sizeId: size?._id,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
        totalPrice: itemTotal,
        image: cartItem.image,
      });
    }

    const orderNumber =
      new Date().toISOString().slice(0, 10).replace(/-/g, "") +
      Math.floor(10000 + Math.random() * 90000);

    const order = await Order.create({
      userId,
      orderNumber,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      discount,
      tax,
      totalAmount: subtotal + shippingCharge + tax - discount,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      notes,
    });

    // Remove purchased items from cart
    cart.items = cart.items.filter(
      (i: any) => !items.includes(i._id.toString())
    );
    await cart.save();

    return NextResponse.json(
      { status: true, message: "Order created", data: order },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("ORDER ERROR:", error);
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 400 }
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
