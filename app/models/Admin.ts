// D:\B2B\app\models\Admin.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdmin {
  email: string;
  password: string;
  role: 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminDocument extends IAdmin, Document {}

const adminSchema = new Schema<IAdminDocument, Model<IAdminDocument>>(
  {
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: { 
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // This hides password by default in queries
    },
    role: { 
      type: String, 
      enum: ['admin'], 
      default: 'admin' 
    }
  },
  { 
    timestamps: true,
  }
);

// Remove any password hashing middleware if exists
// DO NOT add pre('save') hooks for hashing

const Admin = mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', adminSchema);

export default Admin;