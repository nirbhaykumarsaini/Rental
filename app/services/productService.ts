// D:\B2B\app\services\productService.ts
import { Product, ProductFilters, ProductStatistics } from '@/app/types/product.types';

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

class ProductService {
  private readonly DEFAULT_TIMEOUT = 30000;

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
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

  // Get all products with filters
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      filters.page = filters.page || 1;
      filters.limit = filters.limit || 10;
      filters.sortBy = filters.sortBy || 'createdAt';
      filters.sortOrder = filters.sortOrder || 'desc';
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const url = `${API_BASE_URL}/products?${queryParams}`;
      const response = await this.safeFetch(url, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 15000);
      
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

      const response = await this.safeFetch(`${API_BASE_URL}/products/${id}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      }, 10000);
      
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

      const response = await this.safeFetch(`${API_BASE_URL}/products/slug/${slug}`, {
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

  // Create product
  async createProduct(productData: FormData): Promise<ApiResponse<Product>> {
    try {
      // Validate required fields
      const requiredFields = ['name', 'slug', 'category', 'description', 'color', 'price'];
      for (const field of requiredFields) {
        if (!productData.get(field)) {
          return {
            status: false,
            message: `${field} is required`
          };
        }
      }

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

  // Update product
  async updateProduct(id: string, productData: FormData): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Product ID is required'
        };
      }

      const response = await this.safeFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: productData,
      }, 60000);
      
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

      const response = await this.safeFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      }, 10000);
      
      return this.handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to delete product'
      };
    }
  }

  // Toggle featured status
  async toggleFeatured(id: string, isFeatured: boolean): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData();
      formData.append('isFeatured', isFeatured.toString());
      
      return this.updateProduct(id, formData);
    } catch (error) {
      console.error(`Error toggling featured status for product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update featured status'
      };
    }
  }

  // Toggle publish status
  async togglePublish(id: string, isPublished: boolean): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData();
      formData.append('isPublished', isPublished.toString());
      
      return this.updateProduct(id, formData);
    } catch (error) {
      console.error(`Error updating publish status for product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update publish status'
      };
    }
  }

  // Toggle availability
  async toggleAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData();
      formData.append('isAvailable', isAvailable.toString());
      
      return this.updateProduct(id, formData);
    } catch (error) {
      console.error(`Error updating availability for product ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update availability'
      };
    }
  }

  // Get product statistics
  async getStatistics(): Promise<ApiResponse<ProductStatistics>> {
    try {
      const response = await this.safeFetch(`${API_BASE_URL}/products/statistics`, {
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

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return this.getProducts({ 
      featured: true, 
      available: true,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  // Get new arrivals
  async getNewArrivals(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return this.getProducts({ 
      newArrival: true, 
      available: true,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  // Get products by category
  async getProductsByCategory(category: string, limit: number = 10): Promise<ApiResponse<Product[]>> {
    return this.getProducts({ 
      category, 
      available: true,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  // Search products
  async searchProducts(query: string, limit: number = 10): Promise<ApiResponse<Product[]>> {
    return this.getProducts({ 
      search: query, 
      available: true,
      limit 
    });
  }

  // Validate product data
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

    if (!product.color?.trim()) {
      errors.push('Color is required');
    }

    if (!product.price || product.price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (!product.sizes || product.sizes.length === 0) {
      errors.push('At least one size is required');
    }

    if (!product.features || product.features.length === 0) {
      errors.push('At least one feature is required');
    }

    if (!product.rentalPrices || product.rentalPrices.length === 0) {
      errors.push('At least one rental price is required');
    } else {
      const activeRentalPrices = product.rentalPrices.filter(rp => rp.isActive);
      if (activeRentalPrices.length === 0) {
        errors.push('At least one active rental price is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const productService = new ProductService();
export default productService;