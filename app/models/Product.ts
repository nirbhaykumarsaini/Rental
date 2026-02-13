// D:\B2B\app\models\Product.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for Rental Price
export interface IProductRentalPrice {
  _id?: mongoose.Types.ObjectId;
  days: number;
  price: number;
  isActive: boolean;
}

// Interface for Product Features
export interface IProductFeature {
  name: string;
  description?: string;
}

// Interface for Product
export interface IProduct {
  slug: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  color: string;
  colorCode: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  sizes: string[];
  features: IProductFeature[];
  rentalPrices: IProductRentalPrice[];
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  status: 'draft' | 'available' | 'unavailable' | 'archived'; // Updated enum values
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

// Document interface
export interface IProductDocument extends IProduct, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Rental Price Schema
const productRentalPriceSchema = new Schema<IProductRentalPrice>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  days: { 
    type: Number, 
    required: [true, 'Rental days are required'],
    min: [1, 'Rental days must be at least 1']
  },
  price: { 
    type: Number, 
    required: [true, 'Rental price is required'],
    min: [0, 'Price cannot be negative']
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// Product Features Schema
const productFeatureSchema = new Schema<IProductFeature>({
  name: { 
    type: String, 
    required: [true, 'Feature name is required'],
    trim: true
  },
  description: { 
    type: String, 
    trim: true 
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
    description: { 
      type: String, 
      required: [true, 'Description is required'],
      trim: true
    },
    images: [{ 
      type: String, 
      required: [true, 'At least one product image is required']
    }],
    color: { 
      type: String, 
      required: [true, 'Color is required'],
      trim: true
    },
    colorCode: { 
      type: String, 
      required: [true, 'Color code is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code'],
      default: '#000000'
    },
    price: { 
      type: Number, 
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: { 
      type: Number, 
      min: [0, 'Compare at price cannot be negative']
    },
    discountPercentage: { 
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    sizes: [{ 
      type: String, 
      required: [true, 'At least one size is required'],
      trim: true
    }],
    features: [productFeatureSchema],
    rentalPrices: [productRentalPriceSchema],
    isAvailable: { 
      type: Boolean, 
      default: true 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isNewArrival: { 
      type: Boolean, 
      default: false 
    },
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    status: { 
      type: String, 
      enum: ['draft', 'available', 'unavailable', 'archived'], // Updated enum values
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

// Pre-save middleware to calculate discount percentage
productSchema.pre('save', function() {
  if (this.compareAtPrice && this.price) {
    if (this.compareAtPrice > this.price) {
      const discount = ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100;
      this.discountPercentage = Math.round(discount * 10) / 10;
    } else {
      this.discountPercentage = undefined;
    }
  } else {
    this.discountPercentage = undefined;
  }
});

// Pre-save middleware to set status based on availability and publish status
productSchema.pre('save', function() {
  if (this.isPublished) {
    if (this.isAvailable) {
      this.status = 'available';
    } else {
      this.status = 'unavailable';
    }
  } else {
    this.status = 'draft';
  }
});

// Pre-save middleware to clean rental prices
productSchema.pre('save', function() {
  if (this.rentalPrices && this.rentalPrices.length > 0) {
    // Remove any rental prices with invalid days or price
    this.rentalPrices = this.rentalPrices.filter(rp => 
      rp.days && rp.days > 0 && rp.price && rp.price >= 0
    );
  }
});

// Indexes for better query performance
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1, isPublished: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ color: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

// Virtual for minimum rental price
productSchema.virtual('minRentalPrice').get(function() {
  if (!this.rentalPrices || this.rentalPrices.length === 0) {
    return this.price;
  }
  
  const activePrices = this.rentalPrices.filter(rp => rp.isActive);
  if (activePrices.length === 0) return this.price;
  
  return Math.min(...activePrices.map(rp => rp.price));
});

// Virtual for available rental options
productSchema.virtual('activeRentalOptions').get(function() {
  if (!this.rentalPrices) return [];
  return this.rentalPrices.filter(rp => rp.isActive);
});

// Static method to find by slug
productSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, isPublished: true });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ 
    isFeatured: true, 
    isPublished: true, 
    isAvailable: true,
    status: 'available'
  }).sort('-createdAt');
};

// Static method to find new arrivals
productSchema.statics.findNewArrivals = function() {
  return this.find({ 
    isNewArrival: true, 
    isPublished: true, 
    isAvailable: true,
    status: 'available'
  }).sort('-createdAt');
};

// Static method to find available products
productSchema.statics.findAvailable = function() {
  return this.find({ 
    isPublished: true, 
    isAvailable: true,
    status: 'available'
  }).sort('-createdAt');
};

// Static method to get product statistics
productSchema.statics.getStatistics = async function() {
  const [totalProducts, available, unavailable, featured, newArrivals, draftCount] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isAvailable: true, isPublished: true, status: 'available' }),
    this.countDocuments({ isAvailable: false, isPublished: true, status: 'unavailable' }),
    this.countDocuments({ isFeatured: true }),
    this.countDocuments({ isNewArrival: true }),
    this.countDocuments({ status: 'draft' })
  ]);

  const byCategory = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const categoryStats: Record<string, number> = {};
  byCategory.forEach((item: any) => {
    categoryStats[item._id] = item.count;
  });

  const priceStats = await this.aggregate([
    { $match: { isPublished: true } },
    { $group: { 
      _id: null, 
      avgPrice: { $avg: '$price' },
      minPrice: { $min: '$price' },
      maxPrice: { $max: '$price' }
    }}
  ]);

  return {
    totalProducts,
    available,
    unavailable,
    featured,
    newArrivals,
    draftCount,
    byCategory: categoryStats,
    averagePrice: priceStats[0]?.avgPrice || 0,
    priceRange: {
      min: priceStats[0]?.minPrice || 0,
      max: priceStats[0]?.maxPrice || 0
    }
  };
};

const Product: Model<IProductDocument> = mongoose.models.Product || mongoose.model<IProductDocument>('Product', productSchema);

export default Product;