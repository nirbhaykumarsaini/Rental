import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Product from "@/app/models/Product";

// Type for route params (Next.js 13+ uses Promise)
type RouteParams = Promise<{ categorySlug: string }>;

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams },
) {
  try {
    await connectDB();

    // Await the params Promise in Next.js 13+
    const { categorySlug } = await params;

    const product = await Product.find({ category: categorySlug })
      .select("-__v")
      .lean();

    if (!product) {
      return NextResponse.json(
        { status: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch product" },
      { status: 500 },
    );
  }
}
