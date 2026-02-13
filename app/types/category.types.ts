export interface Category {
  _id:string;
  name: string;
  category_image: string;
  productCount:string;
  isActive?: boolean;
}

export interface CategoryInput {
  name: string;
  category_image?: string;
  isActive?: boolean;
}
