import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import { authenticate } from "@/app/middlewares/authMiddleware";

// GET - Track order by order number or phone number
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const phoneNumber = searchParams.get("phoneNumber");

    if (!orderNumber && !phoneNumber) {
      return NextResponse.json(
        { status: false, message: "Order number or phone number is required" },
        { status: 400 },
      );
    }

    let order;
    
    if (orderNumber) {
      // Authenticate user for order number lookup
      const { userId } = await authenticate(request);
      order = await Order.findOne({ 
        orderNumber: orderNumber.toUpperCase(),
        userId 
      })
        .select('-adminNotes')
        .lean();
    } else if (phoneNumber) {
      // No authentication needed for phone number lookup
      order = await Order.findOne({ 
        'shippingAddress.phone_number': phoneNumber 
      })
        .select('-adminNotes -userId')
        .lean();
    }

    if (!order) {
      return NextResponse.json(
        { status: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Order found",
      data: order
    });
  } catch (error: any) {
    console.error("Error tracking order:", error);
    
    // Don't expose authentication errors for public tracking
    if (error.message.includes("Authentication")) {
      return NextResponse.json(
        { status: false, message: "Order not found" },
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || "Failed to track order" },
      { status: 500 },
    );
  }
}