// D:\B2B\app\lib\validations\authValidation.ts
import { z } from 'zod';

export const registerSchema = z.object({
  mobile: z.string()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
});

export const verifyOtpSchema = z.object({
  mobile: z.string()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  otp: z.string()
    .length(4, "OTP must be exactly 4 digits")
});

export const completeProfileSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  email: z.string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  mobile: z.string()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .optional(),
  email: z.string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim()
    .optional()
}).refine(data => data.name || data.email, {
  message: "At least one field (name or email) must be provided"
});

export const resendOtpSchema = z.object({
  mobile: z.string()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
});