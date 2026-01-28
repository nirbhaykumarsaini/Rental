


// app/services/categoryService.ts
import { Category, CategoryInput } from '@/app/types/category.types';

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

export interface CategoryFilters {
  page?: number;
  limit?: number;
  featured?: boolean;
  active?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  withSubcategories?: boolean;
  withProductCount?: boolean;
}

export interface CategoryStatistics {
  totalCategories: number;
  inactiveCategories: number;
  activeCategories: number;
}

class CategoryService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      return {
        status: false,
        message: errorMessage
      };
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

  private buildQueryParams(filters: Record<string, any>): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return params.toString();
  }

  async createCategory(categoryData: Category, imageFile?: File): Promise<ApiResponse<Category>> {
    try {
      // Validate required fields
      const validation = this.validateCategoryData(categoryData);
      if (!validation.valid) {
        return {
          status: false,
          message: validation.errors.join(', ')
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('name', categoryData.name);
      formData.append('slug', categoryData.slug);
      formData.append('isActive', String(categoryData.isActive ?? true));
      
      if (imageFile) {
        formData.append('category_image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        body: formData
      });
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to create category'
      };
    }
  }

  async updateCategory(id: string, categoryData: Partial<Category>, imageFile?: File, removeImage: boolean = false): Promise<ApiResponse<Category>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Category ID is required'
        };
      }

      // Create FormData
      const formData = new FormData();
      
      if (categoryData.name !== undefined) {
        formData.append('name', categoryData.name);
      }
      
      if (categoryData.slug !== undefined) {
        formData.append('slug', categoryData.slug);
      }
      
      if (categoryData.isActive !== undefined) {
        formData.append('isActive', String(categoryData.isActive));
      }
      
      if (imageFile) {
        formData.append('category_image', imageFile);
      }
      
      if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update category'
      };
    }
  }

  async uploadImage(imageFile: File, folder: string = 'categories'): Promise<ApiResponse<{ url: string, publicId: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('folder', folder);

      const response = await fetch(`${API_BASE_URL}/categories/upload-image`, {
        method: 'POST',
        body: formData
      });
      
      return this.handleResponse<{ url: string, publicId: string }>(response);
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to upload image'
      };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Category ID is required'
        };
      }

      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      
      return this.handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to delete category'
      };
    }
  }

  async checkSlugAvailability(slug: string, categoryId?: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      if (!slug) {
        return {
          status: false,
          message: 'Slug is required'
        };
      }

      const params = new URLSearchParams({ slug });
      if (categoryId) {
        params.append('categoryId', categoryId);
      }

      const response = await fetch(`${API_BASE_URL}/categories/check-slug?${params}`);
      
      return this.handleResponse<{ available: boolean }>(response);
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to check slug availability'
      };
    }
  }

  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Category[]>> {
    try {
      const queryParams = this.buildQueryParams(filters);
      const url = `${API_BASE_URL}/categories?${queryParams}`;
      
      const response = await fetch(url, {
        cache: 'no-store',
      });
      
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        cache: 'no-store',
      });
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch category'
      };
    }
  }

    async getStatistics(): Promise<ApiResponse<CategoryStatistics>> {
    try {
      const url = `${API_BASE_URL}/categories/statistics`;
      const response = await fetch(url, {
        cache: 'no-store',
      });
      
      return this.handleResponse<CategoryStatistics>(response);
    } catch (error) {
      console.error('Error fetching category statistics:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }

  validateCategoryData(category: CategoryInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!category.name?.trim()) {
      errors.push('Category name is required');
    } else if (category.name.length < 2) {
      errors.push('Category name must be at least 2 characters long');
    } else if (category.name.length > 100) {
      errors.push('Category name cannot exceed 100 characters');
    }

    if (!category.slug?.trim()) {
      errors.push('Category slug is required');
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    } else if (category.slug.length > 100) {
      errors.push('Slug cannot exceed 100 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
}

const categoryService = new CategoryService();
export default categoryService;