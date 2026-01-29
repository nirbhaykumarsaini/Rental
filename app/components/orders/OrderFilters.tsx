// app/components/orders/OrderFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

interface OrderFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  initialFilters?: any;
}

export function OrderFilters({ isOpen, onClose, onApply, onReset, initialFilters }: OrderFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        search: initialFilters.search || '',
        status: initialFilters.status || 'all',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
        minAmount: initialFilters.minAmount || '',
        maxAmount: initialFilters.maxAmount || '',
      });
    }
  }, [initialFilters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
    });
    onReset();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Filter className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Orders</h3>
            <p className="text-sm text-gray-500">Refine your order search</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Order ID, customer, email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date From
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date To
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Min Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Max Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleInputChange}
              placeholder="100000.00"
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Reset Filters
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}