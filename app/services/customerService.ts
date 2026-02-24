// D:\B2B\app\services\customerService.ts
import { Customer, CustomerFilters, CustomersApiResponse, CustomerResponse, CustomerStats } from '../types/customer.types';

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
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class CustomerService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: false,
        message: errorData.message || `Error: ${response.status}`,
      };
    }

    try {
      const data = await response.json();
      return {
        status: true,
        data: data.data,
        message: data.message,
        pagination: data.pagination
      };
    } catch (error) {
      return {
        status: false,
        message: 'Invalid response from server',
      };
    }
  }

  // Get all customers with filters
  async getCustomers(filters: CustomerFilters = {}): Promise<CustomersApiResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Set defaults
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';

      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      // Add optional filters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.tier && filters.tier !== 'all') queryParams.append('tier', filters.tier);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.minOrders) queryParams.append('minOrders', filters.minOrders.toString());
      if (filters.maxOrders) queryParams.append('maxOrders', filters.maxOrders.toString());
      if (filters.minSpent) queryParams.append('minSpent', filters.minSpent.toString());
      if (filters.maxSpent) queryParams.append('maxSpent', filters.maxSpent.toString());
      if (filters.hasOrders !== undefined) queryParams.append('hasOrders', filters.hasOrders.toString());
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.tag) queryParams.append('tag', filters.tag);

      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      return this.handleResponse<any>(response) as Promise<CustomersApiResponse>;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: { 
          users: [], 
          pagination: { 
            page: 1, 
            limit: 10, 
            total: 0, 
            totalPages: 0, 
            hasNext: false, 
            hasPrev: false 
          } 
        }
      };
    }
  }

  // Get customer by ID
  async getCustomerById(id: string): Promise<CustomerResponse> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'Customer ID is required',
          data: {} as Customer
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      return this.handleResponse<Customer>(response) as Promise<CustomerResponse>;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch customer',
        data: {} as Customer
      };
    }
  }

  // Export customers to CSV
  async exportCustomers(filters: CustomerFilters = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();

      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      // Add export format
      queryParams.append('format', 'csv');

      const response = await fetch(`${API_BASE_URL}/api/v1/users/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export customers');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  }

  // Import customers from CSV
  async importCustomers(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/v1/users/import`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      return this.handleResponse<{ imported: number; errors: string[] }>(response);
    } catch (error) {
      console.error('Error importing customers:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to import customers',
      };
    }
  }

  // Update customer address
  async updateCustomerAddress(
    customerId: string, 
    addressId: string, 
    address: Partial<Customer['addresses'][0]>
  ): Promise<CustomerResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${customerId}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(address),
      });

      return this.handleResponse<Customer>(response) as Promise<CustomerResponse>;
    } catch (error) {
      console.error(`Error updating address for customer ${customerId}:`, error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update address',
        data: {} as Customer
      };
    }
  }

  // Format customer for display
  formatCustomerForDisplay(customer: Customer): Record<string, any> {
    return {
      'Customer ID': customer.customerId,
      'Name': `${customer.firstName} ${customer.lastName}`,
      'Email': customer.email,
      'Phone': customer.mobile || customer.phone || 'N/A',
      'Status': customer.status,
      'Tier': customer.tier || 'Regular',
      'Total Orders': customer.totalOrders,
      'Total Spent': customer.totalSpent,
      'Average Order': customer.averageOrderValue,
      'Join Date': new Date(customer.joinDate).toLocaleDateString(),
      'Last Order': customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never',
      'Company': customer.company || 'N/A',
      'GST': customer.gst || 'N/A',
      'Source': customer.source || 'N/A',
      'Tags': customer.tags?.join(', ') || 'None'
    };
  }

}

// Create and export singleton instance
const customerService = new CustomerService();
export default customerService;