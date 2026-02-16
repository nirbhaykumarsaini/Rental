// D:\B2B\app\api\v1\users\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import Order from "@/app/models/Order";
import Address from "@/app/models/Address";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single user by ID with detailed statistics, addresses, and orders
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const ordersPage = parseInt(searchParams.get('ordersPage') || '1');
    const ordersLimit = parseInt(searchParams.get('ordersLimit') || '5');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError("Invalid user ID", 400);
    }

    // Get user details
    const user = await User.findById(id).lean();
    if (!user) {
      throw new APIError("User not found", 404);
    }

    // Get user's addresses
    const addresses = await Address.find({ userId: new mongoose.Types.ObjectId(id) })
      .sort({ is_default: -1, createdAt: -1 })
      .lean();

    // Get user's order statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $facet: {
          // Overall stats
          overallStats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' },
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
                },
                cancelledOrders: {
                  $sum: {
                    $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0]
                  }
                }
              }
            }
          ],
          // Order status distribution
          statusDistribution: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
              }
            }
          ],
          // Monthly spending trend
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                monthlySpent: { $sum: '$totalAmount' },
                orderCount: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
          ]
        }
      }
    ]);

    const stats = orderStats[0]?.overallStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    // Get user's recent orders with pagination
    const ordersSkip = (ordersPage - 1) * ordersLimit;
    const orders = await Order.find({ userId: new mongoose.Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .skip(ordersSkip)
      .limit(ordersLimit)
      .lean();

    const totalOrdersCount = stats.totalOrders;

    // Format orders for response
    const formattedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      orderDate: order.createdAt,
      shippingDate: order.shippingDate,
      deliveryDate: order.deliveredAt,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item: any) => ({
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice,
        image: item.image,
        variantId: item.variantId,
        sizeId: item.sizeId,
        color: item.color,
        size: item.size
      }))
    }));

    // Determine user status based on activity
    let status = 'active';
    if (stats.totalOrders === 0) {
      status = 'inactive';
    } else if (stats.lastOrderDate) {
      const daysSinceLastOrder = Math.floor(
        (Date.now() - new Date(stats.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastOrder > 90) {
        status = 'inactive';
      }
    }

    // Determine tier based on spending
    let tier = 'regular';
    if (stats.totalSpent >= 50000) {
      tier = 'vip';
    } else if (stats.totalSpent >= 10000) {
      tier = 'premium';
    }

    // Format addresses for response
    const formattedAddresses = addresses.map((address: any) => ({
      id: address._id.toString(),
      type: address.address_type || 'other',
      street: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.pin_code,
      country: address.country || 'India',
      isDefault: address.is_default || false,
      firstName: address.first_name,
      lastName: address.last_name,
      phoneNumber: address.phone_number,
      fullName: `${address.first_name} ${address.last_name}`.trim(),
      fullAddress: `${address.address}, ${address.city}, ${address.state} ${address.pin_code}, ${address.country || 'India'}`
    }));

    // Get default address
    const defaultAddress = formattedAddresses.find(addr => addr.isDefault);

    // Calculate order frequency
    const getOrderFrequency = () => {
      if (stats.totalOrders === 0) return 'No orders';
      
      const joinDate = new Date(user.createdAt);
      const today = new Date();
      const diffTime = today.getTime() - joinDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const daysPerOrder = diffDays / stats.totalOrders;
      
      if (daysPerOrder <= 7) return 'Weekly';
      if (daysPerOrder <= 30) return 'Monthly';
      if (daysPerOrder <= 90) return 'Quarterly';
      return 'Infrequent';
    };

    // Format response
    const responseData = {
      id: user._id.toString(),
      customerId: `CUST-${user._id.toString().slice(-6).toUpperCase()}`,
      firstName: user.name?.split(' ')[0] || 'Customer',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      mobile: user.mobile,
      status,
      tier,
      joinDate: user.createdAt,
      lastOrderDate: stats.lastOrderDate,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      averageOrderValue: stats.averageOrderValue,
      pendingOrders: stats.pendingOrders,
      completedOrders: stats.completedOrders,
      cancelledOrders: stats.cancelledOrders,
      orderFrequency: getOrderFrequency(),
      addresses: formattedAddresses,
      defaultAddress: defaultAddress || (formattedAddresses.length > 0 ? formattedAddresses[0] : null),
      orders: {
        items: formattedOrders,
        pagination: {
          page: ordersPage,
          limit: ordersLimit,
          total: totalOrdersCount,
          totalPages: Math.ceil(totalOrdersCount / ordersLimit),
          hasNext: ordersPage < Math.ceil(totalOrdersCount / ordersLimit),
          hasPrev: ordersPage > 1
        }
      },
      stats: {
        statusDistribution: orderStats[0]?.statusDistribution || [],
        monthlyTrend: orderStats[0]?.monthlyTrend || []
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(
      {
        status: true,
        message: "User details fetched successfully",
        data: responseData
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}