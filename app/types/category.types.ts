import { ICategoryDocument } from '@/app/models/Category';
import { Model, Types } from 'mongoose';

export interface Category extends ICategoryDocument {
  subCategories?: Category[];
  productCount: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  slug: string;
  parentId?:string;
  icon?: string;
  color: string;
  sortOrder?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  subCategories?: string[];
}