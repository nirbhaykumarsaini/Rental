import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Category from "@/app/models/Category";

// GET - Fetch all categories with product count using aggregation
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch categories and exclude unnecessary fields
    const categories = await Category.find({ isActive: true })
      .select('-path -__v -createdAt -updatedAt -createdBy -updatedBy')
      .lean();

    // Transform the data to remove id field and format properly
    const transformedCategories = categories.map(category => {
      // Create a new object excluding the id field
      const { id, ...categoryData } = category;
      return categoryData;
    });

    return NextResponse.json({
      status: true,
      message: "Category fetched successfully !",
      data: transformedCategories
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch categories" },
      { status: 500 },
    );
  }
}