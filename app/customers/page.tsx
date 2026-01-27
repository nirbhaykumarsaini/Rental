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