// D:\B2B\app\api\v1\user\auth\resend-otp\route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import User from '@/app/models/User';
import APIError from '@/app/lib/errors/APIError';
import { errorHandler } from '@/app/lib/errors/errorHandler';
import { resendOtpSchema } from '@/app/utils/validation';
import { ZodErrorHandler } from '@/app/lib/helpers/validationHelper';

// POST - RESEND OTP
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = resendOtpSchema.safeParse(body);
    
      if (!validationResult.success) {
          const errorMessage = ZodErrorHandler.format(validationResult.error);
          throw new APIError(errorMessage, 400);
        }

    const { mobile } = validationResult.data;

    // Find user by mobile
    const user = await User.findOne({ mobile });

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Generate new OTP
    const otp = '1234'; // Fixed OTP for now
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'OTP sent successfully',
      data: {
        mobile: user.mobile,
        otpExpiresAt: user.otpExpiresAt
      }
    }, { status: 200 });

  } catch (error: any) {
    return errorHandler(error);
  }
}