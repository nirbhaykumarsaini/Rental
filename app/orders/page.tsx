// app/orders/page.tsx
'use client';

import { useState } from 'react';
import { OrderList } from '@/app/components/orders/OrderList';
import { OrderFilters } from '@/app/components/orders/OrderFilters';
import { OrderDetailsModal } from '@/app/components/orders/OrderDetailsModal';
import { Package, Plus, Download, Filter } from 'lucide-react';
import { Order } from '../types/order.types';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    console.log('Update order status:', orderId, status);
    // API call to update order status
  };

  const handleExportOrders = () => {
    console.log('Exporting orders...');
    // Export functionality
  };

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
              onClick={handleExportOrders}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <OrderFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">1,248</p>
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
              <p className="text-2xl font-semibold text-gray-900">48</p>
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
              <p className="text-2xl font-semibold text-gray-900">32</p>
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
              <p className="text-2xl font-semibold text-gray-900">$24,580</p>
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

      {/* Order List Component */}
      <OrderList 
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
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