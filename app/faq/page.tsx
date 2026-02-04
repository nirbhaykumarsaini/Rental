// app/admin/faq/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    HelpCircle,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Eye,
    Copy,
    Search,
    Filter,
    Calendar,
    Clock,
    AlertCircle,
    Loader2,
    Save,
    ChevronRight,
    Tag,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    RefreshCw,
    FileText
} from 'lucide-react';

interface FAQItem {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    views?: number;
    helpfulCount?: number;
    notHelpfulCount?: number;
}

interface CategoryStats {
    category: string;
    count: number;
}

export default function AdminFAQPage() {
    // State management
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);
    const [categories, setCategories] = useState<string[]>(['All', 'Returns', 'Refunds', 'Account', 'Order', 'Policy', 'Gift Card', 'Shipping', 'Payment', 'General']);
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showInactive, setShowInactive] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Selected items
    const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
    const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);

    // Form states
    const [newFAQ, setNewFAQ] = useState({
        question: '',
        answer: '',
        category: 'General',
        order: 0,
        isActive: true
    });

    const [editForm, setEditForm] = useState({
        question: '',
        answer: '',
        category: 'General',
        order: 0,
        isActive: true
    });

    // Initialize
    useEffect(() => {
        fetchFAQs();
    }, []);

    // Apply filters whenever dependencies change
    useEffect(() => {
        applyFilters();
    }, [faqs, searchTerm, selectedCategory, showInactive]);

    const fetchFAQs = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token');

            // Fetch ALL FAQs (both active and inactive) for admin
            const response = await fetch('/api/v1/faqs/admin', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status && data.data) {
                setFaqs(data.data.faqs || []);
            } else {
                setError(data.message || 'Failed to fetch FAQs');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch FAQs');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...faqs];

        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(faq =>
                faq.question.toLowerCase().includes(term) ||
                faq.answer.toLowerCase().includes(term) ||
                faq.category.toLowerCase().includes(term)
            );
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(faq => faq.category === selectedCategory);
        }

        // Apply active/inactive filter
        if (!showInactive) {
            filtered = filtered.filter(faq => faq.isActive);
        }

        // Sort by order, then by creation date
        filtered.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setFilteredFaqs(filtered);
    };

    const handleCreateFAQ = async () => {
        if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
            setError('Question and answer are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/v1/faqs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newFAQ)
            });

            const data = await response.json();

            if (data.status) {
                setSuccess('FAQ created successfully');
                setShowCreateModal(false);
                setNewFAQ({
                    question: '',
                    answer: '',
                    category: 'General',
                    order: 0,
                    isActive: true
                });
                fetchFAQs();
            } else {
                setError(data.message || 'Failed to create FAQ');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create FAQ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateFAQ = async () => {
        if (!selectedFAQ?._id) {
            setError('No FAQ selected for editing');
            return;
        }

        if (!editForm.question.trim() || !editForm.answer.trim()) {
            setError('Question and answer are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/v1/faqs/${selectedFAQ._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();

            if (data.status) {
                setSuccess('FAQ updated successfully');
                setShowEditModal(false);
                setSelectedFAQ(null);
                fetchFAQs();
            } else {
                setError(data.message || 'Failed to update FAQ');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update FAQ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFAQ = async () => {
        if (!faqToDelete?._id) {
            setError('No FAQ selected for deletion');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/v1/faqs/${faqToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status) {
                setSuccess('FAQ deleted successfully');
                setShowDeleteModal(false);
                setFaqToDelete(null);
                fetchFAQs();
            } else {
                setError(data.message || 'Failed to delete FAQ');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete FAQ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewFAQ = (faq: FAQItem) => {
        setSelectedFAQ(faq);
        setShowViewModal(true);
    };

    const handleEditFAQ = (faq: FAQItem) => {
        setSelectedFAQ(faq);
        setEditForm({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            isActive: faq.isActive
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (faq: FAQItem) => {
        setFaqToDelete(faq);
        setShowDeleteModal(true);
    };

    const handleToggleStatus = async (faq: FAQItem) => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/v1/faqs/${faq._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !faq.isActive })
            });

            const data = await response.json();

            if (data.status) {
                setSuccess(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'} successfully`);
                fetchFAQs();
            } else {
                setError(data.message || 'Failed to update FAQ status');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update FAQ status');
        } finally {
            setIsLoading(false);
        }
    };


    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Returns': 'bg-orange-100 text-orange-800',
            'Refunds': 'bg-red-100 text-red-800',
            'Account': 'bg-blue-100 text-blue-800',
            'Order': 'bg-green-100 text-green-800',
            'Policy': 'bg-purple-100 text-purple-800',
            'Gift Card': 'bg-pink-100 text-pink-800',
            'Shipping': 'bg-yellow-100 text-yellow-800',
            'Payment': 'bg-indigo-100 text-indigo-800',
            'General': 'bg-gray-100 text-gray-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading && faqs.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading FAQs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">FAQ Management</h1>
                            <p className="text-gray-500">Manage frequently asked questions and categories</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New FAQ
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <p className="text-green-700 text-sm">{success}</p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total FAQs</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{faqs.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active FAQs</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {faqs.filter(f => f.isActive).length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Categories</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length - 1}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Tag className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Showing</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredFaqs.length}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Filter className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Stats */}
            {categoryStats.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">FAQ Distribution by Category</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {categoryStats.map((stat) => (
                            <div key={stat.category} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(stat.category)}`}>
                                        {stat.category}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                                <p className="text-sm text-gray-500">FAQs</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search FAQs
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search questions, answers, or categories..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category} {category !== 'All' && categoryStats.find(s => s.category === category) ? `(${categoryStats.find(s => s.category === category)?.count || 0})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active/Inactive Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Filter
                        </label>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowInactive(!showInactive)}
                                className={`px-4 py-2.5 rounded-lg flex items-center ${showInactive ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'}`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {showInactive ? 'Showing All' : 'Showing Active Only'}
                            </button>


                        </div>
                    </div>
                </div>
            </div>

            {/* FAQs Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Question
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFaqs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <HelpCircle className="w-12 h-12 text-gray-400 mb-4" />
                                            <p className="text-gray-500 text-lg">No FAQs found</p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {searchTerm || selectedCategory !== 'All' || showInactive
                                                    ? 'Try adjusting your filters'
                                                    : 'Create your first FAQ by clicking "Add New FAQ"'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredFaqs.map((faq) => (
                                    <tr key={faq._id} className={`hover:bg-gray-50 ${!faq.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium line-clamp-2">{faq.question}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1 mt-1">{faq.answer.substring(0, 100)}...</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                                                {faq.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(faq)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                            >
                                                {faq.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 font-medium">{faq.order}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(faq.updatedAt)}</div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatDateTime(faq.updatedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewFAQ(faq)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View FAQ"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditFAQ(faq)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Edit FAQ"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(faq)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete FAQ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Plus className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Create New FAQ</h2>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question *
                                    </label>
                                    <textarea
                                        value={newFAQ.question}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter the question..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Answer *
                                    </label>
                                    <textarea
                                        value={newFAQ.answer}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                        rows={5}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter the detailed answer..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={newFAQ.category}
                                            onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {categories.filter(c => c !== 'All').map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={newFAQ.order}
                                            onChange={(e) => setNewFAQ({ ...newFAQ, order: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={newFAQ.isActive}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                        Active (visible to users)
                                    </label>
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateFAQ}
                                        disabled={isLoading}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Create FAQ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedFAQ && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Eye className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">FAQ Details</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Question</h3>
                                    <p className="text-gray-700 text-lg">{selectedFAQ.question}</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Answer</h4>
                                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {selectedFAQ.answer}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">Category</p>
                                        <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedFAQ.category)}`}>
                                            {selectedFAQ.category}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">Order</p>
                                        <p className="text-gray-900 font-medium text-lg">{selectedFAQ.order}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">Status</p>
                                        <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedFAQ.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedFAQ.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600">Created</p>
                                        <p className="text-gray-900 text-sm">{formatDate(selectedFAQ.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleEditFAQ(selectedFAQ);
                                        }}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit FAQ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedFAQ && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Edit className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit FAQ</h2>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question *
                                    </label>
                                    <textarea
                                        value={editForm.question}
                                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Answer *
                                    </label>
                                    <textarea
                                        value={editForm.answer}
                                        onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                                        rows={5}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {categories.filter(c => c !== 'All').map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.order}
                                            onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="editIsActive"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                                        Active (visible to users)
                                    </label>
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateFAQ}
                                        disabled={isLoading}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Update FAQ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && faqToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Delete FAQ
                            </h3>

                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete this FAQ?
                                <br />
                                <span className="font-medium text-gray-900">{faqToDelete.question}</span>
                            </p>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span>This action cannot be undone. The FAQ will be permanently deleted.</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteFAQ}
                                    disabled={isLoading}
                                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )}
                                    Delete FAQ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}