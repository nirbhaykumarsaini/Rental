// D:\B2B\app\orders\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { OrderList } from '@/app/components/orders/OrderList';
import { OrderDetailsModal } from '@/app/components/orders/OrderDetailsModal';
import { Package, AlertCircle } from 'lucide-react';
import { Order, OrderFilters as FiltersType } from '../types/order.types';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
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

      const response = await fetch(`/api/v1/user/orders?${queryParams}`);
      const data = await response.json();

      if (data.status) {
        setOrders(data.data);
        setPagination(data.pagination);
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

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      const response = await fetch(`/api/v1/user/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: status }),
      });

      const data = await response.json();

      if (data.status) {
        // Refresh orders
        fetchOrders();
        
        // Update selected order if it's open
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            orderStatus: status,
          });
        }
      } else {
        console.error('Failed to update order status:', data.message);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  }


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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500">View and manage all customer orders</p>
            </div>
          </div>
          
        </div>
      </div>      

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={fetchOrders}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
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
        totalPages={pagination.totalPages}
        totalOrders={pagination.total}
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