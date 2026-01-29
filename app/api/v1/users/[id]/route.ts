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

// GET - Get single user by ID with detailed statistics and addresses
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;

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
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null
    };

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
      isProfileComplete: user.isProfileComplete,
      addresses: formattedAddresses,
      defaultAddress: defaultAddress || (formattedAddresses.length > 0 ? formattedAddresses[0] : null),
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