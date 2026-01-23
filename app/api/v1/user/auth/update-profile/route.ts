// D:\B2B\app\api\v1\user\auth\update-profile\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/models/User';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { updateProfileSchema } from '@/app/utils/validation';
import { authenticate } from '@/app/middlewares/authMiddleware';

// PUT - UPDATE PROFILE
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = updateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ');
      throw new APIError(errors, 400);
    }

    const { name, email } = validationResult.data;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Check if profile is complete
    if (!user.isProfileComplete) {
      throw new APIError('Please complete your profile first using complete-profile endpoint', 400);
    }

    // Check if email is being updated and if it's already in use
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });

      if (existingEmailUser) {
        throw new APIError('Email is already in use', 400);
      }
      user.email = email;
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    await user.save();

    return NextResponse.json({
      status: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          isProfileComplete: user.isProfileComplete
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}