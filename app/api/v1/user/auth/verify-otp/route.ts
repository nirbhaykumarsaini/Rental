// D:\B2B\app\api\v1\user\auth\verify-otp\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/models/User';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { verifyOtpSchema } from '@/app/utils/validation';
import { generateToken } from '@/app/lib/auth/jwt';
import { ZodErrorHandler } from '@/app/lib/helpers/validationHelper';

// POST - VERIFY OTP
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = verifyOtpSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessage = ZodErrorHandler.format(validationResult.error);
      throw new APIError(errorMessage, 400);
    }

    const { mobile, otp } = validationResult.data;

    // Find user by mobile
    const user = await User.findOne({ mobile });

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Check if OTP exists
    if (!user.otp) {
      throw new APIError('No OTP found. Please request a new OTP', 400);
    }

    // Check if OTP is expired
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      throw new APIError('OTP has expired. Please request a new OTP', 400);
    }

    // Verify OTP
    if (user.otp !== otp) {
      throw new APIError('Invalid OTP', 400);
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString());

    return NextResponse.json({
      status: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          _id: user._id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}