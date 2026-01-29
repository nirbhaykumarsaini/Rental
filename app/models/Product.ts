// D:\B2B\app\models\Product.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for ProductVariantSize
export interface IProductVariantSize {
  _id?: mongoose.Types.ObjectId;
  size: string;
  inventory: number;
  sku: string;
  isActive: boolean;
}

// Interface for ProductVariant
export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  color: string;
  colorCode: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  sizes: IProductVariantSize[];
  isActive: boolean;
}

// Interface for Product
export interface IProduct {
  slug: string;
  name: string;
  category: string;
  minOrderQuantity: number;
  description: string;
  images: string[];
  mainImage?: string;
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants: IProductVariant[];
  hasVariants: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  status: 'draft' | 'in-stock' | 'low-stock' | 'out-of-stock' | 'archived';
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

// Document interface
export interface IProductDocument extends IProduct, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Variant Size Schema
const productVariantSizeSchema = new Schema<IProductVariantSize>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  size: { 
    type: String, 
    required: [true, 'Size is required'],
    trim: true
  },
  inventory: { 
    type: Number, 
    required: [true, 'Inventory is required'],
    min: [0, 'Inventory cannot be negative'],
    default: 0
  },
  sku: { 
    type: String, 
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// Variant Schema
const productVariantSchema = new Schema<IProductVariant>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  color: { 
    type: String, 
    required: [true, 'Color is required'],
    trim: true
  },
  colorCode: { 
    type: String, 
    required: [true, 'Color code is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
  },
  images: [{ 
    type: String, 
    required: [true, 'At least one image is required']
  }],
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: { 
    type: Number, 
    min: [0, 'Compare at price cannot be negative']
  },
  sizes: [productVariantSizeSchema],
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// Main Product Schema
const productSchema = new Schema<IProductDocument>(
  {
    slug: { 
      type: String, 
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Please enter a valid slug']
    },
    name: { 
      type: String, 
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters long'],
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    category: { 
      type: String, 
      required: [true, 'Category is required'],
      trim: true
    },
    minOrderQuantity: { 
      type: Number, 
      required: [true, 'Minimum order quantity is required'],
      min: [1, 'Minimum order quantity must be at least 1'],
      default: 1
    },
    description: { 
      type: String, 
      required: [true, 'Description is required'],
      trim: true
    },
    images: [{ 
      type: String, 
      required: [true, 'At least one product image is required']
    }],
    mainImage: { 
      type: String 
    },
    tags: [{ 
      type: String, 
      trim: true 
    }],
    weight: { 
      type: Number, 
      min: [0, 'Weight cannot be negative']
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    variants: [productVariantSchema],
    hasVariants: { 
      type: Boolean, 
      default: false 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    status: { 
      type: String, 
      enum: ['draft', 'in-stock', 'low-stock', 'out-of-stock', 'archived'],
      default: 'draft'
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware to clean invalid _id fields before save
productSchema.pre('save', function() {
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant: any) => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach((size: any) => {
          // Remove _id if it's empty string or invalid
          if (size._id === '' || (size._id && !mongoose.Types.ObjectId.isValid(size._id))) {
            delete size._id;
          }
        });
      }
    });
  }
});

// Middleware for findOneAndUpdate operations
productSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate() as any;
  const cleanUpdate = (data: any) => {
    if (data.variants && Array.isArray(data.variants)) {
      data.variants.forEach((variant: any) => {
        if (variant.sizes && Array.isArray(variant.sizes)) {
          variant.sizes.forEach((size: any) => {
            if (size._id === '' || (size._id && !mongoose.Types.ObjectId.isValid(size._id))) {
              delete size._id;
            }
          });
        }
      });
    }
  };
  
  if (update.$set) cleanUpdate(update.$set);
  if (update) cleanUpdate(update);
  
});

// Indexes for better query performance
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1, isPublished: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'variants.sizes.inventory': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.price': 1 });

// Virtual for total inventory
productSchema.virtual('totalInventory').get(function() {
  if (!this.hasVariants || this.variants.length === 0) {
    return this.minOrderQuantity;
  }
  
  return this.variants.reduce((total, variant) => {
    return total + variant.sizes.reduce((sum, size) => sum + size.inventory, 0);
  }, 0);
});

// Virtual for price range
productSchema.virtual('priceRange').get(function() {
  if (!this.hasVariants || this.variants.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const prices = this.variants.map(v => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
});

// Middleware to set mainImage if not provided
productSchema.pre('save', function() {
  if (!this.mainImage && this.images && this.images.length > 0) {
    this.mainImage = this.images[0];
  }
});

// Middleware to update status based on inventory
productSchema.pre('save', function() {
  if (this.hasVariants && this.variants.length > 0) {
    const totalInventory = this.variants.reduce((total, variant) => {
      return total + variant.sizes.reduce((sum, size) => sum + size.inventory, 0);
    }, 0);
    
    if (totalInventory === 0) {
      this.status = 'out-of-stock';
    } else if (totalInventory <= 10) {
      this.status = 'low-stock';
    } else {
      this.status = 'in-stock';
    }
  }
});

// Static method to find by slug
productSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isPublished: true, status: 'in-stock' });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isPublished: true, status: 'in-stock' });
};

// Static method to update inventory
productSchema.statics.updateInventory = async function(
  productId: string, 
  variantIndex: number, 
  sizeIndex: number, 
  inventory: number
) {
  const product = await this.findById(productId);
  if (!product) throw new Error('Product not found');
  
  if (!product.variants[variantIndex]) throw new Error('Variant not found');
  if (!product.variants[variantIndex].sizes[sizeIndex]) throw new Error('Size not found');
  
  product.variants[variantIndex].sizes[sizeIndex].inventory = inventory;
  return await product.save();
};

const Product: Model<IProductDocument> = mongoose.models.Product || mongoose.model<IProductDocument>('Product', productSchema);

export default Product;