import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@/app/constants/index';

export const generateToken = (userId: string) => {
  const secret = JWT_SECRET;
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, JWT_SECRET);
};

export const generateOtp = (): string => {
  // For now, return static OTP as per requirement
  return "123456";
};

export const isOtpExpired = (otpExpiresAt: Date): boolean => {
  return new Date() > otpExpiresAt;
};

export const generateOtpExpiry = (minutes: number = 1): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};