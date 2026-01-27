// D:\B2B\app\api\v1\admin\auth\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Admin from "@/app/models/Admin";
import APIError from "@/app/lib/errors/APIError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { generateToken } from "@/app/lib/auth/jwt";

// POST - Admin Login (Plain text password version)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse request body
    const { email, password } = await request.json();
    console.log("Login attempt:", { email, password });

    // Validate required fields
    if (!email || !password) {
      throw new APIError("Email and password are required", 400);
    }

    // Find admin by email - get password since it's not hashed
    const admin = await Admin.findOne({ email })
      .select("+password") // Include password field
      .exec();

    console.log("Admin found:", admin ? "Yes" : "No");
    console.log("Admin email:", admin?.email);
    console.log("Stored password:", admin?.password);

    // Check if admin exists
    if (!admin) {
      throw new APIError("Invalid email or password", 401);
    }

    // Simple plain text comparison
    if (admin.password !== password) {
      console.log("Password mismatch");
      console.log("Stored:", admin.password);
      console.log("Provided:", password);
      throw new APIError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken(admin._id.toString());

    // Remove password from response
    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;

    return NextResponse.json(
      {
        status: true,
        message: "Admin login successful",
        data: {
          token,
          user: adminWithoutPassword,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return errorHandler(error);
  }
}