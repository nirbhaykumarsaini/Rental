// D:\B2B\app\components\orders\OrderDetailsModal.tsx
'use client';

import { useState } from 'react';
import { Order } from '@/app/types/order.types';
import {
  X,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Package,
  CheckCircle,
  AlertCircle,
  Copy,
  User,
  ShoppingBag,
  Loader2,
  Ruler,
  Hash,
  Clock,
  DollarSign,
  Home,
  Briefcase,
  Tag,
  XCircle
} from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: Order['orderStatus']) => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'timeline'>('details');

  if (!isOpen || !order) return null;

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusOptions = () => {
    switch (order.orderStatus) {
      case 'pending': return ['confirmed', 'cancelled'];
      case 'confirmed': return ['processing', 'cancelled'];
      case 'processing': return ['shipped', 'cancelled'];
      case 'shipped': return ['delivered', 'cancelled'];
      case 'delivered': return ['refunded'];
      default: return [];
    }
  };

  const statusOptions = getStatusOptions();

  const handleStatusUpdate = async (status: Order['orderStatus']) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order._id, status);
    } finally {
      setIsUpdating(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    // You can add a toast notification here
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalRentalDays = calculateRentalDays(order.deliveryDate, order.returnDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy Order ID"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Ordered on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
           
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Order Details
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'items'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Items ({order.items.length})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Timeline
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{order.address.name}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Phone className="w-4 h-4 mr-1" />
                            {order.address.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Shipping Address
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getAddressTypeIcon(order.address.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.address.name}</p>
                          <p className="text-gray-600 mt-1">{order.address.address}</p>
                          {order.address.landmark && (
                            <p className="text-gray-600">Landmark: {order.address.landmark}</p>
                          )}
                          <p className="text-gray-600">
                            {order.address.city}, {order.address.state} - {order.address.pincode}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.address.type === 'home' ? 'bg-blue-100 text-blue-800' :
                                order.address.type === 'work' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {order.address.type.charAt(0).toUpperCase() + order.address.type.slice(1)}
                            </span>
                            {order.address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rental Period */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Rental Period
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Delivery Date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Return Date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.returnDate)}</p>
                      </div>
                      <div className="col-span-2 mt-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Total Rental Period:</span> {totalRentalDays} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Info */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-medium text-green-600">{formatCurrency(order.discount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="border-t border-gray-200 my-3 pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-blue-600">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Method</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Status</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Update Status */}
                  {statusOptions.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                      <div className="space-y-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(status)}
                            disabled={isUpdating}
                            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${isUpdating
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      {/* Product Image */}
                      <div className="w-full md:w-32 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Tag className="w-3 h-3 mr-1" />
                                  Product ID
                                </p>
                                <p className="text-sm font-mono text-gray-700">{item.productId}</p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Ruler className="w-3 h-3 mr-1" />
                                  Size
                                </p>
                                <p className="text-sm font-medium text-gray-900">{item.selectedSize}</p>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-1"
                                    style={{ backgroundColor: item.selectedColor.toLowerCase() }}
                                  />
                                  Color
                                </div>
                                <p className="text-sm font-medium text-gray-900">{item.selectedColor}</p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Hash className="w-3 h-3 mr-1" />
                                  Quantity
                                </p>
                                <p className="text-sm font-medium text-gray-900">{item.quantity}</p>
                              </div>
                            </div>

                            {/* Measurements */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-700 mb-2">Measurements (inches)</p>
                              <div className="flex space-x-4">
                                <div>
                                  <span className="text-xs text-gray-500">Chest:</span>
                                  <span className="ml-2 text-sm font-medium text-gray-900">{item.measurements.chest}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Waist:</span>
                                  <span className="ml-2 text-sm font-medium text-gray-900">{item.measurements.waist}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Hip:</span>
                                  <span className="ml-2 text-sm font-medium text-gray-900">{item.measurements.hip}</span>
                                </div>
                              </div>
                            </div>

                            {/* Rental Dates */}
                            <div className="mt-4 flex items-center space-x-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-xs text-gray-500">Start Date</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(item.startDate).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-xs text-gray-500">End Date</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(item.endDate).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="md:text-right mt-4 md:mt-0">
                            <p className="text-sm text-gray-500">Rental Price</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(item.rentalPrice)}</p>
                            <p className="text-xs text-gray-500 mt-1">for {item.rentalDays} days</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Original: {formatCurrency(item.price)}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-2">
                              Total: {formatCurrency(item.rentalPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Order Placed */}
                  <div className="relative mb-8">
                    <div className="flex items-start">
                      <div className="absolute left-6 -ml-0.5 mt-1">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-16">
                        <h4 className="text-lg font-semibold text-gray-900">Order Placed</h4>
                        <p className="text-gray-600 mt-1">Order was successfully placed</p>
                        <p className="text-sm text-gray-400 mt-2">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Confirmed */}
                  {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) && (
                    <div className="relative mb-8">
                      <div className="flex items-start">
                        <div className="absolute left-6 -ml-0.5 mt-1">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-16">
                          <h4 className="text-lg font-semibold text-gray-900">Order Confirmed</h4>
                          <p className="text-gray-600 mt-1">Your order has been confirmed</p>
                          <p className="text-sm text-gray-400 mt-2">{formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing */}
                  {['processing', 'shipped', 'delivered'].includes(order.orderStatus) && (
                    <div className="relative mb-8">
                      <div className="flex items-start">
                        <div className="absolute left-6 -ml-0.5 mt-1">
                          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-16">
                          <h4 className="text-lg font-semibold text-gray-900">Processing</h4>
                          <p className="text-gray-600 mt-1">Order is being prepared</p>
                          <p className="text-sm text-gray-400 mt-2">{formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipped */}
                  {['shipped', 'delivered'].includes(order.orderStatus) && (
                    <div className="relative mb-8">
                      <div className="flex items-start">
                        <div className="absolute left-6 -ml-0.5 mt-1">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Truck className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-16">
                          <h4 className="text-lg font-semibold text-gray-900">Shipped</h4>
                          <p className="text-gray-600 mt-1">Order has been shipped</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Expected delivery: {formatDate(order.deliveryDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivered */}
                  {order.orderStatus === 'delivered' && (
                    <div className="relative mb-8">
                      <div className="flex items-start">
                        <div className="absolute left-6 -ml-0.5 mt-1">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-16">
                          <h4 className="text-lg font-semibold text-gray-900">Delivered</h4>
                          <p className="text-gray-600 mt-1">Order has been delivered</p>
                          <p className="text-sm text-gray-400 mt-2">{formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Return Due */}
                  {order.orderStatus === 'delivered' && (
                    <div className="relative mb-8">
                      <div className="flex items-start">
                        <div className="absolute left-6 -ml-0.5 mt-1">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-16">
                          <h4 className="text-lg font-semibold text-gray-900">Return Due</h4>
                          <p className="text-gray-600 mt-1">Please return by this date</p>
                          <p className="text-sm text-gray-400 mt-2">{formatDate(order.returnDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled */}
                  {order.orderStatus === 'cancelled' && (
                    <div className="relative mb-8">
                      <div className="flex items-start">
                        <div className="absolute left-6 -ml-3 mt-1">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-16">
                          <h4 className="text-lg font-semibold text-gray-900">Order Cancelled</h4>
                          <p className="text-gray-600 mt-1">Order has been cancelled</p>
                          <p className="text-sm text-gray-400 mt-2">{formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}