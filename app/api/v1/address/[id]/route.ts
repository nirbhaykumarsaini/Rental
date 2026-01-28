import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Address from "@/app/models/Address";
import { authenticate } from "@/app/middlewares/authMiddleware";
import mongoose from "mongoose";

// GET - Get single address by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: "Invalid address ID format" },
        { status: 400 },
      );
    }

    const address = await Address.findOne({ _id: id, userId }).lean();

    if (!address) {
      return NextResponse.json(
        { status: false, message: "Address not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Address fetched successfully",
      data: address
    });
  } catch (error: any) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch address" },
      { status: 500 },
    );
  }
}

// POST - Update address by ID
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { userId } = await authenticate(request);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: "Invalid address ID format" },
        { status: 400 },
      );
    }

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

    // Check if address exists and belongs to user
    const existingAddress = await Address.findOne({ _id: id, userId });
    if (!existingAddress) {
      return NextResponse.json(
        { status: false, message: "Address not found" },
        { status: 404 },
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pin_code !== undefined) updateData.pin_code = pin_code;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (address_type !== undefined) updateData.address_type = address_type;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (country !== undefined) updateData.country = country;

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      status: true,
      message: "Address updated successfully",
      data: updatedAddress
    });
  } catch (error: any) {
    console.error("Error updating address:", error);

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

    return NextResponse.json(
      { status: false, message: error.message || "Failed to update address" },
      { status: 500 },
    );
  }
}