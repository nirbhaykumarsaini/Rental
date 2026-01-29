import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import Product, { IProductVariantSize } from "@/app/models/Product";
import { ProductVariantSize } from "@/app/types/product.types";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all products
    const products = await Product.find({}).lean();

    // Calculate statistics
    const totalProducts = products.length;

    const inStock = products.filter((p) => p.status === "in-stock").length;
    const lowStock = products.filter((p) => p.status === "low-stock").length;
    const outOfStock = products.filter(
      (p) => p.status === "out-of-stock",
    ).length;

    // Calculate total inventory
    const totalInventory = products.reduce((sum, product) => {
      if (
        !product.hasVariants ||
        !product.variants ||
        product.variants.length === 0
      ) {
        return sum + product.minOrderQuantity;
      }

      const productInventory = product.variants.reduce(
        (variantSum: number, variant: { sizes: IProductVariantSize[] }) => {
          const variantTotal = variant.sizes.reduce(
            (sizeSum: number, size: { inventory: number }) => {
              return sizeSum + (size.inventory || 0);
            },
            0,
          );
          return variantSum + variantTotal;
        },
        0,
      );

      return sum + productInventory;
    }, 0);

    return NextResponse.json({
      status: true,
      data: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalInventory,
      },
    });
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
