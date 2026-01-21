// app/components/orders/OrderList.tsx
'use client';

import { useState } from 'react';
import { Order } from '@/app/types/order.types';
import { 
  Eye, 
  Edit2, 
  MoreVertical, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Download,
  Printer
} from 'lucide-react';

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '+1 (555) 123-4567',
    status: 'processing',
    totalAmount: 299.99,
    items: [
      { id: '1', productId: 'P001', productName: 'Wireless Headphones', quantity: 2, price: 89.99, total: 179.98 },
      { id: '2', productId: 'P002', productName: 'Phone Case', quantity: 1, price: 19.99, total: 19.99 },
      { id: '3', productId: 'P003', productName: 'Screen Protector', quantity: 2, price: 9.99, total: 19.99 },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentMethod: 'credit-card',
    paymentStatus: 'paid',
    orderDate: new Date('2024-01-15T10:30:00'),
    shippingDate: new Date('2024-01-16'),
    trackingNumber: 'TRK789456123',
    notes: 'Customer requested gift wrapping',
  },
  {
    id: 'ORD-2024-002',
    orderNumber: 'ORD-2024-002',
    customerName: 'Emma Johnson',
    customerEmail: 'emma.j@email.com',
    status: 'shipped',
    totalAmount: 149.50,
    items: [
      { id: '1', productId: 'P004', productName: 'Bluetooth Speaker', quantity: 1, price: 79.50, total: 79.50 },
      { id: '2', productId: 'P005', productName: 'USB-C Cable', quantity: 3, price: 12.00, total: 36.00 },
      { id: '3', productId: 'P006', productName: 'Power Bank', quantity: 1, price: 34.00, total: 34.00 },
    ],
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    orderDate: new Date('2024-01-14T14:20:00'),
    shippingDate: new Date('2024-01-15'),
    deliveryDate: new Date('2024-01-18'),
    trackingNumber: 'TRK456789321',
  },
  {
    id: 'ORD-2024-003',
    orderNumber: 'ORD-2024-003',
    customerName: 'Michael Brown',
    customerEmail: 'm.brown@email.com',
    status: 'delivered',
    totalAmount: 450.00,
    items: [
      { id: '1', productId: 'P007', productName: 'Smart Watch', quantity: 1, price: 299.00, total: 299.00 },
      { id: '2', productId: 'P008', productName: 'Wireless Charger', quantity: 1, price: 39.00, total: 39.00 },
      { id: '3', productId: 'P009', productName: 'Laptop Sleeve', quantity: 2, price: 56.00, total: 112.00 },
    ],
    shippingAddress: {
      street: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    paymentMethod: 'credit-card',
    paymentStatus: 'paid',
    orderDate: new Date('2024-01-12T09:15:00'),
    shippingDate: new Date('2024-01-13'),
    deliveryDate: new Date('2024-01-16'),
  },
  {
    id: 'ORD-2024-004',
    orderNumber: 'ORD-2024-004',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah.w@email.com',
    status: 'pending',
    totalAmount: 89.99,
    items: [
      { id: '1', productId: 'P010', productName: 'Wireless Earbuds', quantity: 1, price: 89.99, total: 89.99 },
    ],
    shippingAddress: {
      street: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
    },
    paymentMethod: 'credit-card',
    paymentStatus: 'pending',
    orderDate: new Date('2024-01-16T16:45:00'),
  },
  {
    id: 'ORD-2024-005',
    orderNumber: 'ORD-2024-005',
    customerName: 'David Lee',
    customerEmail: 'd.lee@email.com',
    status: 'cancelled',
    totalAmount: 199.98,
    items: [
      { id: '1', productId: 'P011', productName: 'Tablet Stand', quantity: 2, price: 29.99, total: 59.98 },
      { id: '2', productId: 'P012', productName: 'Keyboard', quantity: 1, price: 139.99, total: 139.99 },
    ],
    shippingAddress: {
      street: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA',
    },
    paymentMethod: 'paypal',
    paymentStatus: 'refunded',
    orderDate: new Date('2024-01-10T11:20:00'),
    notes: 'Customer cancelled before shipping',
  },
];

interface OrderListProps {
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrderList({ onViewOrder, onUpdateStatus }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedStatus === option.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onViewOrder(order)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      <span className="mr-1.5">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewOrder(order)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(order.id, order.status)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Update Status"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
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
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredOrders.length}</span> of{' '}
              <span className="font-medium">{filteredOrders.length}</span> orders
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}