import mongoose, { Document, Schema } from 'mongoose';

// Interface for Category
export interface ICategory {
  name: string;
  category_image: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

// Document interface
export interface ICategoryDocument extends ICategory, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Main Category Schema
const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { 
      type: String, 
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    category_image: { 
      type: String, 
      default: '',
    },
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
categorySchema.index({ name: 'text'});


const Category = mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;