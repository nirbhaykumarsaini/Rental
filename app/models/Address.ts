// D:\B2B\app\models\Address.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAddress {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export interface IAddressDocument extends IAddress, Document {
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
    },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default address per user
addressSchema.pre('save', async function() {
  if (this.isDefault) {
    await this.model('Address').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

// Index for faster queries
addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

const Address = mongoose.models.Address || mongoose.model<IAddressDocument>("Address", addressSchema);

export default Address;