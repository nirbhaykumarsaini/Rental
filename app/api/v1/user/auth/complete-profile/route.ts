// D:\B2B\app\api\v1\user\auth\complete-profile\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import User from "@/app/models/User";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { completeProfileSchema } from "@/app/utils/validation";
import { authenticate } from "@/app/middlewares/authMiddleware";
import { ZodErrorHandler } from "@/app/lib/helpers/validationHelper";

// POST - COMPLETE PROFILE
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await authenticate(request);

    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = completeProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = ZodErrorHandler.format(validationResult.error);
      throw new APIError(errorMessage, 400);
    }

    const { name, phone } = validationResult.data;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    // Check if profile is already complete

    // Check if phone matches the authenticated user's phone
    if (user.phone !== phone) {
      throw new APIError("Phone number does not match your account", 400);
    }

    // Check if phone is already in use by another user
    const existingPhoneUser = await User.findOne({
      phone,
      _id: { $ne: userId },
    });

    if (existingPhoneUser) {
      throw new APIError("Phone Number is already in use", 400);
    }

    // Update user profile
    user.name = name;
    await user.save();

    return NextResponse.json(
      {
        status: true,
        message: "Profile completed successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}
