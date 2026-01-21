// app/components/customers/CustomerFilters.tsx
'use client';

import { useState } from 'react';
import { Search, Calendar, Filter, X, Tag, Users } from 'lucide-react';

interface CustomerFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerFilters({ isOpen, onClose }: CustomerFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    tier: 'all',
    status: 'all',
    joinDateFrom: '',
    joinDateTo: '',
    minOrders: '',
    maxOrders: '',
    minSpent: '',
    maxSpent: '',
    tags: [] as string[],
  });

  const availableTags = [
    'frequent-buyer',
    'newsletter-subscriber',
    'wholesale',
    'business-customer',
    'early-adopter',
    'tech-enthusiast',
    'abandoned-cart',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
    // Apply filters logic
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      tier: 'all',
      status: 'all',
      joinDateFrom: '',
      joinDateTo: '',
      minOrders: '',
      maxOrders: '',
      minSpent: '',
      maxSpent: '',
      tags: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Filter className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Customers</h3>
            <p className="text-sm text-gray-500">Refine your customer search</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              placeholder="Name, email, phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tier */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Customer Tier
          </label>
          <select
            name="tier"
            value={filters.tier}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Tiers</option>
            <option value="vip">VIP</option>
            <option value="premium">Premium</option>
            <option value="regular">Regular</option>
          </select>
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Join Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Joined From
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="joinDateFrom"
              value={filters.joinDateFrom}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Joined To
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="joinDateTo"
              value={filters.joinDateTo}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Min Orders
          </label>
          <input
            type="number"
            name="minOrders"
            value={filters.minOrders}
            onChange={handleInputChange}
            placeholder="0"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Max Orders
          </label>
          <input
            type="number"
            name="maxOrders"
            value={filters.maxOrders}
            onChange={handleInputChange}
            placeholder="100"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Min Spent
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="minSpent"
              value={filters.minSpent}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Max Spent
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="maxSpent"
              value={filters.maxSpent}
              onChange={handleInputChange}
              placeholder="10000.00"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="w-5 h-5 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-700">Tags</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.tags.includes(tag)
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {tag}
              {filters.tags.includes(tag) && (
                <span className="ml-1.5">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleResetFilters}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Reset Filters
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}