// app/components/customers/CustomerList.tsx
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
  UserX,
  CheckCircle,
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  TrendingUp,
  Package,
  DollarSign,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  UserMinus
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalCustomers: number;
  totalPages?: number;
  onStatusChange?: (customerId: string, status: Customer['status']) => void;
  onTierChange?: (customerId: string, tier: Customer['tier']) => void;
}

export function CustomerList({ 
  customers, 
  loading, 
  onViewCustomer, 
  onEditCustomer,
  onDeleteCustomer,
  onPageChange, 
  currentPage,
  totalCustomers,
  totalPages = 1,
  onStatusChange,
  onTierChange
}: CustomerListProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [tierUpdateId, setTierUpdateId] = useState<string | null>(null);

  const getTierColor = (tier: Customer['tier']) => {
    switch (tier) {
      case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'regular': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'inactive': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getTierIcon = (tier: Customer['tier']) => {
    switch (tier) {
      case 'vip': return <Star className="w-3 h-3" />;
      case 'premium': return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleStatusUpdate = async (customerId: string, status: Customer['status']) => {
    if (!onStatusChange) return;
    
    setStatusUpdateId(customerId);
    try {
      await onStatusChange(customerId, status);
    } finally {
      setStatusUpdateId(null);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCustomers.length === 0 || !onStatusChange || !onDeleteCustomer) return;
    
    setIsBulkActionLoading(true);
    try {
      if (action === 'delete') {
        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
          return;
        }
        
        // Delete selected customers
        for (const customerId of selectedCustomers) {
          await onDeleteCustomer(customerId);
        }
      } else {
        // Update status for selected customers
        const newStatus = action === 'activate' ? 'active' : 'inactive';
        for (const customerId of selectedCustomers) {
          await onStatusChange(customerId, newStatus);
        }
      }
      
      // Clear selection after action
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (selectedTier !== 'all' && customer.tier !== selectedTier) return false;
    if (selectedStatus !== 'all' && customer.status !== selectedStatus) return false;
    return true;
  });

  const tierOptions = [
    { value: 'all', label: 'All Tiers', count: customers.length },
    { value: 'vip', label: 'VIP', count: customers.filter(c => c.tier === 'vip').length },
    { value: 'premium', label: 'Premium', count: customers.filter(c => c.tier === 'premium').length },
    { value: 'regular', label: 'Regular', count: customers.filter(c => c.tier === 'regular').length },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', count: customers.length },
    { value: 'active', label: 'Active', count: customers.filter(c => c.status === 'active').length },
    { value: 'inactive', label: 'Inactive', count: customers.filter(c => c.status === 'inactive').length },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const calculateDaysSinceLastOrder = (lastOrderDate?: Date) => {
    if (!lastOrderDate) return 'Never ordered';
    
    const today = new Date();
    const lastOrder = new Date(lastOrderDate);
    const diffTime = Math.abs(today.getTime() - lastOrder.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getCustomerValueBadge = (totalSpent: number) => {
    if (totalSpent >= 50000) return 'High Value';
    if (totalSpent >= 10000) return 'Medium Value';
    if (totalSpent >= 1000) return 'Regular';
    return 'New';
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
                  {filteredCustomers.length} of {customers.length} customers
                </p>
              </div>
              
              {selectedCustomers.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedCustomers.length} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      disabled={isBulkActionLoading}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isBulkActionLoading ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <UserCheck className="w-3 h-3 mr-1" />
                      )}
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      disabled={isBulkActionLoading}
                      className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <UserMinus className="w-3 h-3 mr-1" />
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      disabled={isBulkActionLoading}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tierOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTier(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center ${
                      selectedTier === option.value
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    {option.label}
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                      selectedTier === option.value
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center ${
                      selectedStatus === option.value
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    {option.label}
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                      selectedStatus === option.value
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier & Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders & Spending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
   
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div 
                          className="text-sm font-medium text-gray-900 hover:text-purple-700 cursor-pointer"
                          onClick={() => onViewCustomer(customer)}
                        >
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.tags && customer.tags.includes('wholesale') && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Wholesale
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      {customer.mobile && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.mobile}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {customer.customerId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(customer.tier)}`}>
                        {getTierIcon(customer.tier)}
                        <span className="ml-1.5">
                          {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                        <span className="mr-1.5">{getStatusIcon(customer.status)}</span>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-1">
                      {customer.status !== 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(customer.id, 'active')}
                          disabled={statusUpdateId === customer.id}
                          className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {statusUpdateId === customer.id ? (
                            <Loader2 className="w-2 h-2 mr-1 animate-spin" />
                          ) : (
                            'Activate'
                          )}
                        </button>
                      )}
                      {customer.status !== 'inactive' && (
                        <button
                          onClick={() => handleStatusUpdate(customer.id, 'inactive')}
                          disabled={statusUpdateId === customer.id}
                          className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-700">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        Orders
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
                    {customer.totalOrders > 0 && (
                      <div className="text-xs text-gray-500">
                        Avg: {formatCurrency(customer.totalSpent / customer.totalOrders)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900">
                      {formatDate(customer.lastOrderDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculateDaysSinceLastOrder(customer.lastOrderDate)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Joined: {formatDate(customer.joinDate)}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  
                  </div>
                </td>
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