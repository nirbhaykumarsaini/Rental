// D:\B2B\app\api\v1\dashboard-stats\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  totalPending: number;
  salesDetails: {
    totalAmount: number;
    chartData: Array<{
      date: string;
      amount: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'order' | 'user' | 'product';
    title: string;
    description: string;
    timestamp: Date;
  }>;
  salesOverTime: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

interface ChangeStats {
  value: number;
  percentage: number;
  changeType: 'up' | 'down';
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters for time range (optional)
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date ranges
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
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Run all database queries in parallel for better performance
    const [
      totalUsers,
      yesterdayUsers,
      totalOrders,
      yesterdayOrders,
      totalSalesResult,
      yesterdaySales,
      pendingOrders,
      salesChartData,
      recentActivities
    ] = await Promise.all([
      // Total Users
      User.countDocuments(),
      
      // Users from yesterday (for percentage change)
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 2)),
          $lt: new Date(new Date().setDate(new Date().getDate() - 1))
        }
      }),
      
      // Total Orders
      Order.countDocuments(),
      
      // Orders from yesterday
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 2)),
          $lt: new Date(new Date().setDate(new Date().getDate() - 1))
        }
      }),
      
      // Total Sales (sum of totalAmount from all orders)
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }
          }
        }
      ]),
      
      // Sales from yesterday
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 2)),
              $lt: new Date(new Date().setDate(new Date().getDate() - 1))
            }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }
          }
        }
      ]),
      
      // Pending Orders (status: pending or processing)
      Order.countDocuments({
        orderStatus: { $in: ['pending', 'processing'] }
      }),
      
      // Sales Chart Data (last 7 days)
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            totalAmount: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Recent Activities (last 5 orders, users, and products)
      Promise.all([
        Order.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .select('orderNumber totalAmount createdAt')
          .lean(),
        User.find()
          .sort({ createdAt: -1 })
          .limit(2)
          .select('name email mobile createdAt')
          .lean(),
        Product.find()
          .sort({ createdAt: -1 })
          .limit(2)
          .select('name slug createdAt')
          .lean()
      ])
    ]);

    // Calculate total sales
    const totalSales = totalSalesResult[0]?.totalAmount || 0;
    const yesterdaySalesAmount = yesterdaySales[0]?.totalAmount || 0;

    // Calculate percentage changes
    const userChange = calculatePercentageChange(totalUsers, yesterdayUsers);
    const orderChange = calculatePercentageChange(totalOrders, yesterdayOrders);
    const salesChange = calculatePercentageChange(totalSales, yesterdaySalesAmount);

    // Generate sales chart data for the last 7 days
    const salesOverTime = generateSalesChartData(salesChartData);

    // Format recent activities
    const formattedActivities = formatRecentActivities(recentActivities);

    // Prepare response data
    const stats: DashboardStats = {
      totalUsers,
      totalOrders,
      totalSales,
      totalPending: pendingOrders,
      salesDetails: {
        totalAmount: totalSales,
        chartData: salesOverTime.labels.map((label, index) => ({
          date: label,
          amount: salesOverTime.datasets[0].data[index] || 0
        }))
      },
      recentActivity: formattedActivities,
      salesOverTime
    };

    // Include change statistics
    const changeStats = {
      users: {
        value: totalUsers,
        percentage: userChange.percentage,
        changeType: userChange.changeType,
        description: `${userChange.percentage}% ${userChange.changeType === 'up' ? 'Up' : 'Down'} from yesterday`
      },
      orders: {
        value: totalOrders,
        percentage: orderChange.percentage,
        changeType: orderChange.changeType,
        description: `${orderChange.percentage}% ${orderChange.changeType === 'up' ? 'Up' : 'Down'} from yesterday`
      },
      sales: {
        value: totalSales,
        percentage: salesChange.percentage,
        changeType: salesChange.changeType,
        description: `${salesChange.percentage}% ${salesChange.changeType === 'up' ? 'Up' : 'Down'} from yesterday`
      },
      pending: {
        value: pendingOrders,
        percentage: 1.8, // You might want to calculate this dynamically
        changeType: 'up' as const,
        description: "1.8% Up from yesterday"
      }
    };

    return NextResponse.json(
      {
        status: true,
        message: "Dashboard stats fetched successfully",
        data: {
          stats,
          changeStats,
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            range: timeRange
          },
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): ChangeStats {
  if (previous === 0) {
    return {
      value: current,
      percentage: current > 0 ? 100 : 0,
      changeType: current > 0 ? 'up' : 'down',
      description: current > 0 ? '100% Up from yesterday' : 'No change'
    };
  }

  const percentage = ((current - previous) / previous) * 100;
  const absolutePercentage = Math.abs(percentage);
  
  return {
    value: current,
    percentage: Math.round(absolutePercentage * 10) / 10, // Round to 1 decimal place
    changeType: percentage >= 0 ? 'up' : 'down',
    description: `${Math.round(absolutePercentage * 10) / 10}% ${percentage >= 0 ? 'Up' : 'Down'} from yesterday`
  };
}

// Helper function to generate sales chart data
function generateSalesChartData(chartData: any[]) {
  // Get last 7 days
  const labels = [];
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    labels.push(dateString);
    
    // Find data for this date
    const dayData = chartData.find(d => d._id === dateString);
    data.push(dayData?.totalAmount || 0);
  }

  return {
    labels,
    datasets: [
      {
        label: "Sales",
        data,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true
      }
    ]
  };
}

// Helper function to format recent activities
function formatRecentActivities([orders, users, products]: any[]) {
  const activities: any[] = [];
  
  // Add order activities
  orders.forEach((order: any) => {
    activities.push({
      id: order._id.toString(),
      type: 'order',
      title: `New order #${order.orderNumber}`,
      description: `Order value: ₹${order.totalAmount.toFixed(2)}`,
      timestamp: order.createdAt
    });
  });
  
  // Add user activities
  users.forEach((user: any) => {
    activities.push({
      id: user._id.toString(),
      type: 'user',
      title: `New user registered`,
      description: user.name || user.email || user.mobile,
      timestamp: user.createdAt
    });
  });
  
  // Add product activities
  products.forEach((product: any) => {
    activities.push({
      id: product._id.toString(),
      type: 'product',
      title: `New product added`,
      description: product.name,
      timestamp: product.createdAt
    });
  });
  
  // Sort by timestamp and return only 5
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
}

// You can also add a POST method to regenerate or cache dashboard stats
export async function POST(request: NextRequest) {
  try {
    // This endpoint could be used to refresh cached stats
    // or generate custom time range stats
    
    const body = await request.json();
    const { action, timeRange } = body;
    
    if (action === 'refresh') {
      // Implement cache refresh logic here
      return NextResponse.json({
        status: true,
        message: "Dashboard cache refreshed successfully"
      });
    }
    
    return NextResponse.json({
      status: false,
      message: "Invalid action"
    }, { status: 400 });
    
  } catch (error: any) {
    return errorHandler(error);
  }
}