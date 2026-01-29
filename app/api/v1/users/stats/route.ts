// D:\B2B\app\api\v1\users\stats\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import Order from "@/app/models/Order";
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

    // Get comprehensive stats using aggregation pipelines
    const stats = await Promise.all([
      // Total user count
      User.countDocuments(),
      
      // New users in time range
      User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // User growth trend
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // User activity stats
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            lastOrderDate: { $max: '$createdAt' }
          }
        },
        {
          $facet: {
            activeUsers: [
              {
                $match: {
                  lastOrderDate: { 
                    $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                  }
                }
              },
              { $count: 'count' }
            ],
            newCustomers: [
              {
                $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'user'
                }
              },
              { $unwind: '$user' },
              {
                $match: {
                  'user.createdAt': { $gte: startDate, $lte: endDate }
                }
              },
              { $count: 'count' }
            ],
            vipCustomers: [
              {
                $match: {
                  totalSpent: { $gte: 50000 }
                }
              },
              { $count: 'count' }
            ],
            premiumCustomers: [
              {
                $match: {
                  totalSpent: { $gte: 10000, $lt: 50000 }
                }
              },
              { $count: 'count' }
            ],
            averageOrderValue: [
              {
                $group: {
                  _id: null,
                  avgValue: { $avg: '$totalSpent' }
                }
              }
            ]
          }
        }
      ]),
      
      // Order stats
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $facet: {
            totalRevenue: [
              {
                $group: {
                  _id: null,
                  revenue: { $sum: '$totalAmount' },
                  orderCount: { $sum: 1 },
                  avgOrderValue: { $avg: '$totalAmount' }
                }
              }
            ],
            revenueTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                  },
                  dailyRevenue: { $sum: '$totalAmount' },
                  dailyOrders: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ],
            topCustomers: [
              {
                $group: {
                  _id: '$userId',
                  totalSpent: { $sum: '$totalAmount' },
                  orderCount: { $sum: 1 }
                }
              },
              { $sort: { totalSpent: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'user'
                }
              },
              { $unwind: '$user' },
              {
                $project: {
                  userId: '$_id',
                  name: '$user.name',
                  email: '$user.email',
                  mobile: '$user.mobile',
                  totalSpent: 1,
                  orderCount: 1
                }
              }
            ]
          }
        }
      ])
    ]);

    const [totalCustomers, newCustomers, userGrowthTrend, userActivityStats, orderStats] = stats;

    const activityData = userActivityStats[0] || {};
    const orderData = orderStats[0] || {};

    // Calculate retention rate
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
    });

    const retentionRate = previousPeriodUsers > 0 
      ? ((newCustomers / previousPeriodUsers) * 100).toFixed(1)
      : '100.0';

    return NextResponse.json(
      {
        status: true,
        message: "User statistics fetched successfully",
        data: {
          overview: {
            totalCustomers,
            newCustomers,
            activeCustomers: activityData.activeUsers?.[0]?.count || 0,
            vipCustomers: activityData.vipCustomers?.[0]?.count || 0,
            premiumCustomers: activityData.premiumCustomers?.[0]?.count || 0,
            retentionRate: `${retentionRate}%`,
            newCustomersThisPeriod: activityData.newCustomers?.[0]?.count || 0
          },
          revenue: {
            totalRevenue: orderData.totalRevenue?.[0]?.revenue || 0,
            totalOrders: orderData.totalRevenue?.[0]?.orderCount || 0,
            averageOrderValue: orderData.totalRevenue?.[0]?.avgOrderValue || 0,
            averageCustomerValue: activityData.averageOrderValue?.[0]?.avgValue || 0
          },
          trends: {
            userGrowth: userGrowthTrend,
            revenueTrend: orderData.revenueTrend || [],
            timeRange: {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              range: timeRange
            }
          },
          topCustomers: orderData.topCustomers || [],
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}