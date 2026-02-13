// D:\B2B\app\types\product.types.ts

export interface ProductRentalPrice {
  _id?: string;
  days: number; // 4, 8, or 16
  price: number;
  isActive: boolean;
}

export interface ProductFeature {
  name: string;
  description?: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  images: string[]; // Multiple product images
  color: string; // Single color only
  colorCode: string; // Hex color code
  price: number; // Base price
  compareAtPrice?: number; // Original price for discount
  discountPercentage?: number; // Auto-calculated
  sizes: string[]; // Multiple sizes
  features: ProductFeature[]; // Multiple features
  rentalPrices: ProductRentalPrice[]; // Multiple rental options
  isAvailable: boolean; // Available/Not available
  isFeatured: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  status: 'draft' | 'available' | 'unavailable' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  newArrival?: boolean;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  color?: string;
  sizes?: string[];
}

export interface ProductStatistics {
  totalProducts: number;
  available: number;
  unavailable: number;
  featured: number;
  newArrivals: number;
  draftCount: number;
  byCategory?: Record<string, number>;
}