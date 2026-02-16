// D:\B2B\app\lib\validations\authValidation.ts
import { z } from "zod";

export const registerSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .optional()
    .nullable(),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export const completeProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
});

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .optional(),
  })
  .refine((data) => data.name, {
    message: "At least one field (name or phone) must be provided",
  });

export const resendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
});


// Address validation schema
export const addressSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City must be at least 2 characters long'),
  state: z.string().min(2, 'State must be at least 2 characters long'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'),
  type: z.enum(['home', 'work', 'other']).default('home'),
  isDefault: z.boolean().default(false),
});

// Update address schema (all fields optional except id)
export const updateAddressSchema = z.object({
  addressId: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters long').optional(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City must be at least 2 characters long').optional(),
  state: z.string().min(2, 'State must be at least 2 characters long').optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode').optional(),
  type: z.enum(['home', 'work', 'other']).optional(),
  isDefault: z.boolean().optional(),
});
