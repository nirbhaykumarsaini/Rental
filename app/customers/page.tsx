// app/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CustomerList } from '@/app/components/customers/CustomerList';
import { CustomerDetailsModal } from '@/app/components/customers/CustomerDetailsModal';
import { CustomerFilters } from '@/app/components/customers/CustomerFilters';
import { Users, Plus, Download, Filter, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { Customer, CustomerFilters as FiltersType } from '../types/customer.types';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    premiumCustomers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/v1/users?${queryParams}`);
      const data = await response.json();

      if (data.status) {
        setCustomers(data.data.users);
        setStats({
          totalCustomers: data.data.stats.totalCustomers,
          activeCustomers: data.data.stats.activeCustomers,
          vipCustomers: data.data.stats.vipCustomers,
          premiumCustomers: data.data.stats.premiumCustomers,
          totalRevenue: data.data.stats.totalRevenue,
          totalOrders: data.data.stats.totalOrders,
          averageOrderValue: data.data.stats.averageOrderValue,
        });
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Error fetching customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/users/stats');
      const data = await response.json();

      if (data.status) {
        setStats(prev => ({
          ...prev,
          newCustomers: data.data.overview.newCustomers,
          retentionRate: data.data.overview.retentionRate,
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [filters]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setIsFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-500">Manage your customer relationships and interactions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

          </div>
        </div>
      </div>

      {/* Filters Section */}
      {isFiltersOpen && (
        <CustomerFilters 
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          initialFilters={filters}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={fetchCustomers}
                className="text-sm text-red-700 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This month</span>
              <span className="text-green-600 font-medium">+8.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeCustomers.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active rate</span>
              <span className="text-green-600 font-medium">
                {stats.totalCustomers > 0 ? ((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">VIP Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.vipCustomers}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full">
              <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Top spenders</span>
              <span className="text-yellow-600 font-medium">
                {stats.totalCustomers > 0 ? ((stats.vipCustomers / stats.totalCustomers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Avg. Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.averageOrderValue)}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This month</span>
              <span className="text-green-600 font-medium">+12.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List Component */}
      <CustomerList 
        customers={customers}
        loading={loading}
        onViewCustomer={handleViewCustomer}
        onPageChange={handlePageChange}
        currentPage={filters.page || 1}
        totalCustomers={customers.length}
      />

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}