// D:\B2B\app\lib\middleware\authenticate.ts
import { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth/jwt';
import APIError from '@/app/lib/errors/APIError';
import connectDB from '@/app/config/db';
import User from '@/app/models/User';

export interface AuthRequest extends NextRequest {
  userId?: string;
}

export const authenticate = async (request: NextRequest) => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new APIError('Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new APIError('Authentication token is required', 401);
    }

    // Verify token
    const decoded = verifyToken(token) as { sub: string };

    if (!decoded || !decoded.sub) {
      throw new APIError('Invalid or expired token', 401);
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Return userId for use in route handlers
    return { userId: decoded.sub };

  } catch (error: any) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error.name === 'JsonWebTokenError') {
      throw new APIError('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new APIError('Token has expired', 401);
    }
    throw new APIError('Authentication failed', 401);
  }
};