// D:\B2B\app\api\v1\user\address\default\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Address from '@/app/models/Address';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';

// PATCH - Set address as default
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Parse request body
    const { addressId } = await request.json();

    if (!addressId) {
      throw new APIError('Address ID is required', 400);
    }

    // Find address and check ownership
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new APIError('Address not found', 404);
    }

    // Remove default from all other addresses
    await Address.updateMany(
      { userId, _id: { $ne: addressId } },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    return NextResponse.json({
      status: true,
      message: 'Default address updated successfully',
      data: address,
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}