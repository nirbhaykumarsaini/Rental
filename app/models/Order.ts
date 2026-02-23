// D:\B2B\app\models\Order.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  rentalDays: number;
  rentalPrice: number;
  startDate: Date;
  endDate: Date;
  selectedSize: string;
  selectedColor: string;
  measurements: {
    chest: string;
    waist: string;
    hip: string;
  };
  quantity: number;
}

export interface IAddress {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "other";
  isDefault?: boolean;
}

export interface IOrder {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  address: IAddress;
  paymentMethod: "cod" | "upi" | "card";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryDate: Date;
  returnDate: Date;
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
    paymentMethodDetails?: string;
  };
  trackingDetails?: {
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  };
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  rentalDays: { type: Number, required: true },
  rentalPrice: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  selectedSize: { type: String },
  selectedColor: { type: String },
  measurements: {
    chest: String,
    waist: String,
    hip: String,
  },
  quantity: { type: Number, required: true, default: 1 },
});

const addressSchema = new Schema<IAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  landmark: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  type: { type: String, enum: ["home", "work", "other"], default: "home" },
  isDefault: { type: Boolean, default: false },
});

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    address: addressSchema,
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    paymentDetails: {
      transactionId: String,
      paidAt: Date,
      paymentMethodDetails: String,
    },
    trackingDetails: {
      trackingNumber: String,
      carrier: String,
      shippedAt: Date,
      deliveredAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
orderSchema.index({ userId: 1, orderStatus: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ deliveryDate: 1 });
orderSchema.index({ returnDate: 1 });

// Virtual for rental duration
orderSchema.virtual("rentalDuration").get(function () {
  if (!this.deliveryDate || !this.returnDate) return 0;
  const diffTime = Math.abs(
    this.returnDate.getTime() - this.deliveryDate.getTime(),
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for isActive
orderSchema.virtual("isActive").get(function () {
  const activeStatuses = ["confirmed", "processing", "shipped", "delivered"];
  return (
    activeStatuses.includes(this.orderStatus) &&
    new Date(this.returnDate) >= new Date()
  );
});

// Pre-save middleware
orderSchema.pre("save", function () {
  // Ensure total is consistent
  this.total = this.subtotal - this.discount + this.deliveryFee;
});

// Static method to get active rentals for a user
orderSchema.statics.getActiveRentals = function (userId: string) {
  const activeStatuses = ["confirmed", "processing", "shipped", "delivered"];
  return this.find({
    userId,
    orderStatus: { $in: activeStatuses },
    returnDate: { $gte: new Date() },
  }).sort({ deliveryDate: 1 });
};

// Static method to generate order number
orderSchema.statics.generateOrderNumber = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", orderSchema);

export default Order;
