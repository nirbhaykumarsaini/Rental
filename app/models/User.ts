// D:\B2B\app\models\User.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser {
  name?: string;
  email?: string;
  mobile: string;
  otp?: string;
  otpExpiresAt?: Date;
  isProfileComplete: boolean;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema);

export default User;