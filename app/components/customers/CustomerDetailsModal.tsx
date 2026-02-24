// D:\B2B\app\components\customers\CustomerDetailsModal.tsx
'use client';

import { useState } from 'react';
import { Customer } from '@/app/types/customer.types';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Edit2,
  MessageSquare,
  Tag,
  Award,
  Shield,
  TrendingUp,
  Download,
  Printer
} from 'lucide-react';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

export function CustomerDetailsModal({
  isOpen,
  onClose,
  customer
}: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'notes'>('overview');

  if (!isOpen) return null;

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier?: Customer['tier']) => {
    switch (tier) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-gray-500">{customer.mobile}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>

                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders ({customer.totalOrders})
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'addresses'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Addresses
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Notes
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{customer.mobile || customer.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Package className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <DollarSign className="w-5 h-5 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-gray-500">Total Spent</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.averageOrderValue)}</p>
                    <p className="text-sm text-gray-500">Avg. Order</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Calendar className="w-5 h-5 text-orange-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Joined</p>
                    <p className="text-sm text-gray-500">{formatDate(customer.joinDate)}</p>
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{customer.pendingOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{customer.completedOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cancelled</p>
                      <p className="text-2xl font-bold text-red-600">{customer.cancelledOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {customer.orders?.items?.map((order: any) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-lg font-bold text-purple-600">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4">
                {customer.addresses?.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">{address.type}</span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600">{address.name}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600">{address.address}</p>
                    {address.landmark && <p className="text-gray-600">Landmark: {address.landmark}</p>}
                    <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notes for this customer yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Edit2 className="w-4 h-4 inline mr-2" />
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}