// D:\B2B\app\components\customers\CustomerList.tsx
'use client';

import { useState } from 'react';
import { Customer } from '@/app/types/customer.types';
import {
  Eye,
  Mail,
  Phone,
  MoreVertical,
  Star,
  Clock,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  User,
  Shield,
  Award,
  TrendingUp,
  MessageSquare,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer?: (customer: Customer) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalCustomers: number;
  totalPages?: number;
  onStatusChange?: (customerId: string, status: Customer['status']) => void;
  onRefresh?: () => void;
}

export function CustomerList({
  customers,
  loading,
  onViewCustomer,
  onEditCustomer,
  onPageChange,
  currentPage,
  totalCustomers,
  totalPages = 1,
  onStatusChange,
  onRefresh
}: CustomerListProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'inactive': return <Clock className="w-3 h-3" />;
      case 'blocked': return <Shield className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (selectedTier !== 'all' && customer.tier !== selectedTier) return false;
    if (selectedStatus !== 'all' && customer.status !== selectedStatus) return false;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (email?: string) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-green-500 to-emerald-500',
      'bg-gradient-to-r from-orange-500 to-red-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500',
      'bg-gradient-to-r from-teal-500 to-cyan-500'
    ];
    
    if (!email) return colors[0];
    
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (loading && customers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Header with Filters and Bulk Actions */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredCustomers.length} of {totalCustomers} customers
                </p>
              </div>
              
            </div>
            
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders & Spending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={`${customer.firstName} ${customer.lastName}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`h-12 w-12 rounded-full ${getAvatarColor(customer.email)} flex items-center justify-center`}>
                          <span className="text-white font-medium text-lg">
                            {getInitials(customer.firstName, customer.lastName)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div
                        className="text-sm font-medium text-gray-900 hover:text-purple-700 cursor-pointer"
                        onClick={() => onViewCustomer(customer)}
                      >
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{customer.mobile}</div>
                     
                    </div>
                  </div>
                </td>
               
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                    
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                        {getStatusIcon(customer.status)}
                        <span className="ml-1">
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </span>
                    </div>                    
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-700">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        Total Orders
                      </div>
                      <div className="font-medium text-gray-900">{customer.totalOrders}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-700">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        Total Spent
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        Pending
                      </div>
                      <div className="text-sm text-yellow-600 font-medium">{customer.pendingOrders}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Joined: {formatDate(customer.joinDate)}</span>
                    </div>
                    
                    {customer.lastOrderDate && (
                      <>
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Last Order: {formatDate(customer.lastOrderDate)}</span>
                        </div>
                      </>
                    )}

                    {customer.lastLoginAt && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        <span>Last login: {formatDate(customer.lastLoginAt)}</span>
                      </div>
                    )}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && !loading && (
        <div className="py-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {selectedTier !== 'all' || selectedStatus !== 'all'
              ? 'Try changing your filters to see more customers.'
              : 'No customers have been added yet.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-medium">{filteredCustomers.length}</span> of{' '}
              <span className="font-medium">{totalCustomers}</span> customers
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium flex items-center ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => onPageChange(totalPages)}
                      className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium flex items-center ${
                  currentPage >= totalPages
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}