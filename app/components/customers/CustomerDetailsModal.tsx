// app/components/customers/CustomerDetailsModal.tsx
'use client';

import { useState } from 'react';
import { Customer, CustomerNote } from '@/app/types/customer.types';
import {
    X,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    Send,
    Plus,
    Tag,
    Star,
    CheckCircle,
    Clock,
    UserX,
    CreditCard,
    Package,
    DollarSign,
    MessageSquare,
    Bell,
    Globe,
    ShoppingCart,
    Heart,
    ChevronRight,
    Trash2,
    ExternalLink,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    Package2,
    Eye,
    MoreVertical
} from 'lucide-react';
import { Order } from '@/app/types/order.types';
import { Product } from '@/app/types/product.types';

interface CustomerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
}

export function CustomerDetailsModal({ isOpen, onClose, customer }: CustomerDetailsModalProps) {
    const [notes, setNotes] = useState<CustomerNote[]>([
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
    const [newNote, setNewNote] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen) return null;

    const getStatusIcon = (status: Customer['status']) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'inactive': return <Clock className="w-5 h-5 text-gray-500" />;
            case 'blocked': return <UserX className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const getTierIcon = (tier: Customer['tier']) => {
        switch (tier) {
            case 'vip': return <Star className="w-5 h-5 text-yellow-500" />;
            case 'premium': return <Star className="w-5 h-5 text-purple-500" />;
            default: return null;
        }
    };

    const handleAddNote = () => {
        if (newNote.trim()) {
            const note: CustomerNote = {
                id: `note-${Date.now()}`,
                content: newNote.trim(),
                author: 'Current User',
                date: new Date(),
                type: 'general',
            };
            setNotes(prev => [note, ...prev]);
            setNewNote('');
        }
    };

    // Mock data for orders
    const mockOrders: Order[] = [
        {
            id: 'ORD-001',
            orderNumber: 'ORD-001',
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
            status: 'delivered',
            totalAmount: 299.99,
            items: [
                { id: '1', productId: 'P001', productName: 'Wireless Headphones', quantity: 1, price: 299.99, total: 299.99 },
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
            orderDate: new Date('2024-01-15'),
            deliveryDate: new Date('2024-01-18'),
            trackingNumber: 'TRK789456123',
        },
        {
            id: 'ORD-002',
            orderNumber: 'ORD-002',
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
            status: 'processing',
            totalAmount: 149.50,
            items: [
                { id: '1', productId: 'P002', productName: 'Phone Case', quantity: 2, price: 24.75, total: 49.50 },
                { id: '2', productId: 'P003', productName: 'Screen Protector', quantity: 1, price: 19.99, total: 19.99 },
                { id: '3', productId: 'P004', productName: 'Charging Cable', quantity: 3, price: 9.99, total: 29.97 },
            ],
            shippingAddress: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA',
            },
            paymentMethod: 'paypal',
            paymentStatus: 'paid',
            orderDate: new Date('2024-01-20'),
        },
        {
            id: 'ORD-003',
            orderNumber: 'ORD-003',
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
            status: 'pending',
            totalAmount: 89.99,
            items: [
                { id: '1', productId: 'P005', productName: 'Bluetooth Speaker', quantity: 1, price: 89.99, total: 89.99 },
            ],
            shippingAddress: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA',
            },
            paymentMethod: 'credit-card',
            paymentStatus: 'pending',
            orderDate: new Date('2024-01-22'),
        },
    ];

    // Mock data for cart items
    const mockCartItems = [
        {
            id: '1',
            productId: 'P006',
            productName: 'Smart Watch',
            price: 249.99,
            quantity: 1,
            addedDate: new Date('2024-01-23'),
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
        },
        {
            id: '2',
            productId: 'P007',
            productName: 'Wireless Earbuds',
            price: 129.99,
            quantity: 2,
            addedDate: new Date('2024-01-22'),
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        },
        {
            id: '3',
            productId: 'P008',
            productName: 'Laptop Backpack',
            price: 79.99,
            quantity: 1,
            addedDate: new Date('2024-01-21'),
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
        },
    ];

    // Mock data for favorite products
    const mockFavorites = [
        {
            id: '1',
            productId: 'P009',
            productName: 'Gaming Mouse',
            price: 89.99,
            addedDate: new Date('2024-01-20'),
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w-100&h=100&fit=crop',
        },
        {
            id: '2',
            productId: 'P010',
            productName: 'Mechanical Keyboard',
            price: 149.99,
            addedDate: new Date('2024-01-18'),
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=100&h=100&fit=crop',
        },
        {
            id: '3',
            productId: 'P011',
            productName: '4K Monitor',
            price: 399.99,
            addedDate: new Date('2024-01-15'),
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=100&h=100&fit=crop',
        },
        {
            id: '4',
            productId: 'P012',
            productName: 'Noise Cancelling Headphones',
            price: 299.99,
            addedDate: new Date('2024-01-10'),
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        },
    ];

    const getOrderStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getOrderStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'processing': return <RefreshCw className="w-4 h-4" />;
            case 'shipped': return <Package className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    // Calculate cart total
    const cartTotal = mockCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-2xl font-medium">
                                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {customer.firstName} {customer.lastName}
                                </h2>
                                <p className="text-sm text-gray-500">{customer.customerId}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* <button
                                onClick={() => console.log('Edit customer:', customer.id)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                            </button> */}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="px-6">
                            <nav className="flex space-x-8 overflow-x-auto">
                                {['overview', 'orders', 'cart', 'favorites', 'notes'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {tab === 'cart' && mockCartItems.length > 0 && (
                                            <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                                                {mockCartItems.length}
                                            </span>
                                        )}
                                        {tab === 'favorites' && mockFavorites.length > 0 && (
                                            <span className="ml-2 bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs">
                                                {mockFavorites.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content Area */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <>
                                        {/* Customer Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <DollarSign className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500">Total Spent</span>
                                                </div>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    ${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between text-xs">
                                                    <span className="text-green-600 mr-2">+12.5%</span>
                                                    <span className="text-gray-500">from last month</span>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2 bg-green-50 rounded-lg">
                                                        <Package className="w-5 h-5 text-green-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500">Total Orders</span>
                                                </div>
                                                <p className="text-2xl font-semibold text-gray-900">{customer.totalOrders}</p>
                                                <div className="mt-2 flex items-center justify-between text-xs">
                                                    <span className="text-green-600 mr-2">+2 orders</span>
                                                    <span className="text-gray-500">this month</span>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        <ShoppingCart className="w-5 h-5 text-purple-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500">Cart Items</span>
                                                </div>
                                                <p className="text-2xl font-semibold text-gray-900">{mockCartItems.length}</p>
                                                <div className="mt-2 justify-between text-xs text-gray-500">
                                                    ${cartTotal.toFixed(2)} total
                                                </div>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2 bg-pink-50 rounded-lg">
                                                        <Heart className="w-5 h-5 text-pink-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500">Favorites</span>
                                                </div>
                                                <p className="text-2xl font-semibold text-gray-900">{mockFavorites.length}</p>
                                                <div className="mt-2 justify-between text-xs text-gray-500">
                                                    Products saved
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Activity Overview */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Recent Orders */}
                                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                                    <button
                                                        onClick={() => setActiveTab('orders')}
                                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                                                    >
                                                        View all <ChevronRight className="w-4 h-4 ml-1" />
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {mockOrders.slice(0, 3).map((order) => (
                                                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                                    <Package className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">{order.orderNumber}</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        {order.orderDate.toLocaleDateString()} • {order.items.length} items
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                                                    <span className="mr-1">{getOrderStatusIcon(order.status)}</span>
                                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cart Items */}
                                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-semibold text-gray-900">Current Cart</h3>
                                                    <button
                                                        onClick={() => setActiveTab('cart')}
                                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                                                    >
                                                        View cart <ChevronRight className="w-4 h-4 ml-1" />
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {mockCartItems.slice(0, 2).map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                    <Package2 className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="pt-4 border-t border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Cart Total</span>
                                                            <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Orders Tab */}
                                {activeTab === 'orders' && (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="p-6 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                                            <p className="text-sm text-gray-500">All orders placed by this customer</p>
                                        </div>
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
                                                    {mockOrders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {order.orderDate.toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {order.orderDate.toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{order.items.length} items</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {order.items[0]?.productName}
                                                                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                                                    <span className="mr-1.5">{getOrderStatusIcon(order.status)}</span>
                                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    ${order.totalAmount.toFixed(2)}
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
                                                                    <button
                                                                        onClick={() => console.log('Print invoice:', order.id)}
                                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                                                                        title="Print Invoice"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4" />
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
                                        <div className="p-6 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                                                    View Full Order History
                                                </button>
                                                <div className="text-sm text-gray-500">
                                                    Total orders: {mockOrders.length}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cart Tab */}
                                {activeTab === 'cart' && (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                                                    <p className="text-sm text-gray-500">Current items in customer's cart</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</div>
                                                    <div className="text-sm text-gray-500">Total cart value</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {mockCartItems.map((item) => (
                                                <div key={item.id} className="p-6 hover:bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Package2 className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                                                <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
                                                                <div className="flex items-center space-x-4 mt-2">
                                                                    <div className="text-sm text-gray-600">
                                                                        Added: {item.addedDate.toLocaleDateString()}
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <button
                                                                            onClick={() => console.log('View product:', item.productId)}
                                                                            className="text-sm text-purple-600 hover:text-purple-700"
                                                                        >
                                                                            View Product
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center space-x-6">
                                                                <div className="text-right">
                                                                    <div className="text-lg font-semibold text-gray-900">
                                                                        ${(item.price * item.quantity).toFixed(2)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        ${item.price.toFixed(2)} × {item.quantity}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => console.log('Remove from cart:', item.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                        title="Remove from Cart"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600">Cart has been inactive for 2 days</p>
                                                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                                        Send cart reminder email
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">${cartTotal.toFixed(2)}</div>
                                                    <div className="text-sm text-gray-500">Potential revenue</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Favorites Tab */}
                                {activeTab === 'favorites' && (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Favorite Products</h3>
                                                    <p className="text-sm text-gray-500">Products saved by the customer</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                                                        {mockFavorites.length} items
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                            {mockFavorites.map((item) => (
                                                <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Heart className="w-6 h-6 text-pink-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                                                <p className="text-sm text-gray-500 mt-1">Category: {item.category}</p>
                                                                <div className="flex items-center space-x-4 mt-3">
                                                                    <span className="text-lg font-semibold text-gray-900">
                                                                        ${item.price.toFixed(2)}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        Saved: {item.addedDate.toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => console.log('Remove favorite:', item.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Remove from Favorites"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                        <button
                                                            onClick={() => console.log('View product:', item.productId)}
                                                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                        >
                                                            View Product Details
                                                        </button>
                                                        <button
                                                            onClick={() => console.log('Add to cart:', item.productId)}
                                                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {mockFavorites.length === 0 && (
                                            <div className="p-12 text-center">
                                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                                                <p className="text-gray-500 max-w-md mx-auto">
                                                    This customer hasn't saved any products to their favorites.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Notes Tab */}
                                {activeTab === 'notes' && (
                                    <div className="space-y-6">

                                        {/* Add Note */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Add Note
                                            </h3>

                                            <div className="space-y-4">
                                                <textarea
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Add a note about this customer..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    rows={3}
                                                />

                                                <div className="flex justify-between">
                                                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                        <option value="general">General</option>
                                                        <option value="sales">Sales</option>
                                                        <option value="support">Support</option>
                                                        <option value="followup">Follow-up</option>
                                                    </select>

                                                    <button
                                                        onClick={handleAddNote}
                                                        className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span>Add Note</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes History */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Notes History
                                            </h3>

                                            {notes.map((note) => (
                                                <div
                                                    key={note.id}
                                                    className="bg-white border border-gray-200 rounded-xl p-6"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {note.author.charAt(0)}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {note.author}
                                                                </h4>
                                                                <p className="text-sm text-gray-500">
                                                                    {note.date.toLocaleDateString()} • {note.type}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-700">{note.content}</p>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                )}

                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Customer Details Card */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Details</h3>

                                    {/* Status & Tier */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(customer.status)}
                                                <span className="text-sm font-medium text-gray-700">Status</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === 'active' ? 'bg-green-100 text-green-800' :
                                                customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getTierIcon(customer.tier)}
                                                <span className="text-sm font-medium text-gray-700">Customer Tier</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${customer.tier === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                                                customer.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-4 mb-6">
                                        <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                                <a href={`mailto:${customer.email}`} className="hover:text-purple-600">
                                                    {customer.email}
                                                </a>
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                                    <a href={`tel:${customer.phone}`} className="hover:text-purple-600">
                                                        {customer.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Membership Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-gray-700">Membership</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Member Since</span>
                                                <span className="font-medium text-gray-900">
                                                    {customer.joinDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Last Order</span>
                                                <span className="font-medium text-gray-900">
                                                    {customer.lastOrderDate
                                                        ? customer.lastOrderDate.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                        : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {customer.tags && customer.tags.length > 0 && (
                                        <div className="pt-6 mt-6 border-t border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {customer.tags.map((tag) => (
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

                                {/* Quick Actions */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>Send Cart Reminder</span>
                                            </div>
                                            {mockCartItems.length > 0 && (
                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                                                    {mockCartItems.length} items
                                                </span>
                                            )}
                                        </button>
                                        <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                            <div className="flex items-center space-x-3">
                                                <Heart className="w-4 h-4 text-pink-400" />
                                                <span>Send Favorites Update</span>
                                            </div>
                                            {mockFavorites.length > 0 && (
                                                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                                                    {mockFavorites.length} items
                                                </span>
                                            )}
                                        </button>
                                        <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                            <div className="flex items-center space-x-3">
                                                <CreditCard className="w-4 h-4 text-gray-400" />
                                                <span>View Order History</span>
                                            </div>
                                            <span className="text-gray-400">{mockOrders.length}</span>
                                        </button>
                                        <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                            <div className="flex items-center space-x-3">
                                                <Bell className="w-4 h-4 text-gray-400" />
                                                <span>Set Follow-up</span>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Purchase Insights */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Purchase Insights</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Average Order Value</span>
                                            <span className="font-medium text-gray-900">
                                                ${(customer.totalSpent / customer.totalOrders).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Days Since Last Order</span>
                                            <span className="font-medium text-gray-900">
                                                {customer.lastOrderDate
                                                    ? Math.floor((new Date().getTime() - customer.lastOrderDate.getTime()) / (1000 * 3600 * 24))
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Cart Abandonment</span>
                                            <span className="font-medium text-gray-900">
                                                {mockCartItems.length > 0 ? 'Active' : 'None'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Favorite Categories</span>
                                            <span className="font-medium text-gray-900">
                                                Electronics
                                            </span>
                                        </div>
                                    </div>
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
                                console.log('Send cart reminder to:', customer.email);
                                // Send cart reminder logic
                            }}
                            className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
                            disabled={mockCartItems.length === 0}
                        >
                            Send Cart Reminder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}