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

    const { name, email, mobile } = validationResult.data;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    // Check if profile is already complete
    if (user.isProfileComplete) {
      throw new APIError(
        "Profile is already complete. Use update-profile endpoint to modify",
        400,
      );
    }

    // Check if mobile matches the authenticated user's mobile
    if (user.mobile !== mobile) {
      throw new APIError("Mobile number does not match your account", 400);
    }

    // Check if email is already in use by another user
    const existingEmailUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingEmailUser) {
      throw new APIError("Email is already in use", 400);
    }

    // Update user profile
    user.name = name;
    user.email = email;
    user.isProfileComplete = true;
    await user.save();

    return NextResponse.json(
      {
        status: true,
        message: "Profile completed successfully",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            isProfileComplete: user.isProfileComplete,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return errorHandler(error);
  }
}
