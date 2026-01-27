// D:\B2B\app\api\v1\user\auth\register\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { registerSchema } from "@/app/utils/validation";
import { ZodErrorHandler } from "@/app/lib/helpers/validationHelper";

// POST - REGISTER USER
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = ZodErrorHandler.format(validationResult.error);
      throw new APIError(errorMessage, 400);
    }

    const { mobile } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      // If user exists, send new OTP
      const otp = "1234"; // Fixed OTP for now
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;
      await existingUser.save();

      return NextResponse.json(
        {
          status: true,
          message: "OTP sent successfully",
          data: {
            mobile: existingUser.mobile,
            otpExpiresAt: existingUser.otpExpiresAt,
          },
        },
        { status: 200 },
      );
    }

    // Create new user
    const otp = "1234"; // Fixed OTP for now
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      mobile,
      otp,
      otpExpiresAt,
      isProfileComplete: false,
    });

    return NextResponse.json(
      {
        status: true,
        message: "User registered successfully. OTP sent to mobile number",
        data: {
          mobile: user.mobile,
          otpExpiresAt: user.otpExpiresAt,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}
