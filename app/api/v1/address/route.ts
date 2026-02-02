import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Address from "@/app/models/Address";
import { authenticate } from "@/app/middlewares/authMiddleware";

// GET - Get all addresses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);

    const addresses = await Address.find({ userId })
      .sort({ is_default: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({
      status: true,
      message: "Addresses fetched successfully",
      data: addresses
    });
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);

    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      address, 
      city, 
      state, 
      pin_code, 
      phone_number,
      address_type,
      is_default,
      country
    } = body;

    // Validate required fields
    const requiredFields = [
      'first_name', 
      'last_name', 
      'address', 
      'city', 
      'state', 
      'pin_code', 
      'phone_number'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          status: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 },
      );
    }

    // If this is set as default, we'll handle it in the model middleware
    const addressData = {
      userId,
      first_name,
      last_name,
      address,
      city,
      state,
      pin_code,
      phone_number,
      address_type: address_type || 'home',
      is_default: is_default || false,
      country: country || 'India'
    };

    const newAddress = await Address.create(addressData);

    return NextResponse.json(
      {
        status: true,
        message: "Address created successfully",
        data: newAddress
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error creating address:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          status: false,
          message: "Validation error: " +
            Object.values(error.errors)
              .map((e: any) => e.message)
              .join(", "),
        },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          status: false,
          message: "Address constraint violation",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { status: false, message: error.message || "Failed to create address" },
      { status: 500 },
    );
  }
}
