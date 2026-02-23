// D:\B2B\app\api\v1\orders\stats\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order from "@/app/models/Order";
import { authenticate } from "@/app/middlewares/authMiddleware";

// GET - Get order statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await authenticate(request);

    const [
      totalOrders,
      activeRentals,
      completedRentals,
      cancelledOrders,
      totalSpent,
    ] = await Promise.all([
      Order.countDocuments({ userId: userId }),
      Order.countDocuments({
        userId: userId,
        orderStatus: {
          $in: ["confirmed", "processing", "shipped", "delivered"],
        },
      }),
      Order.countDocuments({
        userId: userId,
        orderStatus: "delivered",
      }),
      Order.countDocuments({
        userId: userId,
        orderStatus: "cancelled",
      }),
      Order.aggregate([
        { $match: { userId: userId, orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    return NextResponse.json({
      status: true,
      data: {
        totalOrders,
        activeRentals,
        completedRentals,
        cancelledOrders,
        totalSpent: totalSpent[0]?.total || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      {
        status: false,
        message: error.message || "Failed to fetch order stats",
      },
      { status: 500 },
    );
  }
}
