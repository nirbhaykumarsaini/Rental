// app/api/v1/admin/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Admin from "@/app/models/Admin";
import { authenticate } from "@/app/middlewares/authMiddleware";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    // Parse request body
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { status: false, message: "All password fields are required" },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { status: false, message: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { status: false, message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { status: false, message: "New password cannot be same as current password" },
        { status: 400 }
      );
    }

    // Get admin with password
    const admin = await Admin.findOne().select("+password");
    if (!admin) {
      return NextResponse.json(
        { status: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = admin.password === currentPassword; // Plain text comparison
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Update password (store as plain text as per your current setup)
    admin.password = newPassword;
    await admin.save();

    // Return success response
    return NextResponse.json(
      {
        status: true,
        message: "Password changed successfully"
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Change password error:", error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { status: false, message: "Validation error: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: false, message: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}