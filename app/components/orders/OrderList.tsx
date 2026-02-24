// D:\B2B\app\components\orders\OrderList.tsx
'use client';

import { useState } from 'react';
import { Order } from '@/app/types/order.types';
import { 
  Eye, 
  MoreVertical, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  MapPin,
  User
} from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['orderStatus']) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages?: number;
  totalOrders?: number;
}

export function OrderList({ 
  orders, 
  loading, 
  onViewOrder, 
  onUpdateStatus, 
  onPageChange, 
  currentPage,
  totalPages = 1,
  totalOrders = 0
}: OrderListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  console.log(orders)

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRentalStatus = (order: Order) => {
    const today = new Date();
    const deliveryDate = new Date(order.deliveryDate);
    const returnDate = new Date(order.returnDate);

    if (order.orderStatus === 'cancelled') return 'cancelled';
    if (deliveryDate > today) return 'upcoming';
    if (deliveryDate <= today && returnDate >= today) return 'active';
    if (returnDate < today) return 'completed';
    return order.orderStatus;
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => getRentalStatus(order) === selectedStatus);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'active', label: 'Active', count: orders.filter(o => getRentalStatus(o) === 'active').length },
    { value: 'upcoming', label: 'Upcoming', count: orders.filter(o => getRentalStatus(o) === 'upcoming').length },
    { value: 'completed', label: 'Completed', count: orders.filter(o => getRentalStatus(o) === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length },
  ];

  const handleStatusUpdate = async (orderId: string, status: Order['orderStatus']) => {
    setSelectedOrderId(orderId);
    try {
      await onUpdateStatus(orderId, status);
    } finally {
      setSelectedOrderId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Status Tabs */}
      <div className="border-b border-gray-200 px-6 py-4 overflow-x-auto">
        <div className="flex space-x-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
              {option.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selectedStatus === option.value
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rental Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const rentalStatus = getRentalStatus(order);
              const totalItems = getTotalItems(order);
              
              return (
                <tr 
                  key={order._id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onViewOrder(order)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {order.items[0]?.image && (
                          <img
                            src={order.items[0].image}
                            alt={order.items[0].name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          {order.items[0]?.name?.substring(0, 40)}...
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {totalItems} {totalItems === 1 ? 'item' : 'items'} • {order.items.length} product(s)
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Ordered: {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {order.address.city}, {order.address.state}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(order.deliveryDate)} - {formatDate(order.returnDate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.items[0]?.rentalDays} days rental
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1.5">
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rentalStatus === 'active' ? 'bg-green-100 text-green-800' : 
                        rentalStatus === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        rentalStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'}`}>
                        {rentalStatus.charAt(0).toUpperCase() + rentalStatus.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <DollarSign className="w-3 h-3 mr-1" />
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Subtotal: {formatCurrency(order.subtotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrder(order);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="py-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {selectedStatus === 'all' 
              ? 'No orders have been placed yet.' 
              : `No orders with status "${selectedStatus}" found.`}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-medium">{filteredOrders.length}</span> of{' '}
              <span className="font-medium">{totalOrders}</span> orders
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
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
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