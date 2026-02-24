// D:\B2B\app\api\v1\user\orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";

// GET - Get all orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find({ })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ }),
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
