// D:\B2B\app\api\v1\orders\stats\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Order, { OrderStatus, PaymentStatus } from "@/app/models/Order";
import { errorHandler } from "@/app/lib/errors/errorHandler";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '30d'; // 7d, 30d, 90d, 1y, all

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get stats using aggregation pipeline
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $facet: {
          // Overall stats
          overallStats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
                averageOrderValue: { $avg: "$totalAmount" },
                pendingOrders: {
                  $sum: { $cond: [{ $eq: ["$orderStatus", OrderStatus.PENDING] }, 1, 0] },
                },
                processingOrders: {
                  $sum: { $cond: [{ $eq: ["$orderStatus", OrderStatus.PROCESSING] }, 1, 0] },
                },
                shippedOrders: {
                  $sum: { $cond: [{ $eq: ["$orderStatus", OrderStatus.SHIPPED] }, 1, 0] },
                },
                deliveredOrders: {
                  $sum: { $cond: [{ $eq: ["$orderStatus", OrderStatus.DELIVERED] }, 1, 0] },
                },
                cancelledOrders: {
                  $sum: { $cond: [{ $eq: ["$orderStatus", OrderStatus.CANCELLED] }, 1, 0] },
                },
                refundedOrders: {
                  $sum: { $cond: [{ $eq: ["$orderStatus", OrderStatus.REFUNDED] }, 1, 0] },
                },
              },
            },
          ],
          // Revenue trend (last 7 days)
          revenueTrend: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  $lte: endDate,
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                dailyRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          // Top products
          topProducts: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.productId",
                productName: { $first: "$items.productName" },
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } },
              },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const overallStats = stats[0]?.overallStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      refundedOrders: 0,
    };

    // Calculate percentage changes (you might want to compare with previous period)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

    const previousStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousStartDate,
            $lte: previousEndDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const previousTotalOrders = previousStats[0]?.totalOrders || 0;
    const previousTotalRevenue = previousStats[0]?.totalRevenue || 0;

    const orderPercentageChange = previousTotalOrders
      ? ((overallStats.totalOrders - previousTotalOrders) / previousTotalOrders) * 100
      : overallStats.totalOrders > 0 ? 100 : 0;

    const revenuePercentageChange = previousTotalRevenue
      ? ((overallStats.totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
      : overallStats.totalRevenue > 0 ? 100 : 0;

    return NextResponse.json(
      {
        status: true,
        message: "Order stats fetched successfully",
        data: {
          ...overallStats,
          percentageChange: {
            orders: orderPercentageChange,
            revenue: revenuePercentageChange,
          },
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            range: timeRange,
          },
          revenueTrend: stats[0]?.revenueTrend || [],
          topProducts: stats[0]?.topProducts || [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}