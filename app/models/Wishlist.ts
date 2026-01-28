import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWishlistItem {
  productId: mongoose.Types.ObjectId;
  addedAt: Date;
  variantId?: string; // Optional: if user wants a specific variant
  note?: string;      // Optional note for the product
}

export interface IWishlist {
  userId: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  itemCount: number;
  updatedAt: Date;
  name?: string; // Optional wishlist name
  isDefault: boolean;
}

export interface IWishlistDocument extends IWishlist, Document {}

const wishlistItemSchema = new Schema<IWishlistItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true
  },
  variantId: {
    type: String,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters']
  }
}, { _id: true });

const wishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    items: [wishlistItemSchema],
    itemCount: {
      type: Number,
      default: 0,
      min: 0
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Wishlist name cannot exceed 100 characters'],
      default: 'My Wishlist'
    },
    isDefault: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware to update item count before saving
wishlistSchema.pre('save', function() {
  this.itemCount = this.items.length;
  this.updatedAt = new Date();
});

// Indexes for better query performance
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ userId: 1, isDefault: 1 });
wishlistSchema.index({ 'items.productId': 1 });
wishlistSchema.index({ updatedAt: -1 });
wishlistSchema.index({ userId: 1, 'items.addedAt': -1 });

// Virtual for populated products (for queries)
wishlistSchema.virtual('products', {
  ref: 'Product',
  localField: 'items.productId',
  foreignField: '_id'
});

// Static method to find default wishlist by user ID
wishlistSchema.statics.findDefaultByUserId = function(userId: string | mongoose.Types.ObjectId) {
  return this.findOne({ userId, isDefault: true });
};

// Static method to find all wishlists by user ID
wishlistSchema.statics.findAllByUserId = function(userId: string | mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ isDefault: -1, updatedAt: -1 });
};

// Static method to check if product is in wishlist
wishlistSchema.statics.isProductInWishlist = async function(
  userId: string | mongoose.Types.ObjectId, 
  productId: string | mongoose.Types.ObjectId
) {
  const wishlist = await this.findOne({ 
    userId, 
    isDefault: true,
    'items.productId': productId 
  });
  return !!wishlist;
};

// Static method to move item to cart (with proper error handling)
wishlistSchema.statics.moveItemToCart = async function(
  userId: string | mongoose.Types.ObjectId,
  productId: string | mongoose.Types.ObjectId,
  variantId?: string
) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const wishlist = await this.findOne({ userId, isDefault: true }).session(session);
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }
    
    // Find the item in wishlist
    const itemIndex = wishlist.items.findIndex((item: { productId: { toString: () => string; }; variantId: string; }) => 
      item.productId.toString() === productId.toString() && 
      (!variantId || item.variantId === variantId)
    );
    
    if (itemIndex === -1) {
      throw new Error('Product not found in wishlist');
    }
    
    // Remove from wishlist
    const [removedItem] = wishlist.items.splice(itemIndex, 1);
    await wishlist.save({ session });
    
    // Here you would typically call the cart API to add the item
    // For simplicity, we're returning the product details
    // In a real implementation, you would integrate with your cart service
    
    await session.commitTransaction();
    session.endSession();
    
    return {
      productId: removedItem.productId,
      variantId: removedItem.variantId,
      note: removedItem.note
    };
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlistDocument>('Wishlist', wishlistSchema);

export default Wishlist;