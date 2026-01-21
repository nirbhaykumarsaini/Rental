// app/types/category.types.ts
export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  slug: string;
  parentId: string | null;
  subCategories?: SubCategory[];
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  icon?: string;
  color: string;
  slug: string;
  parentId: string | null;
  subCategories: string[];
}
