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
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};

    // Search by name, email, or phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by tier
    if (tier && tier !== 'all') {
      filter.tier = tier;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

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
    
    const orderStats = await Order.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] }
          },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ]);

    // Create a map of order stats by userId
    const statsMap = new Map();
    orderStats.forEach(stat => {
      statsMap.set(stat._id.toString(), stat);
    });

    // Get last login from sessions if you have a session model
    // This is a placeholder - implement based on your session management

    // Format users for response with order statistics
    const formattedUsers = users.map((user: any) => {
      const stats = statsMap.get(user._id.toString()) || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
      };

      return {
        id: user._id.toString(),
        customerId: `CUST-${user._id.toString().slice(-8).toUpperCase()}`,
        firstName: user.name?.split(' ')[0] || 'Customer',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
        phone: user.phone || user.mobile || '',
        status: user.status || 'active',
        tier: user.tier || 'regular',
        joinDate: user.createdAt,
        lastOrderDate: stats.lastOrderDate,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        averageOrderValue: stats.averageOrderValue || 0,
        pendingOrders: stats.pendingOrders,
        completedOrders: stats.completedOrders,
        cancelledOrders: stats.cancelledOrders,
        company: user.company,
        gst: user.gst,
        taxExempt: user.taxExempt || false,
        creditLimit: user.creditLimit,
        creditUsed: user.creditUsed || 0,
        paymentTerms: user.paymentTerms,
        source: user.source,
        tags: user.tags || [],
        marketingOptIn: user.marketingOptIn || false,
        smsOptIn: user.smsOptIn || false,
        whatsappOptIn: user.whatsappOptIn || false,
        preferredContactMethod: user.preferredContactMethod || 'email',
        preferredLanguage: user.preferredLanguage || 'en',
        timezone: user.timezone || 'Asia/Kolkata',
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json(
      {
        status: true,
        message: "Users fetched successfully",
        data: {
          users: formattedUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext,
            hasPrev
          }
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}
