import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  variantId?: string;
  sizeId?: string;
  quantity: number;
  price: number;
  name: string;
  color?: string;
  size?: string;
  image?: string;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: Date;
}

export interface ICartDocument extends ICart, Document {}

const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  variantId: {
    type: String,
    default: null
  },
  sizeId: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  image: {
    type: String
  }
}, { _id: true });

const cartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware to update totals before saving
cartSchema.pre('save', function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.updatedAt = new Date();
});

// Indexes
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ updatedAt: -1 });

// Static method to find cart by user ID
cartSchema.statics.findByUserId = function(userId: string | mongoose.Types.ObjectId) {
  return this.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name slug images variants isPublished status',
    model: 'Product'
  });
};

// Interface for Cart Model
interface ICartModel extends Model<ICartDocument> {
  findByUserId(userId: string | mongoose.Types.ObjectId): Promise<ICartDocument | null>;
}

// Create and export the model
const Cart: ICartModel = mongoose.models.Cart as ICartModel || 
  mongoose.model<ICartDocument, ICartModel>('Cart', cartSchema);

export default Cart;