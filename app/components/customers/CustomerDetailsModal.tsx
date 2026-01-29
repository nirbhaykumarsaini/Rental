// app/components/customers/CustomerDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/app/types/customer.types';
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
                // For now, using mock notes
                setNotes([
                    {
                        id: '1',
                        content: 'Customer requested special pricing for bulk orders',
                        author: 'John Doe',
                        date: new Date('2024-01-10'),
                        type: 'sales',
                    },
                    {
                        id: '2',
                        content: 'Follow up about new product launch',
                        author: 'Sarah Wilson',
                        date: new Date('2024-01-12'),
                        type: 'followup',
                    },
                    {
                        id: '3',
                        content: 'Technical support issue resolved',
                        author: 'Mike Johnson',
                        date: new Date('2024-01-14'),
                        type: 'support',
                    },
                ]);
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

    const getTierColor = (tier: Customer['tier']) => {
        switch (tier) {
            case 'vip': return 'bg-yellow-100 text-yellow-800';
            case 'premium': return 'bg-purple-100 text-purple-800';
            case 'regular': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const mockRecentOrders = [
        {
            id: 'ORD-001',
            orderNumber: 'ORD-001',
            date: new Date('2024-01-15'),
            totalAmount: 2999.99,
            status: 'delivered',
            items: 2,
        },
        {
            id: 'ORD-002',
            orderNumber: 'ORD-002',
            date: new Date('2024-01-10'),
            totalAmount: 1499.99,
            status: 'delivered',
            items: 1,
        },
    ];

    const handleCopyCustomerId = () => {
        if (customerDetails) {
            navigator.clipboard.writeText(customerDetails.customerId);
        }
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
                                        {['overview', 'orders'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center ${activeTab === tab
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
                                <div>
                                    {/* Main Content Area */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Overview Tab */}
                                        {activeTab === 'overview' && (
                                            <>

                                                {/* Customer Insights */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Customer Profile */}
                                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-lg font-semibold text-gray-900">Customer Profile</h3>
                                                        </div>


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
                                                                        {new Date(customerDetails.joinDate).toLocaleDateString('en-IN', {
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric'
                                                                        })}
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
<div className="bg-white border border-gray-200 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Summary</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Shield className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700">Account Status</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customerDetails.status)}`}>
                                                        {customerDetails.status.charAt(0).toUpperCase() + customerDetails.status.slice(1)}
                                                    </span>
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

                                               
                                            </div>
                                        </div>
                                                </div>

                                            </>
                                        )}

                                        {/* Orders Tab */}
                                        {activeTab === 'orders' && (
                                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Order ID
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Date
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Items
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Status
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
                                                            {mockRecentOrders.map((order) => (
                                                                <tr key={order.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-900">
                                                                            {order.date.toLocaleDateString('en-IN', {
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {order.date.toLocaleTimeString('en-IN', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-900">{order.items} items</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-semibold text-gray-900">
                                                                            {formatCurrency(order.totalAmount)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center space-x-2">
                                                                            <button
                                                                                onClick={() => console.log('View order:', order.id)}
                                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                                title="View Order"
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
                                                {mockRecentOrders.length === 0 && (
                                                    <div className="p-12 text-center">
                                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                                        <p className="text-gray-500">This customer hasn't placed any orders yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </div>

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

                    </div>
                </div>
            </div>
        </div>
    );
}