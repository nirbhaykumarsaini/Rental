import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for FAQ
export interface IFAQ {
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document interface
export interface IFAQDocument extends IFAQ, Document {}

// FAQ Schema
const faqSchema = new Schema<IFAQDocument>(
  {
    question: { 
      type: String, 
      required: [true, 'Question is required'],
      trim: true,
      minlength: [5, 'Question must be at least 5 characters long'],
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    answer: { 
      type: String, 
      required: [true, 'Answer is required'],
      trim: true,
      minlength: [10, 'Answer must be at least 10 characters long'],
      maxlength: [2000, 'Answer cannot exceed 2000 characters']
    },
    category: { 
      type: String, 
      required: [true, 'Category is required'],
      enum: ['All', 'Returns', 'Refunds', 'Account', 'Order', 'Policy', 'Gift Card', 'Shipping', 'Payment', 'General'],
      default: 'General'
    },
    order: { 
      type: Number, 
      default: 0,
      min: [0, 'Order cannot be negative']
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ order: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ createdAt: -1 });

// Text index for search functionality
faqSchema.index({ question: 'text', answer: 'text' });

// Static method to find FAQs by category
faqSchema.statics.findByCategory = function(category: string) {
  if (category === 'All') {
    return this.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  }
  return this.find({ category, isActive: true }).sort({ order: 1, createdAt: -1 });
};

// Static method to get all unique categories
faqSchema.statics.getCategories = function() {
  return this.distinct('category', { isActive: true });
};

// Static method to search FAQs
faqSchema.statics.searchFAQs = function(searchTerm: string) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { question: { $regex: searchTerm, $options: 'i' } },
          { answer: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  }).sort({ order: 1, createdAt: -1 });
};

// Static method to get FAQ count by category
faqSchema.statics.getFAQCountByCategory = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};

const FAQ: Model<IFAQDocument> = mongoose.models.FAQ || mongoose.model<IFAQDocument>('FAQ', faqSchema);

export default FAQ;