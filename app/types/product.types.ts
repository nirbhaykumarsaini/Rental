// app/types/product.types.ts

export interface ProductVariantSize {
  _id:string;
  size: string;
  inventory: number;
  sku: string;
  isActive: boolean;
}

export interface ProductVariant {
  _id:string;
  color: string;
  colorCode: string; // Hex color code
  images: string[];
  price: number; // Common price for all sizes of this color
  compareAtPrice?: number;
  sizes: ProductVariantSize[];
  isActive: boolean;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  minOrderQuantity: number; // Minimum order quantity for all variants
  description: string;
  shortDescription?: string;
  images: string[];
  mainImage?: string;
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants: ProductVariant[];
  hasVariants: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  status: 'draft' | 'in-stock' | 'low-stock' | 'out-of-stock' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}