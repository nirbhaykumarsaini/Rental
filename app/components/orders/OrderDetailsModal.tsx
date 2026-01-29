// app/components/orders/OrderDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
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
  ExternalLink,
  User,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(order);

  useEffect(() => {
    if (order && isOpen) {
      setOrderDetails(order);
      // Fetch full order details if needed
      fetchOrderDetails(order.id);
    }
  }, [order, isOpen]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/v1/orders/order/${orderId}`);
      const data = await response.json();

      if (data.status && data.data) {
        setOrderDetails(data.data);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  if (!isOpen || !orderDetails) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    if (!orderDetails) return [];

    switch (orderDetails.status) {
      case 'pending': return ['processing', 'cancelled'];
      case 'processing': return ['shipped', 'cancelled'];
      case 'shipped': return ['delivered', 'cancelled'];
      case 'delivered': return ['refunded'];
      default: return [];
    }
  };

  const statusOptions = getStatusOptions();

  const handleStatusUpdate = async (status: Order['status']) => {
    if (!orderDetails) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(orderDetails.id, status);
      setOrderDetails({
        ...orderDetails,
        status,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineEvents = () => {
    const events = [];

    // Order placed
    events.push({
      id: 1,
      title: 'Order Placed',
      description: 'Order was successfully placed',
      date: orderDetails.orderDate,
      icon: CheckCircle,
      color: 'green',
      completed: true,
    });

    // Processing
    if (['processing', 'shipped', 'delivered'].includes(orderDetails.status)) {
      events.push({
        id: 2,
        title: 'Order Processing',
        description: 'Order is being processed',
        date: orderDetails.orderDate,
        icon: Package,
        color: 'blue',
        completed: true,
      });
    }

    // Shipped
    if (['shipped', 'delivered'].includes(orderDetails.status)) {
      events.push({
        id: 3,
        title: 'Order Shipped',
        description: orderDetails.trackingNumber
          ? `Tracking: ${orderDetails.trackingNumber}`
          : 'Order has been shipped',
        date: orderDetails.shippingDate,
        icon: Truck,
        color: 'purple',
        completed: true,
      });
    }

    // Delivered
    if (orderDetails.status === 'delivered') {
      events.push({
        id: 4,
        title: 'Order Delivered',
        description: 'Order was successfully delivered',
        date: orderDetails.deliveryDate,
        icon: CheckCircle,
        color: 'green',
        completed: true,
      });
    }

    // Cancelled or Refunded
    if (['cancelled', 'refunded'].includes(orderDetails.status)) {
      events.push({
        id: 5,
        title: 'Order Cancelled',
        description: orderDetails.status === 'refunded'
          ? 'Payment has been refunded'
          : 'Order has been cancelled',
        date: orderDetails.orderDate,
        icon: X,
        color: 'red',
        completed: true,
      });
    }

    return events;
  };

  const handlePrintInvoice = () => {
    // Implement print functionality
    window.print();
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderDetails.orderNumber);
    // Show toast notification
  };

  const timelineEvents = getTimelineEvents();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{orderDetails.orderNumber}
                </h2>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Copy Order ID"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(orderDetails.orderDate)}
              </p>
            </div>
            <div className="flex items-center space-x-3">

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                    <span className="text-sm text-gray-500">
                      {orderDetails.items?.length || 0} items
                    </span>
                  </div>
                  <div className="space-y-4">
                    {orderDetails.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-14 h-14 object-cover rounded-lg"
                            />


                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-500">SKU: {item.productId}</span>
                                  {item.price && (
                                    <span className="text-sm text-gray-500">
                                      Price: {formatCurrency(item.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(item.total || item.price * item.quantity)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                              <span>Quantity: {item.quantity}</span>
                              <span>Total: {formatCurrency(item.total || item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">{formatCurrency(orderDetails.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="text-gray-900">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax</span>
                        <span className="text-gray-900">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-3 mt-3 border-t border-gray-200">
                        <span>Total Amount</span>
                        <span>{formatCurrency(orderDetails.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Notes */}
                {orderDetails.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-yellow-800">Customer Notes</h3>
                    </div>
                    <p className="text-yellow-700">{orderDetails.notes}</p>
                  </div>
                )}
              </div>

              {/* Right Column - Order Info */}
              <div className="space-y-6">
                {/* Order Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${orderDetails.status === 'pending' ? 'bg-yellow-100' :
                          orderDetails.status === 'processing' ? 'bg-blue-100' :
                            orderDetails.status === 'shipped' ? 'bg-purple-100' :
                              orderDetails.status === 'delivered' ? 'bg-green-100' :
                                'bg-red-100'
                          }`}>
                          <Package className={`w-5 h-5 ${orderDetails.status === 'pending' ? 'text-yellow-600' :
                            orderDetails.status === 'processing' ? 'text-blue-600' :
                              orderDetails.status === 'shipped' ? 'text-purple-600' :
                                orderDetails.status === 'delivered' ? 'text-green-600' :
                                  'text-red-600'
                            }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {orderDetails.trackingNumber
                              ? `Tracking: ${orderDetails.trackingNumber}`
                              : 'Update order status'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Update Options */}
                    {statusOptions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Update Status</p>
                        <div className="flex flex-col space-y-2">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(status)}
                              disabled={isUpdating}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${isUpdating
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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

                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{orderDetails.customerName}</h4>
                        <p className="text-sm text-gray-500">{orderDetails.customerEmail}</p>
                      </div>
                    </div>
                    {orderDetails.customerPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{orderDetails.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{orderDetails.customerName}</p>
                        <p>{orderDetails.shippingAddress.street}</p>
                        <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                        <p>{orderDetails.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">Payment Method</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {orderDetails.paymentMethod?.replace('-', ' ').toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(orderDetails.paymentStatus)}`}>
                        {orderDetails.paymentStatus?.charAt(0).toUpperCase() + orderDetails.paymentStatus?.slice(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="relative">
                      <div className="md:pl-12">
                        <div className="hidden md:block absolute left-3 top-1 w-3 h-3 rounded-full"
                          style={{ backgroundColor: `var(--${event.color}-500)` }}>
                        </div>
                        <div className={`border rounded-xl p-4 ${event.completed
                          ? `bg-${event.color}-50 border-${event.color}-100`
                          : 'bg-gray-50 border-gray-200'
                          }`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex items-center space-x-3 mb-3 md:mb-0">
                              <div className={`p-2 rounded-lg ${event.completed
                                ? `bg-${event.color}-100 text-${event.color}-600`
                                : 'bg-gray-100 text-gray-400'
                                }`}>
                                <event.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-500">{event.description}</p>
                              </div>
                            </div>
                            {event.date && (
                              <span className="text-sm text-gray-500">
                                {formatDate(event.date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Handle order processing
                console.log('Processing order:', orderDetails.id);
              }}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Process Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}