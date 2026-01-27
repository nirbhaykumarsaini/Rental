import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for Category
export interface ICategory {
  name: string;
  slug: string;
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
    slug: { 
      type: String, 
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Please enter a valid slug']
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
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: 'text'});


// Virtual for breadcrumbs/path
categorySchema.virtual('path').get(function() {
  return this.slug;
});

// Middleware to update slug if name changes
categorySchema.pre('save', function() {
  if (this.isModified('name') && !this.isModified('slug')) {
    const slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    this.slug = slug;
  }
});


const Category = mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;