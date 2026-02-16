// D:\B2B\app\api\v1\users\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import Order from "@/app/models/Order";
import { errorHandler } from "@/app/lib/errors/errorHandler";

// GET - Get all users with filters, search, and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // active, inactive, blocked
    const tier = searchParams.get('tier'); // regular, premium, vip
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minOrders = searchParams.get('minOrders');
    const maxOrders = searchParams.get('maxOrders');
    const minSpent = searchParams.get('minSpent');
    const maxSpent = searchParams.get('maxSpent');

    // Build filter object
    const filter: any = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get users with pagination
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await User.countDocuments(filter);

    // Get order statistics for each user in parallel
    const userIds = users.map(user => user._id);
    
    // Get order statistics for all users
    const orderStats = await Order.aggregate([
      {
        $match: {
          userId: { $in: userIds }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
          pendingOrders: {
            $sum: {
              $cond: [{ $in: ['$orderStatus', ['pending', 'processing']] }, 1, 0]
            }
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Create a map of userId -> order stats
    const orderStatsMap = new Map();
    orderStats.forEach(stat => {
      orderStatsMap.set(stat._id.toString(), stat);
    });

    // Format users for response with order statistics
    const formattedUsers = users.map((user: any) => {
      const userStats = orderStatsMap.get(user._id.toString()) || {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        pendingOrders: 0,
        completedOrders: 0
      };

      // Determine user status based on activity
      let status = 'active';
      if (userStats.totalOrders === 0) {
        status = 'inactive';
      } else if (userStats.lastOrderDate) {
        const daysSinceLastOrder = Math.floor(
          (Date.now() - new Date(userStats.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastOrder > 90) {
          status = 'inactive';
        }
      }

      // Determine tier based on spending
      let tier = 'regular';
      if (userStats.totalSpent >= 50000) {
        tier = 'vip';
      } else if (userStats.totalSpent >= 10000) {
        tier = 'premium';
      }

      return {
        id: user._id.toString(),
        customerId: `CUST-${user._id.toString().slice(-6).toUpperCase()}`,
        firstName: user.name?.split(' ')[0] || 'Customer',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        mobile: user.mobile,
        status,
        tier,
        joinDate: user.createdAt,
        lastOrderDate: userStats.lastOrderDate,
        totalOrders: userStats.totalOrders,
        totalSpent: userStats.totalSpent,
        pendingOrders: userStats.pendingOrders,
        completedOrders: userStats.completedOrders,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });

    // Apply additional filters
    let filteredUsers = formattedUsers;

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (tier && tier !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.tier === tier);
    }

    if (minOrders) {
      filteredUsers = filteredUsers.filter(user => user.totalOrders >= parseInt(minOrders));
    }

    if (maxOrders) {
      filteredUsers = filteredUsers.filter(user => user.totalOrders <= parseInt(maxOrders));
    }

    if (minSpent) {
      filteredUsers = filteredUsers.filter(user => user.totalSpent >= parseFloat(minSpent));
    }

    if (maxSpent) {
      filteredUsers = filteredUsers.filter(user => user.totalSpent <= parseFloat(maxSpent));
    }

    // Calculate pagination for filtered results
    const filteredTotal = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Get overall stats
    const overallStats = await getCustomerStats();

    return NextResponse.json(
      {
        status: true,
        message: "Users fetched successfully",
        data: {
          users: paginatedUsers,
          stats: overallStats,
          pagination: {
            page,
            limit,
            total: filteredTotal,
            totalPages: Math.ceil(filteredTotal / limit),
            hasNext: endIndex < filteredTotal,
            hasPrev: startIndex > 0,
          },
          filters: {
            search,
            status,
            tier,
            dateFrom,
            dateTo,
            minOrders,
            maxOrders,
            minSpent,
            maxSpent
          }
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}

// Helper function to get customer statistics
async function getCustomerStats() {
  const totalCustomers = await User.countDocuments();
  
  // Get order statistics
  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: '$userId',
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalSpent' },
        totalOrders: { $sum: '$orderCount' },
        activeCustomers: {
          $sum: {
            $cond: [
              {
                $gt: [
                  { $subtract: [new Date(), '$lastOrderDate'] },
                  90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
                ]
              },
              0,
              1
            ]
          }
        },
        averageOrderValue: { $avg: '$totalSpent' }
      }
    }
  ]);

  const stats = orderStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    averageOrderValue: 0
  };

  // Get tier distribution
  const tierStats = await Order.aggregate([
    {
      $group: {
        _id: '$userId',
        totalSpent: { $sum: '$totalAmount' }
      }
    },
    {
      $group: {
        _id: null,
        vipCustomers: {
          $sum: { $cond: [{ $gte: ['$totalSpent', 50000] }, 1, 0] }
        },
        premiumCustomers: {
          $sum: { 
            $cond: [
              { $and: [
                { $gte: ['$totalSpent', 10000] },
                { $lt: ['$totalSpent', 50000] }
              ]},
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const tierData = tierStats[0] || {
    vipCustomers: 0,
    premiumCustomers: 0
  };

  return {
    totalCustomers,
    activeCustomers: stats.activeCustomers,
    inactiveCustomers: totalCustomers - stats.activeCustomers,
    totalRevenue: stats.totalRevenue,
    totalOrders: stats.totalOrders,
    averageOrderValue: stats.averageOrderValue,
    vipCustomers: tierData.vipCustomers,
    premiumCustomers: tierData.premiumCustomers,
    regularCustomers: totalCustomers - (tierData.vipCustomers + tierData.premiumCustomers)
  };
}
