import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for Admin data
export interface IAdmin {
  username: string;
  password: string;
  role?: 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Admin document with methods
export interface IAdminDocument extends IAdmin, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Admin Schema
const adminSchema = new Schema<IAdminDocument, Model<IAdminDocument>>(
  {
    username: { 
      type: String, 
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long']
    },
    password: { 
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false 
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

// Hash password before saving
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model (handling Next.js hot reload)
const Admin = mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', adminSchema);

export default Admin;