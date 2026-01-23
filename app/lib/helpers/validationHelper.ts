import { z } from 'zod';

export class ZodErrorHandler {
  static format(error: z.ZodError): string {
    // Method 1: Direct access
    const messages = error.issues?.map((issue: any) => issue.message) || [];
    
    if (messages.length > 0) {
      return messages.join(', ');
    }
    
    // Method 2: Alternative approach
    if ('errors' in error) {
      const errors = (error as any).errors;
      if (Array.isArray(errors)) {
        return errors.map((err: any) => err.message).join(', ');
      }
    }
    
    // Method 3: Fallback
    return 'Validation failed';
  }
}