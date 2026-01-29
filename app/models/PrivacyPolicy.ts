// app/models/PrivacyPolicy.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import APIError from "../lib/errors/APIError";

export interface IPolicySection {
  title: string;
  content: string;
  order: number;
}

export interface IPrivacyPolicy {
  title: string;
  content: string;
  version: string;
  summary?: string;
  effectiveDate: Date;
  sections?: IPolicySection[];
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  deactivatedAt?: Date;
}

export interface IPrivacyPolicyDocument extends IPrivacyPolicy, Document {
  createdAt: Date;
  updatedAt: Date;
}

const policySectionSchema = new Schema<IPolicySection>({
  title: {
    type: String,
    required: [true, "Section title is required"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Section content is required"],
  },
  order: {
    type: Number,
    required: [true, "Section order is required"],
    min: 0,
  },
});

const privacyPolicySchema = new Schema<IPrivacyPolicyDocument>(
  {
    title: {
      type: String,
      required: [true, "Policy title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Policy content is required"],
    },
    version: {
      type: String,
      required: [true, "Version is required"],
      trim: true,
      unique: true,
      match: [
        /^\d+\.\d+\.\d+$/,
        "Version must follow semantic versioning (x.y.z)",
      ],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, "Summary cannot exceed 500 characters"],
    },
    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required"],
      default: Date.now,
    },
    sections: [policySectionSchema],
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
    updatedBy: {
      type: String,
      default: 'Admin',
    },
    deactivatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
privacyPolicySchema.index({ version: 1 }, { unique: true });
privacyPolicySchema.index({ isActive: 1 });
privacyPolicySchema.index({ effectiveDate: -1 });
privacyPolicySchema.index({ createdAt: -1 });

// Virtual for formatted version
privacyPolicySchema.virtual("formattedVersion").get(function () {
  return `v${this.version}`;
});

// Virtual for days since effective
privacyPolicySchema.virtual("daysEffective").get(function () {
  const now = new Date();
  const effective = new Date(this.effectiveDate);
  const diffTime = Math.abs(now.getTime() - effective.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware to validate only one active policy
privacyPolicySchema.pre("save", async function () {
  if (this.isActive) {
    const activePolicy = await PrivacyPolicy.findOne({
      isActive: true,
      _id: { $ne: this._id },
    });
    if (activePolicy) {
      throw new APIError(
        "There is already an active privacy policy. Please deactivate it first.",
      );
    }
  }
});

const PrivacyPolicy: Model<IPrivacyPolicyDocument> =
  mongoose.models.PrivacyPolicy ||
  mongoose.model<IPrivacyPolicyDocument>("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;
