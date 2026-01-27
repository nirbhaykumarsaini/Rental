import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Category from "@/app/models/Category";


export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [totalCategories, activeCategories, inactiveCategories] =
      await Promise.all([
        Category.countDocuments(),
        Category.countDocuments({ isActive: true }),
        Category.countDocuments({ isActive: false }),
      ]);

    const statistics = {
      totalCategories,
      inactiveCategories,
      activeCategories,
    };

    return NextResponse.json({
      status: true,
      data: statistics,
    });
  } catch (error: any) {
    console.error("Error fetching category statistics:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
