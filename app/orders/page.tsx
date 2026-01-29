// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { OrderList } from '@/app/components/orders/OrderList';
import { OrderFilters } from '@/app/components/orders/OrderFilters';
import { OrderDetailsModal } from '@/app/components/orders/OrderDetailsModal';
import { Package, Plus, Download, Filter, RefreshCw } from 'lucide-react';
import { Order, OrderFilters as FiltersType } from '../types/order.types';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
  });
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch orders
  const fetchOrders = async () => {
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

      const response = await fetch(`/api/v1/orders?${queryParams}`);
      const data = await response.json();

      if (data.status) {
        setOrders(data.data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/orders/stats');
      const data = await response.json();

      if (data.status) {
        setStats({
          totalOrders: data.data.totalOrders || 0,
          totalRevenue: data.data.totalRevenue || 0,
          pendingOrders: data.data.pendingOrders || 0,
          processingOrders: data.data.processingOrders || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [filters]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/v1/orders/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.status) {
        // Refresh orders and stats
        fetchOrders();
        fetchStats();
        
        // Update selected order if it's open
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status,
          });
        }

        // Show success message
        console.log('Order status updated successfully');
      } else {
        console.error('Failed to update order status:', data.message);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-500">View and manage all customer orders</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={() => {
                fetchOrders();
                fetchStats();
              }}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {isFiltersOpen && (
        <OrderFilters 
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          initialFilters={filters}
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This month</span>
              <span className="text-green-600 font-medium">+12.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full">
              <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Require action</span>
              <span className="text-yellow-600 font-medium">+8.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Processing</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.processingOrders}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">In progress</span>
              <span className="text-purple-600 font-medium">-3.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This month</span>
              <span className="text-green-600 font-medium">+18.7%</span>
            </div>
          </div>
        </div>
      </div>

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
                onClick={fetchOrders}
                className="text-sm text-red-700 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order List Component */}
      <OrderList 
        orders={orders}
        loading={loading}
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
        currentPage={filters.page || 1}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          order={selectedOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}