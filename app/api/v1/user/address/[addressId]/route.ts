// D:\B2B\app\api\v1\user\address\[addressId]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Address from '@/app/models/Address';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';

type RouteParams = Promise<{ addressId: string }>;

// GET - Get single address
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);
    const { addressId } = await params;

    await connectDB();

    // Find address
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new APIError('Address not found', 404);
    }

    return NextResponse.json({
      status: true,
      message: 'Address fetched successfully',
      data: address,
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}

// PUT - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);
    const { addressId } = await params;

    await connectDB();

    // Parse request body
    const body = await request.json();

    // Find address and check ownership
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new APIError('Address not found', 404);
    }

    // Update fields
    const updateFields = ['name', 'phone', 'address', 'landmark', 'city', 'state', 'pincode', 'type', 'isDefault'];
    
    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        (address as any)[field] = body[field];
      }
    });

    await address.save();

    return NextResponse.json({
      status: true,
      message: 'Address updated successfully',
      data: address,
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}

// DELETE - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);
    const { addressId } = await params;

    await connectDB();

    // Find and delete address
    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
      throw new APIError('Address not found', 404);
    }

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({ userId, _id: { $ne: addressId } });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    return NextResponse.json({
      status: true,
      message: 'Address deleted successfully',
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}