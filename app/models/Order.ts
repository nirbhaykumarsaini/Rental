import mongoose, { Document, Model, Schema } from "mongoose";
import APIError from "../lib/errors/APIError";

// Order Item Interface
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  // productSlug: string;
  variantId?: string;
  sizeId?: string;
  color?: string;
  size?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

// Shipping Address Interface
export interface IShippingAddress {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  phone_number: string;
  country: string;
  address_type?: string;
}

// Order Status Enum
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

// Payment Method Enum
export enum PaymentMethod {
  COD = "cod", // Cash on Delivery only
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// Order Interface
export interface IOrder {
  userId: mongoose.Types.ObjectId;
  orderNumber: string; // Unique order identifier
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress; // Optional, can be same as shipping
  subtotal: number; // Sum of all items' totalPrice
  shippingCharge: number;
  discount?: number;
  tax?: number;
  totalAmount: number; // subtotal + shippingCharge + tax - discount
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string; // Customer notes
  adminNotes?: string; // Internal notes
  expectedDeliveryDate?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  trackingNumber?: string;
  courierName?: string;
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    // productSlug: {
    //   type: String,
    //   required: [true, "Product slug is required"],
    //   trim: true,
    // },
    variantId: {
      type: String,
      default: null,
    },
    sizeId: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    image: {
      type: String,
    },
  },
  { _id: true },
);

// Shipping Address Schema
const shippingAddressSchema = new Schema<IShippingAddress>({
  first_name: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  pin_code: {
    type: String,
    required: [true, "Pincode is required"],
    trim: true,
  },
  phone_number: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  country: {
    type: String,
    default: "India",
    trim: true,
  },
  address_type: {
    type: String,
    default: "home",
    trim: true,
  },
});

// Main Order Schema
const orderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    billingAddress: {
      type: shippingAddressSchema,
      default: null,
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    shippingCharge: {
      type: Number,
      required: [true, "Shipping charge is required"],
      min: [0, "Shipping charge cannot be negative"],
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      default: 0,
    },
    tax: {
      type: Number,
      min: [0, "Tax cannot be negative"],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.COD,
      required: [true, "Payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: [true, "Payment status is required"],
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: [true, "Order status is required"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Admin notes cannot exceed 500 characters"],
    },
    expectedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledReason: {
      type: String,
      trim: true,
      maxlength: [200, "Cancelled reason cannot exceed 200 characters"],
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    courierName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "items.productId": 1 });
orderSchema.index({ "shippingAddress.phone_number": 1 });
orderSchema.index({ orderNumber: "text", "items.productName": "text" });

// Virtual for item count
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Static method to find orders by user
orderSchema.statics.findByUserId = function (
  userId: string | mongoose.Types.ObjectId,
) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function (
  userId?: string | mongoose.Types.ObjectId,
) {
  const matchStage: any = {};
  if (userId) {
    matchStage.userId = new mongoose.Types.ObjectId(userId.toString());
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", OrderStatus.PENDING] }, 1, 0],
          },
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", OrderStatus.DELIVERED] }, 1, 0],
          },
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", OrderStatus.CANCELLED] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    }
  );
};

const Order =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", orderSchema);

export default Order;
