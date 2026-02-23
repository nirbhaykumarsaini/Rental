// D:\B2B\app\models\Cart.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  rentalDays: number;
  rentalPrice: number;
  startDate: Date;
  endDate: Date;
  selectedSize?: string;
  selectedColor?: string;
  measurements?: {
    chest: string;
    waist: string;
    hip: string;
  };
  quantity: number;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

export interface ICartDocument extends ICart, Document {
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  rentalDays: { type: Number, required: true },
  rentalPrice: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  selectedSize: String,
  selectedColor: String,
  measurements: {
    chest: String,
    waist: String,
    hip: String
  },
  quantity: { type: Number, required: true, default: 1 }
});

const cartSchema = new Schema<ICartDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true,
      index: true 
    },
    items: [cartItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    itemCount: { type: Number, required: true, default: 0 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware to calculate totals
cartSchema.pre('save', function() {
  this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + (item.rentalPrice * item.quantity), 0);
  this.total = this.subtotal; // Add tax/discount logic here if needed
});

const Cart: Model<ICartDocument> = mongoose.models.Cart || mongoose.model<ICartDocument>('Cart', cartSchema);

export default Cart;