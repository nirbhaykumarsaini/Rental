// app/components/customers/CustomerDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Customer, CustomerAddress, CustomerOrder } from '@/app/types/customer.types';
import {
    X,
    Mail,
    Phone,
    Calendar,
    Package,
    DollarSign,
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
    Trash2,
    FileText,
    TrendingUp,
    RefreshCw,
    CreditCard,
    Truck,
    CheckSquare,
    AlertCircle,
    BarChart3,
    Download,
    Printer,
    MessageSquare,
    Star,
    Tag,
    ExternalLink
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
    const [ordersPage, setOrdersPage] = useState(1);
    const ORDERS_PER_PAGE = 5;

    useEffect(() => {
        if (customer && isOpen) {
            setCustomerDetails(customer);
            fetchCustomerDetails(customer.id);
        }
    }, [customer, isOpen, ordersPage]);

    const fetchCustomerDetails = async (customerId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/v1/users/${customerId}?ordersPage=${ordersPage}&ordersLimit=${ORDERS_PER_PAGE}`
            );
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

    const loadNextOrdersPage = () => {
        if (customerDetails?.orders?.pagination?.hasNext) {
            setOrdersPage(prev => prev + 1);
        }
    };

    const loadPrevOrdersPage = () => {
        if (ordersPage > 1) {
            setOrdersPage(prev => prev - 1);
        }
    };

    if (!isOpen || !customer) return null;

    const getStatusColor = (status: Customer['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border border-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 border border-gray-200';
            case 'blocked': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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
            case 'vip': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200';
            case 'premium': return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200';
            case 'regular': return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
            default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
        }
    };

    const getTierIcon = (tier: Customer['tier']) => {
        switch (tier) {
            case 'vip': return <Star className="w-4 h-4" />;
            case 'premium': return <Award className="w-4 h-4" />;
            case 'regular': return <Shield className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    };

    const getAddressIcon = (type: CustomerAddress['type']) => {
        switch (type) {
            case 'home': return <Home className="w-5 h-5" />;
            case 'work': return <Briefcase className="w-5 h-5" />;
            default: return <Navigation className="w-5 h-5" />;
        }
    };

    const getOrderStatusColor = (status: CustomerOrder['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: CustomerOrder['paymentStatus']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
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

    const formatCurrencyWithDecimals = (amount: number) => {
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

    const formatDateTime = (date: Date | string | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopyCustomerId = () => {
        if (customerDetails) {
            navigator.clipboard.writeText(customerDetails.customerId);
            // Add toast notification: "Customer ID copied!"
        }
    };

    const handleCopyAddress = (address: CustomerAddress) => {
        const addressText = `${address.fullName}\n${address.street}\n${address.city}, ${address.state} ${address.zipCode}\n${address.country}\n${address.phoneNumber}`;
        navigator.clipboard.writeText(addressText);
        // Add toast notification: "Address copied!"
    };

    const handleExportData = () => {
        // Implement export functionality
        console.log('Export customer data:', customerDetails);
    };

    const handlePrintDetails = () => {
        window.print();
    };

    const handleSendMessage = () => {
        // Implement message functionality
        console.log('Send message to:', customerDetails?.email);
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
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-white text-2xl font-medium">
                                        {customerDetails?.firstName?.charAt(0) || 'C'}{customerDetails?.lastName?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                {customerDetails?.status === 'active' && (
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {customerDetails?.firstName} {customerDetails?.lastName}
                                    </h2>
                                    <button
                                        onClick={handleCopyCustomerId}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        title="Copy Customer ID"
                                    >
                                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {customerDetails?.customerId} • Joined {formatDate(customerDetails?.joinDate)}
                                </p>
                            </div>
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

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading customer details...</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && customerDetails && (
                        <>
                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <div className="px-6">
                                    <nav className="flex space-x-8 overflow-x-auto">
                                        {['overview', 'orders', 'addresses'].map((tab) => (
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
                                                {/* Customer Profile Card */}
                                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h3 className="text-lg font-semibold text-gray-900">Customer Profile</h3>
                                                        
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center space-x-3">
                                                            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-500">Email</p>
                                                                <p className="font-medium text-gray-900">{customerDetails.email}</p>
                                                            </div>
                                                        </div>

                                                        {customerDetails.mobile && (
                                                            <div className="flex items-center space-x-3">
                                                                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-gray-500">Mobile</p>
                                                                    <p className="font-medium text-gray-900">{customerDetails.mobile}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center space-x-3">
                                                            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-500">Member Since</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {formatDate(customerDetails.joinDate)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <RefreshCw className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-500">Order Frequency</p>
                                                                <p className="font-medium text-gray-900">{customerDetails.orderFrequency || 'No orders'}</p>
                                                            </div>
                                                        </div>

                                                        {customerDetails.tags && customerDetails.tags.length > 0 && (
                                                            <div className="pt-4 border-t border-gray-200">
                                                                <p className="text-sm text-gray-500 mb-2 flex items-center">
                                                                    <Tag className="w-4 h-4 mr-1.5" />
                                                                    Tags
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {customerDetails.tags.map((tag) => (
                                                                        <span
                                                                            key={tag}
                                                                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
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
                                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                                                            >
                                                                View All Addresses
                                                                <ExternalLink className="w-3 h-3 ml-1" />
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
                                                {/* Customer Summary Card */}
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
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTierColor(customerDetails.tier)}`}>
                                                                <span className="mr-1.5">{getTierIcon(customerDetails.tier)}</span>
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

                                            </div>
                                        </div>
                                    )}

                                    {/* Orders Tab */}
                                    {activeTab === 'orders' && (
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="p-6 border-b border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {customerDetails.orders?.pagination?.total || 0} total orders
                                                        </p>
                                                    </div>
                                                   
                                                </div>
                                            </div>

                                            {customerDetails.orders?.items && customerDetails.orders.items.length > 0 ? (
                                                <div className="p-6">
                                                    <div className="space-y-4">
                                                        {customerDetails.orders.items.map((order) => (
                                                            <div
                                                                key={order.id}
                                                                className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-sm transition-all"
                                                            >
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div>
                                                                        <div className="flex items-center space-x-2 mb-1">
                                                                            <h4 className="font-medium text-gray-900">#{order.orderNumber}</h4>
                                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                            </span>
                                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Placed on {formatDateTime(order.orderDate)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-lg font-bold text-gray-900">
                                                                            {formatCurrencyWithDecimals(order.totalAmount)}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">{order.itemCount} items</p>
                                                                    </div>
                                                                </div>

                                                                <div className="border-t border-gray-100 pt-4">
                                                                    <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                                                                    <div className="space-y-2">
                                                                        {order.items.slice(0, 2).map((item, index) => (
                                                                            <div key={index} className="flex items-center justify-between">
                                                                                <div className="flex items-center space-x-3">
                                                                                    {item.image && (
                                                                                        <img
                                                                                            src={item.image}
                                                                                            alt={item.productName}
                                                                                            className="w-10 h-10 rounded object-cover"
                                                                                        />
                                                                                    )}
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                                                        <p className="text-xs text-gray-500">
                                                                                            Qty: {item.quantity} • {item.color && `${item.color}, `}{item.size}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <p className="text-sm font-medium text-gray-900">
                                                                                    {formatCurrencyWithDecimals(item.total)}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                        {order.items.length > 2 && (
                                                                            <p className="text-sm text-gray-500 text-center">
                                                                                +{order.items.length - 2} more items
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                                    <div className="flex items-center space-x-4">
                                                                        {order.trackingNumber && (
                                                                            <div className="flex items-center text-sm text-gray-600">
                                                                                <Truck className="w-4 h-4 mr-1.5" />
                                                                                {order.trackingNumber}
                                                                            </div>
                                                                        )}
                                                                        {order.deliveryDate && (
                                                                            <div className="flex items-center text-sm text-gray-600">
                                                                                <CheckSquare className="w-4 h-4 mr-1.5" />
                                                                                Delivered {formatDate(order.deliveryDate)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => console.log('View order:', order.id)}
                                                                        className="px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-sm font-medium"
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Pagination */}
                                                    {customerDetails.orders?.pagination && (
                                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                                                            <div className="text-sm text-gray-500">
                                                                Showing {((ordersPage - 1) * ORDERS_PER_PAGE) + 1} to{' '}
                                                                {Math.min(ordersPage * ORDERS_PER_PAGE, customerDetails.orders.pagination.total)} of{' '}
                                                                {customerDetails.orders.pagination.total} orders
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={loadPrevOrdersPage}
                                                                    disabled={!customerDetails.orders.pagination.hasPrev}
                                                                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${!customerDetails.orders.pagination.hasPrev
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-gray-700 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    Previous
                                                                </button>
                                                                <span className="px-3 py-2 text-sm text-gray-700">
                                                                    Page {ordersPage} of {customerDetails.orders.pagination.totalPages}
                                                                </span>
                                                                <button
                                                                    onClick={loadNextOrdersPage}
                                                                    disabled={!customerDetails.orders.pagination.hasNext}
                                                                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium ${!customerDetails.orders.pagination.hasNext
                                                                        ? 'text-gray-400 cursor-not-allowed'
                                                                        : 'text-gray-700 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-12 text-center">
                                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                                    <p className="text-gray-500">This customer hasn't placed any orders.</p>
                                                  
                                                </div>
                                            )}
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
                                                    
                                                </div>
                                            </div>

                                            {customerDetails.addresses && customerDetails.addresses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                                    {customerDetails.addresses.map((address) => (
                                                        <div
                                                            key={address.id}
                                                            className={`border rounded-xl p-6 transition-all hover:shadow-md ${address.isDefault
                                                                ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-white'
                                                                : 'border-gray-200 hover:border-purple-200'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className={`p-2 rounded-lg ${address.isDefault
                                                                        ? 'bg-purple-100 text-purple-600'
                                                                        : 'bg-gray-100 text-gray-600'
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
                                                                <div className="flex items-center space-x-1">
                                                                    <button
                                                                        onClick={() => handleCopyAddress(address)}
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Copy Address"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => console.log('Edit address:', address.id)}
                                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                        title="Edit Address"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => console.log('Delete address:', address.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                                                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                                                        {address.phoneNumber}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                                                                <button
                                                                    onClick={() => console.log('Set as default:', address.id)}
                                                                    disabled={address.isDefault}
                                                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${address.isDefault
                                                                        ? 'bg-green-100 text-green-700 cursor-default'
                                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    {address.isDefault ? 'Default Address' : 'Set as Default'}
                                                                </button>
                                                                <button
                                                                    onClick={() => console.log('Use this address')}
                                                                    className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
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