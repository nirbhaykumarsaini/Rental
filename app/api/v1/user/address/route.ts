// D:\B2B\app\api\v1\user\address\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Address from '@/app/models/Address';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';

// GET - Get all addresses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Get all addresses for the user, sorted by default first, then by createdAt
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      status: true,
      message: 'Addresses fetched successfully',
      data: addresses,
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { name, phone, address, city, state, pincode, type, landmark, isDefault } = body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      throw new APIError('Please fill all required fields', 400);
    }

    if (phone.length !== 10) {
      throw new APIError('Please enter a valid 10-digit phone number', 400);
    }

    if (pincode.length !== 6) {
      throw new APIError('Please enter a valid 6-digit pincode', 400);
    }

    // Create new address
    const newAddress = await Address.create({
      userId,
      name,
      phone,
      address,
      landmark: landmark || '',
      city,
      state,
      pincode,
      type: type || 'home',
      isDefault: isDefault || false,
    });

    return NextResponse.json({
      status: true,
      message: 'Address added successfully',
      data: newAddress,
    }, { status: 201 });

  } catch (error: any) {
    return errorHandler(error);
  }
}