// app/components/customers/CustomerDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Customer, CustomerAddress } from '@/app/types/customer.types';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Package,
  DollarSign,
  Eye,
  Loader2,
  Shield,
  Award,
  Copy,
  MapPin,
  Home,
  Briefcase,
  Navigation,
  CheckCircle,
  Clock,
  UserX,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
}: CustomerDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(customer);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);

  useEffect(() => {
    if (customer && isOpen) {
      setCustomerDetails(customer);
      fetchCustomerDetails(customer.id);
    }
  }, [customer, isOpen]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/users/${customerId}`);
      const data = await response.json();

      if (data.status && data.data) {
        setCustomerDetails(data.data);
        if (data.data.addresses && data.data.addresses.length > 0) {
          setSelectedAddress(data.data.defaultAddress || data.data.addresses[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !customerDetails) return null;

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'blocked': return <UserX className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: Customer['tier']) => {
    switch (tier) {
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'regular': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAddressIcon = (type: CustomerAddress['type']) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      default: return <Navigation className="w-5 h-5" />;
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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCopyCustomerId = () => {
    if (customerDetails) {
      navigator.clipboard.writeText(customerDetails.customerId);
      // You might want to add a toast notification here
    }
  };

  const handleCopyAddress = (address: CustomerAddress) => {
    const addressText = `${address.fullName}\n${address.street}\n${address.city}, ${address.state} ${address.zipCode}\n${address.country}\n${address.phoneNumber}`;
    navigator.clipboard.writeText(addressText);
    // You might want to add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-2xl font-medium">
                  {customerDetails.firstName.charAt(0)}{customerDetails.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {customerDetails.firstName} {customerDetails.lastName}
                  </h2>
                  <button
                    onClick={handleCopyCustomerId}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy Customer ID"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {customerDetails.customerId} • Joined {formatDate(customerDetails.joinDate)}
                </p>
              </div>
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading customer details...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="px-6">
                  <nav className="flex space-x-8 overflow-x-auto">
                    {['overview', 'addresses'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="p-6">
                {/* Main Content Area */}
                <div className="space-y-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column - Customer Profile */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Customer Profile */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Profile</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{customerDetails.email}</p>
                              </div>
                            </div>

                            {customerDetails.mobile && (
                              <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Mobile</p>
                                  <p className="font-medium text-gray-900">{customerDetails.mobile}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Member Since</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(customerDetails.joinDate)}
                                </p>
                              </div>
                            </div>

                            {customerDetails.tags && customerDetails.tags.length > 0 && (
                              <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                  {customerDetails.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Default Address Preview */}
                        {customerDetails.defaultAddress && (
                          <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-semibold text-gray-900">Default Address</h3>
                              <button
                                onClick={() => setActiveTab('addresses')}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                              >
                                View All Addresses
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  {getAddressIcon(customerDetails.defaultAddress.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {customerDetails.defaultAddress.fullName}
                                      {customerDetails.defaultAddress.isDefault && (
                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </h4>
                                    <span className="text-sm text-gray-500 capitalize">
                                      {customerDetails.defaultAddress.type}
                                    </span>
                                  </div>
                                  <p className="text-gray-600">{customerDetails.defaultAddress.street}</p>
                                  <p className="text-gray-600">
                                    {customerDetails.defaultAddress.city}, {customerDetails.defaultAddress.state} {customerDetails.defaultAddress.zipCode}
                                  </p>
                                  <p className="text-gray-600">{customerDetails.defaultAddress.country}</p>
                                  {customerDetails.defaultAddress.phoneNumber && (
                                    <p className="text-gray-600 mt-2">
                                      <Phone className="w-3 h-3 inline mr-1" />
                                      {customerDetails.defaultAddress.phoneNumber}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Customer Summary */}
                      <div className="space-y-6">
                        {/* Customer Summary */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Summary</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">Account Status</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customerDetails.status)}`}>
                                  <span className="mr-1.5">{getStatusIcon(customerDetails.status)}</span>
                                  {customerDetails.status.charAt(0).toUpperCase() + customerDetails.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">Customer Tier</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(customerDetails.tier)}`}>
                                {customerDetails.tier.charAt(0).toUpperCase() + customerDetails.tier.slice(1)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">Total Orders</span>
                              </div>
                              <span className="font-medium text-gray-900">{customerDetails.totalOrders}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">Total Spent</span>
                              </div>
                              <span className="font-medium text-gray-900">{formatCurrency(customerDetails.totalSpent)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">Last Order</span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {customerDetails.lastOrderDate
                                  ? formatDate(customerDetails.lastOrderDate)
                                  : 'Never'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">Addresses</span>
                              </div>
                              <span className="font-medium text-gray-900">{customerDetails.addresses?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        
                      </div>
                    </div>
                  )}

                  {/* Addresses Tab */}
                  {activeTab === 'addresses' && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Address Book</h3>
                            <p className="text-sm text-gray-500">
                              {customerDetails.addresses?.length || 0} saved addresses
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Address
                          </button>
                        </div>
                      </div>

                      {customerDetails.addresses && customerDetails.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                          {customerDetails.addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`border rounded-xl p-6 ${address.isDefault ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                                }`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${address.isDefault ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getAddressIcon(address.type)}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 flex items-center">
                                      {address.fullName}
                                      {address.isDefault && (
                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </h4>
                                    <span className="text-sm text-gray-500 capitalize">
                                      {address.type} Address
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleCopyAddress(address)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Copy Address"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => console.log('Edit address:', address.id)}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Edit Address"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => console.log('Delete address:', address.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete Address"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-gray-600">{address.street}</p>
                                <p className="text-gray-600">
                                  {address.city}, {address.state} {address.zipCode}
                                </p>
                                <p className="text-gray-600">{address.country}</p>
                                {address.phoneNumber && (
                                  <div className="flex items-center text-gray-600 pt-2">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {address.phoneNumber}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                                <button
                                  onClick={() => console.log('Set as default:', address.id)}
                                  disabled={address.isDefault}
                                  className={`px-3 py-1.5 text-sm rounded-lg ${address.isDefault
                                    ? 'bg-green-100 text-green-700 cursor-default'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                  {address.isDefault ? 'Default Address' : 'Set as Default'}
                                </button>
                                <button
                                  onClick={() => console.log('Use this address')}
                                  className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                                >
                                  Use Address
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                          <p className="text-gray-500">This customer hasn't saved any addresses yet.</p>
                          <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center mx-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Address
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => console.log('Create order for:', customerDetails.id)}
              className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
            >
              Create Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}