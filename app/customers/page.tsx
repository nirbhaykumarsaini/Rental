// app/customers/page.tsx
'use client';

import { useState } from 'react';
import { CustomerList } from '@/app/components/customers/CustomerList';
import { CustomerDetailsModal } from '@/app/components/customers/CustomerDetailsModal';
import { CustomerFilters } from '@/app/components/customers/CustomerFilters';
import { Users, Plus, Download, Filter, Mail, MessageSquare } from 'lucide-react';
import { Customer } from '../types/customer.types';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleSendEmail = () => {
    console.log('Send email to all selected customers');
  };

  const handleExportCustomers = () => {
    console.log('Exporting customers...');
  };

  const handleBulkActions = (action: string) => {
    console.log('Bulk action:', action);
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
            <button
              onClick={handleExportCustomers}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <CustomerFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">1,842</p>
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
              <p className="text-2xl font-semibold text-gray-900">1,456</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active rate</span>
              <span className="text-green-600 font-medium">79%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">VIP Customers</p>
              <p className="text-2xl font-semibold text-gray-900">124</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full">
              <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Top spenders</span>
              <span className="text-yellow-600 font-medium">6.7%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Avg. Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">$245.80</p>
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

      {/* Bulk Actions Bar */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Select all</span>
            </div>
            <span className="text-sm text-gray-500">5 customers selected</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBulkActions('email')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </button>
            <button
              onClick={() => handleBulkActions('sms')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send SMS
            </button>
            <select
              onChange={(e) => handleBulkActions(e.target.value)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">More actions</option>
              <option value="export">Export selected</option>
              <option value="tag">Add tag</option>
              <option value="segment">Add to segment</option>
              <option value="delete">Delete selected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List Component */}
      <CustomerList 
        onViewCustomer={handleViewCustomer}
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