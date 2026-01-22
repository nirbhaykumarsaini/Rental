import { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth/jwt';
import ApiError from '@/app/lib/errors/APIError';
import { JwtPayload } from 'jsonwebtoken';
import User from '@/app/models/User';


// Define proper interfaces for token payload structures
interface UserIdPayload {
  id?: string;
  _id?: string;
  user_id?: string;
}


export const authenticate = async (request: NextRequest) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    throw new ApiError('Please authenticate');
  }

  try {
    const payload = verifyToken(accessToken);
    return payload.sub;
  } catch {
    throw new ApiError('Please authenticate');
  }
};

export const checkRole = (roles: string[]) => {
  return async (request: NextRequest) => {
    const userId = await authenticate(request);
    const user = await User.findById(userId);
    
    if (!user || !roles.includes(user.role)) {
      throw new ApiError('Forbidden');
    }
    
    return userId;
  };
};


export const getUserIdFromToken = (request: NextRequest): string | null => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token) as JwtPayload;
    
    // Handle different token payload structures
    if (typeof decoded.sub === 'string') {
      return decoded.sub;
    } else if (decoded.sub && typeof decoded.sub === 'object') {
      // If sub is an object, extract the id with proper type checking
      const subObject = decoded.sub as UserIdPayload;
      return subObject.id || subObject._id || subObject.user_id || null;
    } else if (decoded.user_id) {
      // Alternative: check for user_id field
      return decoded.user_id;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}