// D:\B2B\app\lib\validations\authValidation.ts
import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
});

export const verifyOtpSchema = z.object({
  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  otp: z.string()
    .length(4, "OTP must be exactly 4 digits")
});

export const completeProfileSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .optional(),
}).refine(data => data.name, {
  message: "At least one field (name or phone) must be provided"
});

export const resendOtpSchema = z.object({
  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
});