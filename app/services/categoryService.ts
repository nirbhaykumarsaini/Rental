import { Category, CategoryFormData } from '@/app/types/category.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  parentId?: string | null;
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
  mainCategories: number;
  subCategories: number;
  activeCategories: number;
  featuredCategories: number;
  totalProductsByCategory: number;
}

export interface BulkCategoryOperation {
  ids: string[];
  action: 'delete' | 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'updateParent';
  data?: any;
}

export interface CategorySelectOption {
  value: string;
  label: string;
  color?: string;
  hasSubcategories?: boolean;
}

class CategoryService {
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly MIN_TIMEOUT = 5000;

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        return {
          status: false,
          message: 'Unauthorized. Please login again.'
        };
      } else if (response.status === 403) {
        return {
          status: false,
          message: 'Forbidden. You do not have permission.'
        };
      } else if (response.status === 404) {
        return {
          status: false,
          message: 'Resource not found.'
        };
      } else if (response.status === 409) {
        return {
          status: false,
          message: 'Conflict. Resource already exists.'
        };
      } else if (response.status >= 500) {
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
    const actualTimeout = Math.max(
      this.MIN_TIMEOUT,
      timeout || this.DEFAULT_TIMEOUT
    );

    const controller = new AbortController();
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`Request timed out after ${actualTimeout}ms`));
      }, actualTimeout);
    });

    try {
      const fetchPromise = fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        }
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return response as Response;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${actualTimeout}ms`);
      }
      throw error;
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

  // =========== CRUD Operations ===========

  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Category[]>> {
    try {
      filters.page = filters.page || 1;
      filters.limit = filters.limit || 50;
      filters.sortBy = filters.sortBy || 'sortOrder';
      filters.sortOrder = filters.sortOrder || 'asc';
      
      const queryParams = this.buildQueryParams(filters);
      const url = `${API_BASE_URL}/categories?${queryParams}`;
      
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 15000);
      
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Category ID is required'
        };
      }

      const url = `${API_BASE_URL}/categories/${id}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 10000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch category'
      };
    }
  }

  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    try {
      if (!slug) {
        return {
          status: false,
          message: 'Category slug is required'
        };
      }

      const url = `${API_BASE_URL}/categories/slug/${slug}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 10000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error fetching category by slug ${slug}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch category'
      };
    }
  }

  async createCategory(categoryData: CategoryFormData): Promise<ApiResponse<Category>> {
    try {
      // Validate required fields
      const validation = this.validateCategoryData(categoryData);
      if (!validation.valid) {
        return {
          status: false,
          message: validation.errors.join(', ')
        };
      }

      // Generate slug if not provided
      if (!categoryData.slug && categoryData.name) {
        categoryData.slug = this.generateSlug(categoryData.name);
      }

      const url = `${API_BASE_URL}/categories`;
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      }, 15000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to create category'
      };
    }
  }

  async updateCategory(id: string, categoryData: Partial<CategoryFormData>): Promise<ApiResponse<Category>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Category ID is required'
        };
      }

      const url = `${API_BASE_URL}/categories/${id}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      }, 15000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update category'
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

      const url = `${API_BASE_URL}/categories/${id}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
      }, 10000);
      
      return this.handleResponse<void>(response);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to delete category'
      };
    }
  }

  // =========== Specialized Queries ===========

  async getParentCategories(activeOnly: boolean = true): Promise<ApiResponse<Category[]>> {
    try {
      const url = `${API_BASE_URL}/categories/parents?active=${activeOnly}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 10000);
      
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch parent categories'
      };
    }
  }

  async getCategoryHierarchy(): Promise<ApiResponse<Category[]>> {
    try {
      const url = `${API_BASE_URL}/categories/hierarchy`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 15000);
      
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch category hierarchy'
      };
    }
  }

  async getFeaturedCategories(limit: number = 10): Promise<ApiResponse<Category[]>> {
    try {
      const url = `${API_BASE_URL}/categories/featured?limit=${limit}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 10000);
      
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch featured categories'
      };
    }
  }

  async getActiveCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await this.getCategories({
        active: true,
        limit: 100
      });
      return response;
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch active categories'
      };
    }
  }

  // =========== Status Updates ===========

  async updateSortOrder(id: string, sortOrder: number): Promise<ApiResponse<Category>> {
    try {
      if (!id || sortOrder === undefined) {
        return {
          status: false,
          message: 'Category ID and sort order are required'
        };
      }

      const url = `${API_BASE_URL}/categories/${id}/sort-order`;
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sortOrder }),
      }, 10000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error updating sort order for category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update sort order'
      };
    }
  }

  async toggleFeatured(id: string, isFeatured: boolean): Promise<ApiResponse<Category>> {
    try {
      if (!id || isFeatured === undefined) {
        return {
          status: false,
          message: 'Category ID and featured status are required'
        };
      }

      const url = `${API_BASE_URL}/categories/${id}/featured`;
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured }),
      }, 10000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error updating featured status for category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update featured status'
      };
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<Category>> {
    try {
      if (!id || isActive === undefined) {
        return {
          status: false,
          message: 'Category ID and active status are required'
        };
      }

      const url = `${API_BASE_URL}/categories/${id}/active`;
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      }, 10000);
      
      return this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error updating active status for category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update active status'
      };
    }
  }

  // =========== Statistics ===========

  async getStatistics(): Promise<ApiResponse<CategoryStatistics>> {
    try {
      const url = `${API_BASE_URL}/categories/statistics`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 10000);
      
      return this.handleResponse<CategoryStatistics>(response);
    } catch (error) {
      console.error('Error fetching category statistics:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }

  // =========== Bulk Operations ===========

  async bulkUpdateCategories(operation: BulkCategoryOperation): Promise<ApiResponse<any>> {
    try {
      if (!operation.ids || operation.ids.length === 0 || !operation.action) {
        return {
          status: false,
          message: 'Category IDs and action are required'
        };
      }

      const url = `${API_BASE_URL}/categories/bulk`;
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation),
      }, 30000);
      
      return this.handleResponse<any>(response);
    } catch (error) {
      console.error('Error bulk updating categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to bulk update categories'
      };
    }
  }

  async bulkDeleteCategories(ids: string[]): Promise<ApiResponse<any>> {
    return this.bulkUpdateCategories({
      ids,
      action: 'delete'
    });
  }

  async bulkActivateCategories(ids: string[]): Promise<ApiResponse<any>> {
    return this.bulkUpdateCategories({
      ids,
      action: 'activate'
    });
  }

  async bulkDeactivateCategories(ids: string[]): Promise<ApiResponse<any>> {
    return this.bulkUpdateCategories({
      ids,
      action: 'deactivate'
    });
  }

  async bulkFeatureCategories(ids: string[]): Promise<ApiResponse<any>> {
    return this.bulkUpdateCategories({
      ids,
      action: 'feature'
    });
  }

  async bulkUnfeatureCategories(ids: string[]): Promise<ApiResponse<any>> {
    return this.bulkUpdateCategories({
      ids,
      action: 'unfeature'
    });
  }

  // =========== Search & Validation ===========

  async searchCategories(query: string, limit: number = 10): Promise<ApiResponse<Category[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          status: false,
          message: 'Search query must be at least 2 characters'
        };
      }

      const url = `${API_BASE_URL}/categories/search?query=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 5000);
      
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error searching categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to search categories'
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

      const url = `${API_BASE_URL}/categories/check-slug?${params}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 5000);
      
      return this.handleResponse<{ available: boolean }>(response);
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to check slug availability'
      };
    }
  }

  // =========== Utility Methods ===========

  validateCategoryData(category: CategoryFormData): { valid: boolean; errors: string[] } {
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

    if (category.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(category.color)) {
      errors.push('Please enter a valid hex color code');
    }

    if (category.description && category.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    if (category.sortOrder !== undefined && category.sortOrder < 0) {
      errors.push('Sort order cannot be negative');
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

  async getCategoriesForSelect(includeColors: boolean = false): Promise<ApiResponse<CategorySelectOption[]>> {
    try {
      const response = await this.getParentCategories(true);
      
      if (!response.status || !response.data) {
        return response as any;
      }

      const selectOptions = response.data.map(category => ({
        value: category.id,
        label: category.name,
        ...(includeColors && { color: category.color }),
        hasSubcategories: category.subCategories && category.subCategories.length > 0
      }));

      return {
        status: true,
        data: selectOptions
      };
    } catch (error) {
      console.error('Error fetching categories for select:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  async getAllCategoriesForSelect(includeColors: boolean = false): Promise<ApiResponse<CategorySelectOption[]>> {
    try {
      const response = await this.getCategories({
        active: true,
        limit: 200,
        withSubcategories: false
      });

      if (!response.status || !response.data) {
        return response as any;
      }

      const selectOptions = response.data.map(category => ({
        value: category.id,
        label: category.name,
        ...(includeColors && { color: category.color })
      }));

      return {
        status: true,
        data: selectOptions
      };
    } catch (error) {
      console.error('Error fetching all categories for select:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  async getCategoryTree(): Promise<ApiResponse<Array<Category & { children?: Category[] }>>> {
    try {
      const response = await this.getCategoryHierarchy();
      
      if (!response.status || !response.data) {
        return response;
      }

      // Transform hierarchy into tree structure
      const buildTree = (categories: Category[], parentId: string | null = null) => {
        return categories
          .filter(cat => cat.parentId?.toString() === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(categories, cat.id)
          }));
      };

      const tree = buildTree(response.data);
      
      return {
        status: true,
        data: tree
      };
    } catch (error) {
      console.error('Error building category tree:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to build category tree'
      };
    }
  }

  async moveCategory(categoryId: string, newParentId: string | null): Promise<ApiResponse<Category>> {
    try {
      if (!categoryId) {
        return {
          status: false,
          message: 'Category ID is required'
        };
      }

      // Prevent circular reference
      if (categoryId === newParentId) {
        return {
          status: false,
          message: 'Category cannot be its own parent'
        };
      }

      // Check if new parent exists
      if (newParentId) {
        const parentResponse = await this.getCategoryById(newParentId);
        if (!parentResponse.status || !parentResponse.data) {
          return {
            status: false,
            message: 'Parent category not found'
          };
        }
      }

      return this.updateCategory(categoryId, { parentId: newParentId });
    } catch (error) {
      console.error(`Error moving category ${categoryId}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to move category'
      };
    }
  }

  async duplicateCategory(id: string, newName?: string): Promise<ApiResponse<Category>> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Category ID is required'
        };
      }

      const response = await this.getCategoryById(id);
      if (!response.status || !response.data) {
        return response;
      }

      const original = response.data;
      const baseSlug = newName ? this.generateSlug(newName) : `${original.slug}-copy`;
      
      // Find unique slug
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const checkResponse = await this.checkSlugAvailability(slug);
        if (checkResponse.status && checkResponse.data?.available) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const categoryData: CategoryFormData = {
        name: newName || `${original.name} (Copy)`,
        description: original.description || '',
        slug,
        color: original.color,
        parentId: original.parentId,
        sortOrder: original.sortOrder || 0,
        isFeatured: original.isFeatured || false,
        isActive: original.isActive !== undefined ? original.isActive : true,
      };

      return this.createCategory(categoryData);
    } catch (error) {
      console.error(`Error duplicating category ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to duplicate category'
      };
    }
  }

  async getCategoriesWithProducts(): Promise<ApiResponse<Array<Category & { productCount: number }>>> {
    try {
      const response = await this.getCategories({
        withProductCount: true,
        active: true
      });

      if (!response.status || !response.data) {
        return response;
      }

      // Filter out categories with 0 products if needed
      const categoriesWithProducts = response.data.filter(cat => 
        cat.productCount && cat.productCount > 0
      );

      return {
        status: true,
        data: categoriesWithProducts
      };
    } catch (error) {
      console.error('Error fetching categories with products:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories with products'
      };
    }
  }

  async exportCategories(format: 'csv' | 'json' = 'json'): Promise<ApiResponse<{ url: string }>> {
    try {
      const url = `${API_BASE_URL}/categories/export?format=${format}`;
      const response = await this.fetchWithTimeout(url, {
        cache: 'no-store',
      }, 30000);
      
      return this.handleResponse<{ url: string }>(response);
    } catch (error) {
      console.error('Error exporting categories:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to export categories'
      };
    }
  }

  // Helper for optimistic updates
  updateLocalCategory(categories: Category[], updatedCategory: Category): Category[] {
    return categories.map(category => {
      if (category.id === updatedCategory.id) {
        return { ...category, ...updatedCategory };
      }
      
      // Update in subcategories if it exists there
      if (category.subCategories) {
        const updatedSubCategories = category.subCategories.map(subCat =>
          subCat.id === updatedCategory.id ? { ...subCat, ...updatedCategory } : subCat
        );
        
        if (JSON.stringify(category.subCategories) !== JSON.stringify(updatedSubCategories)) {
          return { ...category, subCategories: updatedSubCategories };
        }
      }
      
      return category;
    });
  }

  removeLocalCategory(categories: Category[], categoryId: string): Category[] {
    return categories.filter(category => {
      // Remove main category
      if (category.id === categoryId) {
        return false;
      }
      
      // Filter out from subcategories
      if (category.subCategories) {
        const filteredSubCategories = category.subCategories.filter(subCat => subCat.id !== categoryId);
        if (filteredSubCategories.length !== category.subCategories.length) {
          category.subCategories = filteredSubCategories;
        }
      }
      
      return true;
    });
  }
}

// Create singleton instance
const categoryService = new CategoryService();

export default categoryService;