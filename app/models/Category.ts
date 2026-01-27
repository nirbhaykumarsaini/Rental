import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for Category
export interface ICategory {
  name: string;
  description?: string;
  slug: string;
  parentId: string;
  icon?: string;
  color: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

// Document interface
export interface ICategoryDocument extends ICategory, Document {
  createdAt: Date;
  updatedAt: Date;
  subCategories?: ICategoryDocument[];
  productCount: number;
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
    description: { 
      type: String, 
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    slug: { 
      type: String, 
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Please enter a valid slug']
    },
    parentId: { 
      type: String, 
      ref: 'Category',
      default: null,
      index: true
    },
    icon: { 
      type: String, 
      trim: true
    },
    color: { 
      type: String, 
      default: '#3B82F6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
    },
    sortOrder: { 
      type: Number, 
      default: 0,
      min: [0, 'Sort order cannot be negative']
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    metaTitle: { 
      type: String, 
      trim: true,
      maxlength: [70, 'Meta title cannot exceed 70 characters']
    },
    metaDescription: { 
      type: String, 
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
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
categorySchema.index({ parentId: 1, sortOrder: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ sortOrder: 1 });

// Virtual for sub-categories
categorySchema.virtual('subCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
  options: { sort: { sortOrder: 1 } }
});

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for breadcrumbs/path
categorySchema.virtual('path').get(function() {
  return this.slug;
});

// Middleware to ensure a category cannot be its own parent
categorySchema.pre('save', async function() {
  if (this.parentId && this.parentId.equals(this._id)) {
    throw new Error('Category cannot be its own parent');
  }
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

// Static method to find by slug
categorySchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug }).populate('subCategories');
};

// Static method to find featured categories
categorySchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ sortOrder: 1 })
    .populate('subCategories');
};

// Static method to find all active categories with hierarchy
categorySchema.statics.findHierarchy = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { sortOrder: 1, name: 1 } },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'children',
        maxDepth: 5,
        depthField: 'depth'
      }
    },
    { $match: { parentId: null } }
  ]);
};

// Static method to update sort order
categorySchema.statics.updateSortOrder = async function(
  categoryId: string, 
  sortOrder: number
) {
  return this.findByIdAndUpdate(categoryId, { sortOrder }, { new: true });
};

// Static method to find all parent categories
categorySchema.statics.findParents = function() {
  return this.find({ parentId: null, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

const Category = mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;