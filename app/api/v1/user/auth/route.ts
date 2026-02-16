// D:\B2B\app\api\v1\user\auth\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { registerSchema } from "@/app/utils/validation";
import { ZodErrorHandler } from "@/app/lib/helpers/validationHelper";

// POST - REGISTER USER / LOGIN USER BOTH
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

    const { phone, name } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      // If user exists, send new OTP
      const otp = "123456"; // Fixed OTP for now
      const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minutes

      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;
      await existingUser.save();

      return NextResponse.json(
        {
          status: true,
          message: "OTP sent successfully",
          data: {
            phone: existingUser.phone,
            otpExpiresAt: existingUser.otpExpiresAt,
          },
        },
        { status: 200 },
      );
    }

    // Create new user
    const otp = "123456"; // Fixed OTP for now
    const otpExpiresAt = new Date(Date.now() + 10* 60 * 1000); // 1 minutes

    const user = await User.create({
      phone,
      name,
      otp,
      otpExpiresAt,
    });

    return NextResponse.json(
      {
        status: true,
        message: "User registered successfully. OTP sent to phone number",
        data: {
          phone: user.phone,
          otpExpiresAt: user.otpExpiresAt,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}
