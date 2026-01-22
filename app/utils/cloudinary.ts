import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "delogt5jb",
  api_key: process.env.CLOUDINARY_API_KEY || "169622573762697",
  api_secret: process.env.CLOUDINARY_API_SECRET || "gWbBrKDuxaUUzSf3IYcXoX7kZ-Q",
});

// Helper to upload image to Cloudinary
export async function uploadToCloudinary(file: File, folder: string = 'products') {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ secure_url: string, public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string, public_id: string });
      }
    );
    stream.end(buffer);
  });
}

// Helper to delete single image from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// Helper to delete multiple images from Cloudinary
export async function deleteMultipleFromCloudinary(publicIds: string[]) {
  if (publicIds.length === 0) return [];
  
  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(publicIds, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// Extract public ID from Cloudinary URL
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/delogt5jb/image/upload/v1234567890/products/image.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the 'upload' part and get everything after it
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get the public ID (everything after 'upload/')
    const publicIdParts = pathParts.slice(uploadIndex + 1);
    
    // Remove the version if present (v1234567890)
    if (publicIdParts[0]?.startsWith('v')) {
      publicIdParts.shift();
    }
    
    // Join and remove file extension
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', url, error);
    return null;
  }
}

// Extract all public IDs from product data
export function extractPublicIdsFromProduct(product: any): string[] {
  const publicIds: string[] = [];
  
  // Extract from main images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((image: string) => {
      const publicId = getPublicIdFromUrl(image);
      if (publicId) publicIds.push(publicId);
    });
  }
  
  // Extract from variant images
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((variant: any) => {
      if (variant.images && Array.isArray(variant.images)) {
        variant.images.forEach((image: string) => {
          const publicId = getPublicIdFromUrl(image);
          if (publicId) publicIds.push(publicId);
        });
      }
    });
  }
  
  // Remove duplicates
  return [...new Set(publicIds)];
}

// Extract public IDs from variant images
export function extractPublicIdsFromVariants(variants: any[]): string[] {
  const publicIds: string[] = [];
  
  variants.forEach((variant: any) => {
    if (variant.images && Array.isArray(variant.images)) {
      variant.images.forEach((image: string) => {
        const publicId = getPublicIdFromUrl(image);
        if (publicId) publicIds.push(publicId);
      });
    }
  });
  
  return [...new Set(publicIds)];
}