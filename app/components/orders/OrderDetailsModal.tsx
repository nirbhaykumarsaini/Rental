// app/components/orders/OrderDetailsModal.tsx
'use client';

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
  AlertCircle
} from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsModalProps) {
  if (!isOpen) return null;

  const getStatusOptions = () => {
    switch (order.status) {
      case 'pending': return ['processing', 'cancelled'];
      case 'processing': return ['shipped', 'cancelled'];
      case 'shipped': return ['delivered'];
      case 'delivered': return ['refunded'];
      default: return [];
    }
  };

  const statusOptions = getStatusOptions();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(order.orderDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <span className="font-semibold text-gray-900">${item.total.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                            <span>SKU: {item.productId}</span>
                            <span>Quantity: {item.quantity} × ${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-500">Shipping</span>
                        <span className="text-gray-900">$0.00</span>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-500">Tax</span>
                        <span className="text-gray-900">$0.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-3 mt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Notes */}
                {order.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-yellow-800">Customer Notes</h3>
                    </div>
                    <p className="text-yellow-700">{order.notes}</p>
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
                        <div className={`p-2 rounded-lg ${
                          order.status === 'pending' ? 'bg-yellow-100' :
                          order.status === 'processing' ? 'bg-blue-100' :
                          order.status === 'shipped' ? 'bg-purple-100' :
                          order.status === 'delivered' ? 'bg-green-100' :
                          'bg-red-100'
                        }`}>
                          <Package className={`w-5 h-5 ${
                            order.status === 'pending' ? 'text-yellow-600' :
                            order.status === 'processing' ? 'text-blue-600' :
                            order.status === 'shipped' ? 'text-purple-600' :
                            order.status === 'delivered' ? 'text-green-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {order.status === 'shipped' && order.trackingNumber
                              ? `Tracking: ${order.trackingNumber}`
                              : 'Update order status'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Update Options */}
                    {statusOptions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() => onUpdateStatus(order.id, status)}
                              className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100"
                            >
                              Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
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
                        <span className="text-white font-medium">
                          {order.customerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                        <p className="text-sm text-gray-500">{order.customerEmail}</p>
                      </div>
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {order.customerPhone}
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
                        <p className="font-medium">{order.customerName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
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
                        {order.paymentMethod.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="relative pl-12">
                    <div className="absolute left-3 top-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">Order Placed</h4>
                            <p className="text-sm text-gray-500">Order was successfully placed</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.shippingDate && (
                    <div className="relative pl-12">
                      <div className="absolute left-3 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Truck className="w-5 h-5 text-blue-500" />
                            <div>
                              <h4 className="font-medium text-gray-900">Order Shipped</h4>
                              <p className="text-sm text-gray-500">
                                {order.trackingNumber ? `Tracking #: ${order.trackingNumber}` : 'Shipped to customer'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(order.shippingDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.deliveryDate && (
                    <div className="relative pl-12">
                      <div className="absolute left-3 top-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-purple-500" />
                            <div>
                              <h4 className="font-medium text-gray-900">Order Delivered</h4>
                              <p className="text-sm text-gray-500">Order was successfully delivered</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                console.log('Processing order:', order.id);
                onClose();
              }}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Process Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}