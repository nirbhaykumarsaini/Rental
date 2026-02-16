// D:\B2B\app\models\Wishlist.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWishlistItem {
  productId: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist {
  userId: mongoose.Types.ObjectId;
  items: IWishlistItem[];
}

export interface IWishlistDocument extends IWishlist, Document {
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true, // One wishlist per user
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ 'items.productId': 1 });

// Ensure no duplicate products in wishlist
wishlistSchema.pre('save', function() {
  const productIds = this.items.map(item => item.productId.toString());
  const uniqueIds = [...new Set(productIds)];
  
  if (productIds.length !== uniqueIds.length) {
    // Remove duplicates
    const uniqueItems: IWishlistItem[] = [];
    const seen = new Set();
    
    this.items.forEach(item => {
      if (!seen.has(item.productId.toString())) {
        seen.add(item.productId.toString());
        uniqueItems.push(item);
      }
    });
    
    this.items = uniqueItems as any;
  }
  
});

const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlistDocument>("Wishlist", wishlistSchema);

export default Wishlist;