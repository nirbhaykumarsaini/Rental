// app/types/category.types.ts
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  slug: string;
  parentId: string | null;
  subCategories?: Category[];
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}