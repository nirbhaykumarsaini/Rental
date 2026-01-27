import { Product } from '@/app/types/product.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface ProductStatistics {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventory: number;
  byCategory?: Record<string, number>;
  featuredCount?: number;
  draftCount?: number;
}

export interface InventoryUpdateData {
  variantIndex: number;
  sizeIndex: number;
  inventory: number;
}

export interface StatusUpdateData {
  status: Product['status'];
}

export interface FeaturedUpdateData {
  isFeatured: boolean;
}

class ProductService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds default timeout
  private readonly MIN_TIMEOUT = 5000; // Minimum 5 seconds timeout

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized
        return {
          status: false,
          message: 'Unauthorized. Please login again.'
        };
      } else if (response.status === 404) {
        return {
          status: false,
          message: 'Resource not found.'
        };
      } else if (response.status === 500) {
        return {
          status: false,
          message: 'Server error. Please try again later.'
        };
      }
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return {
        status: false,
        message: 'Invalid response from server'
      };
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout?: number): Promise<Response> {
    // Ensure timeout is a positive number
    const actualTimeout = Math.max(
      this.MIN_TIMEOUT,
      timeout || this.DEFAULT_TIMEOUT
    );

    const controller = new AbortController();
    
    // Use a valid timeout ID
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Create the timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`Request timed out after ${actualTimeout}ms`));
      }, actualTimeout);
    });

    try {
      // Create the fetch promise
      const fetchPromise = fetch(url, {
        ...options,
        signal: controller.signal
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Clear timeout if fetch completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return response as Response;
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request aborted: ${error.message}`);
      }
      throw error;
    }
  }

  // Get all products with filters
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Set default values if not provided
      filters.page = filters.page || 1;
      filters.limit = filters.limit || 10;
      filters.sortBy = filters.sortBy || 'createdAt';
      filters.sortOrder = filters.sortOrder || 'desc';
      
      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const url = `${API_BASE_URL}/products?${queryParams}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store', // Always fetch fresh data
        headers: {
          'Accept': 'application/json',
        }
      }, 15000); // 15 second timeout for product listings
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Network error. Please check your connection.'
      };
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Product ID is required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 10000); // 10 second timeout for single product
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch product'
      };
    }
  }

  // Get product by slug
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      if (!slug) {
        return {
          status: false,
          message: 'Product slug is required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/slug/${slug}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 10000);
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch product'
      };
    }
  }

  // Create product - with longer timeout for file uploads
  async createProduct(productData: FormData): Promise<ApiResponse<Product>> {
    try {
      // Validate required fields
      const requiredFields = ['name', 'slug', 'category', 'description'];
      for (const field of requiredFields) {
        if (!productData.get(field)) {
          return {
            status: false,
            message: `${field} is required`
          };
        }
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: productData,
        // Note: Don't set Content-Type header for FormData, browser sets it automatically with boundary
      }, 60000); // 60 second timeout for file uploads
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to create product'
      };
    }
  }

  // Update product - with longer timeout for file uploads
  async updateProduct(id: string, productData: FormData): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Product ID is required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: productData,
      }, 60000); // 60 second timeout for file uploads
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update product'
      };
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Product ID is required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      }, 10000); // 10 second timeout for delete
      
      return this.handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to delete product'
      };
    }
  }

  // Update inventory for a specific size
  async updateInventory(
    productId: string,
    variantIndex: number,
    sizeIndex: number,
    inventory: number
  ): Promise<ApiResponse<Product>> {
    try {
      if (!productId || variantIndex === undefined || sizeIndex === undefined || inventory === undefined) {
        return {
          status: false,
          message: 'All parameters are required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${productId}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ variantIndex, sizeIndex, inventory }),
      }, 10000);
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error updating inventory for product ${productId}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update inventory'
      };
    }
  }

  // Update product status
  async updateProductStatus(id: string, status: Product['status']): Promise<ApiResponse<Product>> {
    try {
      if (!id || !status) {
        return {
          status: false,
          message: 'Product ID and status are required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      }, 10000);
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error updating status for product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }

  // Toggle featured status
  async toggleFeatured(id: string, isFeatured: boolean): Promise<ApiResponse<Product>> {
    try {
      if (!id || isFeatured === undefined) {
        return {
          status: false,
          message: 'Product ID and featured status are required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ isFeatured }),
      }, 10000);
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error updating featured status for product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update featured status'
      };
    }
  }

  // Toggle publish status
  async togglePublish(id: string, isPublished: boolean): Promise<ApiResponse<Product>> {
    try {
      if (!id || isPublished === undefined) {
        return {
          status: false,
          message: 'Product ID and published status are required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ isPublished }),
      }, 10000);
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error updating publish status for product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update publish status'
      };
    }
  }

  // Get product statistics
  async getStatistics(): Promise<ApiResponse<ProductStatistics>> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/statistics`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 10000);
      
      return this.handleResponse<ProductStatistics>(response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }

  // Bulk update products
  async bulkUpdateProducts(updates: { ids: string[], action: string, data?: any }): Promise<ApiResponse<any>> {
    try {
      if (!updates.ids || updates.ids.length === 0 || !updates.action) {
        return {
          status: false,
          message: 'Product IDs and action are required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      }, 30000); // 30 seconds for bulk operations
      
      return this.handleResponse<any>(response);
    } catch (error) {
      console.error('Error bulk updating products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to bulk update products'
      };
    }
  }

  // Search products (with suggestions)
  async searchProducts(query: string, limit: number = 5): Promise<ApiResponse<Product[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          status: false,
          message: 'Search query must be at least 2 characters'
        };
      }

      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        5000 // 5 seconds for search
      );
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to search products'
      };
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, limit: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      if (!category) {
        return {
          status: false,
          message: 'Category is required'
        };
      }

      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/category/${category}?limit=${limit}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        10000
      );
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch products by category'
      };
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/featured?limit=${limit}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        10000
      );
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch featured products'
      };
    }
  }

  // Get low stock products
  async getLowStockProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/low-stock?limit=${limit}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        10000
      );
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch low stock products'
      };
    }
  }

  // Get out of stock products
  async getOutOfStockProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/out-of-stock?limit=${limit}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        10000
      );
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch out of stock products'
      };
    }
  }

  // Get draft products
  async getDraftProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/drafts?limit=${limit}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        10000
      );
      
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      console.error('Error fetching draft products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch draft products'
      };
    }
  }

  // Export products to CSV
  async exportProducts(filters: ProductFilters = {}): Promise<ApiResponse<{ url: string }>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const url = `${API_BASE_URL}/products/export?${queryParams}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 30000); // 30 seconds for export
      
      return this.handleResponse<{ url: string }>(response);
    } catch (error) {
      console.error('Error exporting products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to export products'
      };
    }
  }

  // Import products from CSV/Excel
  async importProducts(file: File): Promise<ApiResponse<{ imported: number, failed: number, errors: string[] }>> {
    try {
      if (!file) {
        return {
          status: false,
          message: 'File is required'
        };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/import`, {
        method: 'POST',
        body: formData,
      }, 120000); // 2 minutes for import
      
      return this.handleResponse<{ imported: number, failed: number, errors: string[] }>(response);
    } catch (error) {
      console.error('Error importing products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to import products'
      };
    }
  }

  // Duplicate product
  async duplicateProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Product ID is required'
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      }, 15000); // 15 seconds for duplication
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error(`Error duplicating product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to duplicate product'
      };
    }
  }

  // Check SKU availability
  async checkSkuAvailability(sku: string, productId?: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      if (!sku) {
        return {
          status: false,
          message: 'SKU is required'
        };
      }

      const params = new URLSearchParams({ sku });
      if (productId) {
        params.append('productId', productId);
      }

      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/products/check-sku?${params}`,
        {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          }
        },
        5000 // 5 seconds for SKU check
      );
      
      return this.handleResponse<{ available: boolean }>(response);
    } catch (error) {
      console.error('Error checking SKU availability:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to check SKU availability'
      };
    }
  }

  // Get product categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/categories`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 5000);
      
      return this.handleResponse<string[]>(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  // Get product tags
  async getTags(): Promise<ApiResponse<string[]>> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/tags`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 5000);
      
      return this.handleResponse<string[]>(response);
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tags'
      };
    }
  }

  // Simpler fetchWithTimeout alternative (more reliable)
  private async safeFetch(url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  // Alternative method for critical operations
  async createProductSimple(productData: FormData): Promise<ApiResponse<Product>> {
    try {
      const response = await this.safeFetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: productData,
      }, 60000);
      
      return this.handleResponse<Product>(response);
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to create product'
      };
    }
  }

  // Validate product data before submission
  validateProductData(product: Partial<Product>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.name?.trim()) {
      errors.push('Product name is required');
    }

    if (!product.slug?.trim()) {
      errors.push('Product slug is required');
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    if (!product.category?.trim()) {
      errors.push('Category is required');
    }

    if (!product.description?.trim()) {
      errors.push('Description is required');
    }

    if (product.minOrderQuantity !== undefined && product.minOrderQuantity < 1) {
      errors.push('Minimum order quantity must be at least 1');
    }

    if (product.hasVariants && product.variants) {
      if (product.variants.length === 0) {
        errors.push('At least one variant is required when using variants');
      }

      product.variants.forEach((variant, index) => {
        if (!variant.color?.trim()) {
          errors.push(`Variant ${index + 1}: Color is required`);
        }

        if (variant.price === undefined || variant.price < 0) {
          errors.push(`Variant ${index + 1}: Price must be a positive number`);
        }

        if (variant.sizes && variant.sizes.length === 0) {
          errors.push(`Variant ${index + 1}: At least one size is required`);
        }

        variant.sizes?.forEach((size, sizeIndex) => {
          if (!size.size?.trim()) {
            errors.push(`Variant ${index + 1}, Size ${sizeIndex + 1}: Size is required`);
          }

          if (!size.sku?.trim()) {
            errors.push(`Variant ${index + 1}, Size ${sizeIndex + 1}: SKU is required`);
          }

          if (size.inventory !== undefined && size.inventory < 0) {
            errors.push(`Variant ${index + 1}, Size ${sizeIndex + 1}: Inventory cannot be negative`);
          }
        });
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper to convert product to FormData
  async convertProductToFormData(product: Product, existingProduct?: Product): Promise<FormData> {
    const formData = new FormData();
    
    // Basic fields
    formData.append('name', product.name);
    formData.append('slug', product.slug);
    formData.append('category', product.category);
    formData.append('description', product.description);
    formData.append('minOrderQuantity', product.minOrderQuantity.toString());
    formData.append('hasVariants', product.hasVariants.toString());
    formData.append('isFeatured', product.isFeatured.toString());
    formData.append('isPublished', product.isPublished.toString());
    
    // Optional fields
    if (product.subcategory) {
      formData.append('subcategory', product.subcategory);
    }
    if (product.shortDescription) {
      formData.append('shortDescription', product.shortDescription);
    }
    if (product.weight) {
      formData.append('weight', product.weight.toString());
    }
    if (product.metaTitle) {
      formData.append('metaTitle', product.metaTitle);
    }
    if (product.metaDescription) {
      formData.append('metaDescription', product.metaDescription);
    }
    
    // Tags
    if (product.tags && product.tags.length > 0) {
      formData.append('tags', product.tags.join(','));
    }
    
    // Dimensions
    if (product.dimensions) {
      formData.append('dimensions.length', product.dimensions.length.toString());
      formData.append('dimensions.width', product.dimensions.width.toString());
      formData.append('dimensions.height', product.dimensions.height.toString());
    }
    
    // Handle main images
    if (product.images && product.images.length > 0) {
      // Separate existing and new images
      const existingImages: string[] = [];
      const newImagePromises: Promise<File>[] = [];
      
      product.images.forEach(async (image, index) => {
        if (image.startsWith('data:')) {
          // New image - convert from base64 to File
          const fetchPromise = fetch(image)
            .then(res => res.blob())
            .then(blob => new File([blob], `product-image-${Date.now()}-${index}.jpg`, { type: 'image/jpeg' }));
          newImagePromises.push(fetchPromise);
        } else {
          // Existing image URL
          existingImages.push(image);
        }
      });
      
      // Wait for all new images to be converted
      const newImages = await Promise.all(newImagePromises);
      
      // Append existing images to keep
      if (existingImages.length > 0) {
        formData.append('keepImages', existingImages.join(','));
      }
      
      // Append new image files
      newImages.forEach(file => {
        formData.append('mainImages', file);
      });
    }
    
    // Handle variants if product has variants
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      // Prepare variants data without images (we'll handle them separately)
      const variantsData = product.variants.map(variant => ({
        color: variant.color,
        colorCode: variant.colorCode,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        sizes: variant.sizes,
        isActive: variant.isActive,
        images: variant.images // We'll handle file conversion separately
      }));
      
      formData.append('variants', JSON.stringify(variantsData));
      
      // Handle variant images
      for (let i = 0; i < product.variants.length; i++) {
        const variant = product.variants[i];
        
        if (variant.images && variant.images.length > 0) {
          const existingVariantImages: string[] = [];
          const newVariantImagePromises: Promise<File>[] = [];
          
          variant.images.forEach(async (image, imgIndex) => {
            if (image.startsWith('data:')) {
              const fetchPromise = fetch(image)
                .then(res => res.blob())
                .then(blob => new File([blob], `variant-${i}-image-${Date.now()}-${imgIndex}.jpg`, { type: 'image/jpeg' }));
              newVariantImagePromises.push(fetchPromise);
            } else {
              existingVariantImages.push(image);
            }
          });
          
          const newVariantImages = await Promise.all(newVariantImagePromises);
          
          // Append existing variant images to keep
          if (existingVariantImages.length > 0) {
            formData.append(`keepVariantImages_${i}`, existingVariantImages.join(','));
          }
          
          // Append new variant image files
          newVariantImages.forEach(file => {
            formData.append(`variantImages_${i}`, file);
          });
        }
      }
    }
    
    return formData;
  }
}

// Create singleton instance
const productService = new ProductService();

export default productService;