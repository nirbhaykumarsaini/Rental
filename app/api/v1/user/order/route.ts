// D:\B2B\app\api\v1\orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
import { authenticate } from "@/app/middlewares/authMiddleware";
// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await authenticate(request);

    const body = await request.json();
    const {
      items,
      address,
      paymentMethod,
      subtotal,
      total,
      deliveryDate,
      returnDate,
    } = body;

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json(
        { status: false, message: "No items in order" },
        { status: 400 },
      );
    }

    if (!address || !paymentMethod) {
      return NextResponse.json(
        { status: false, message: "Address and payment method are required" },
        { status: 400 },
      );
    }

    // Generate order number
    const orderNumber =
      "ORD" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substring(2, 5).toUpperCase();

    // Calculate delivery and return dates if not provided
    const calculatedDeliveryDate =
      deliveryDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const calculatedReturnDate =
      returnDate || new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);

    // Create order
    const order = await Order.create({
      orderNumber,
      userId:userId,
      items,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: "confirmed",
      subtotal,
      discount: 0,
      deliveryFee: 0,
      total,
      deliveryDate: calculatedDeliveryDate,
      returnDate: calculatedReturnDate,
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: userId },
      {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
      },
    );

    return NextResponse.json({
      status: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to create order" },
      { status: 500 },
    );
  }
}

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId: userId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      status: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
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
