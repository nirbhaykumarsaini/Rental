// D:\B2B\app\customers\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CustomerList } from '@/app/components/customers/CustomerList';
import { CustomerDetailsModal } from '@/app/components/customers/CustomerDetailsModal';
import { CustomerFilters } from '@/app/components/customers/CustomerFilters';
import { Users, Download, RefreshCw, TrendingUp, UserPlus } from 'lucide-react';
import { Customer, CustomerFilters as FiltersType } from '../types/customer.types';
import customerService from '../services/customerService';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalRevenue: 0
  });

  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getCustomers(filters);

      if (response.status && response.data) {
        setCustomers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch customers');
        toast.error(response.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Error fetching customers');
      toast.error('Error fetching customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    // Implement edit functionality
    console.log('Edit customer:', customer);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }

  const handleRefresh = () => {
    fetchCustomers();
  };

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-500">Manage your customer relationships and interactions</p>
            </div>
          </div>
        </div>        
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={fetchCustomers}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer List Component */}
      <CustomerList
        customers={customers}
        loading={loading}
        onViewCustomer={handleViewCustomer}
        onEditCustomer={handleEditCustomer}
        onPageChange={handlePageChange}
        currentPage={filters.page || 1}
        totalCustomers={pagination.total}
        totalPages={pagination.totalPages}
        onRefresh={handleRefresh}
      />

      {/* Customer Details Modal */}
      {/* {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          customer={selectedCustomer}
        />
      )} */}
    </div>
  );
}