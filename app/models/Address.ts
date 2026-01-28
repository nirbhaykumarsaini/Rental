import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAddress {
  userId: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  phone_number: string;
  address_type?: 'home' | 'work' | 'other';
  is_default: boolean;
  country?: string;
}

export interface IAddressDocument extends IAddress, Document {
  fullName: string;
  fullAddress: string;
}

const addressSchema = new Schema<IAddressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"]
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters long"],
      maxlength: [50, "City cannot exceed 50 characters"]
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      minlength: [2, "State must be at least 2 characters long"],
      maxlength: [50, "State cannot exceed 50 characters"]
    },
    pin_code: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"]
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit Indian phone number"]
    },
    address_type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
      trim: true
    },
    is_default: {
      type: Boolean,
      default: false
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [50, "Country cannot exceed 50 characters"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name
addressSchema.virtual('fullName').get(function() {
  return `${this.first_name} ${this.last_name}`.trim();
});

// Virtual for full address
addressSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address,
    this.city,
    this.state,
    this.pin_code,
    this.country
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
});

// Indexes
addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, is_default: 1 });
addressSchema.index({ pin_code: 1 });
addressSchema.index({ city: 1, state: 1 });

// Middleware to ensure only one default address per user
addressSchema.pre('save', async function() {
  if (this.is_default) {
    try {
      // Remove default flag from other addresses of this user
      await this.model('Address').updateMany(
        { 
          userId: this.userId,
          _id: { $ne: this._id }
        },
        { $set: { is_default: false } }
      );
    } catch (error: any) {
      return error
    }
  }
});

// Static method to get default address
addressSchema.statics.findDefaultByUserId = function(userId: string | mongoose.Types.ObjectId) {
  return this.findOne({ userId, is_default: true });
};

// Static method to get all addresses by user
addressSchema.statics.findAllByUserId = function(userId: string | mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ is_default: -1, updatedAt: -1 });
};

const Address = mongoose.models.Address || mongoose.model<IAddressDocument>("Address", addressSchema);

export default Address;