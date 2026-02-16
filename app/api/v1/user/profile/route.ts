// D:\B2B\app\api\v1\user\profile\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/models/User';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { authenticate } from '@/app/middlewares/authMiddleware';

// GET - GET USER PROFILE
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError('User not found', 404);
    }

    return NextResponse.json({
      status: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}