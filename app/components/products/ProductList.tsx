// D:\B2B\app\components\products\ProductList.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  Palette,
  Ruler,
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle,
  Layers,
  Tag,
  Globe,
  Star,
  Clock,
  DollarSign,
  Calendar,
  Copy,
  Download
} from 'lucide-react';
import { Product } from '@/app/types/product.types';
import { Category } from '@/app/types/category.types';
import toast from 'react-hot-toast';
import categoryService from '@/app/services/categoryService';
import productService from '@/app/services/productService';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onToggleFeatured?: (productId: string, isFeatured: boolean) => void;
  onTogglePublish?: (productId: string, isPublished: boolean) => void;
  onToggleAvailability?: (productId: string, isAvailable: boolean) => void;
}

const statusOptions = ['All', 'available', 'unavailable', 'draft', 'archived'];

export function ProductList({
  products,
  loading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleFeatured,
  onTogglePublish,
  onToggleAvailability
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 5;

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        withSubcategories: true,
        withProductCount: true
      });

      if (response.status && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Product['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'unavailable': return <XCircle className="w-4 h-4" />;
      case 'draft': return <Package className="w-4 h-4" />;
      case 'archived': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'available': return 'Available';
      case 'unavailable': return 'Unavailable';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const getMinRentalPrice = (product: Product) => {
    if (!product.rentalPrices || product.rentalPrices.length === 0) {
      return product.price;
    }
    
    const activePrices = product.rentalPrices.filter(rp => rp.isActive);
    if (activePrices.length === 0) return product.price;
    
    return Math.min(...activePrices.map(rp => rp.price));
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSort = (field: 'name' | 'createdAt' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    const csvData = filteredProducts.map(p => ({
      Name: p.name,
      Slug: p.slug,
      Category: p.category,
      Color: p.color,
      Price: p.price,
      Sizes: p.sizes.join(', '),
      Status: p.status,
      Featured: p.isFeatured ? 'Yes' : 'No',
      'New Arrival': p.isNewArrival ? 'Yes' : 'No',
      'Created At': new Date(p.createdAt).toLocaleDateString()
    }));

    const csv = convertToCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  if (loading && products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={onAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, description, slug, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              <Layers className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Status' : getStatusText(status as Product['status'])}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSort('name')}
                  className={`flex-1 px-4 py-2 border rounded-lg flex items-center justify-center ${
                    sortBy === 'name'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('price')}
                  className={`flex-1 px-4 py-2 border rounded-lg flex items-center justify-center ${
                    sortBy === 'price'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('createdAt')}
                  className={`flex-1 px-4 py-2 border rounded-lg flex items-center justify-center ${
                    sortBy === 'createdAt'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Newest {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="divide-y divide-gray-200">
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No products found</h4>
            <p className="text-gray-500 mb-4">
              {filteredProducts.length === 0 && products.length > 0
                ? 'No products match your current filters.'
                : 'Start by adding your first product.'}
            </p>
            {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={onAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          paginatedProducts.map((product) => {
            const isExpanded = expandedProducts.has(product._id);
            const minRentalPrice = getMinRentalPrice(product);
            
            return (
              <div key={product._id} className="p-6 hover:bg-gray-50 transition-colors">
                {/* Product Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                        {product.isFeatured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Globe className="w-3 h-3 mr-1" />
                          <span className="font-mono text-xs">{product.slug}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Tag className="w-3 h-3 mr-1" />
                          <span>{product.category}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <div 
                            className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                            style={{ backgroundColor: product.colorCode }}
                          />
                          <span>{product.color}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 max-w-2xl">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      <span className="ml-1.5 text-sm font-medium">
                        {getStatusText(product.status)}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="flex items-center justify-end">
                          <span className="text-sm text-gray-500 line-through mr-2">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {product.discountPercentage}% off
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Rental from ${minRentalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Sizes</p>
                        <p className="text-lg font-semibold text-gray-900">{product.sizes.length}</p>
                      </div>
                      <Ruler className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Features</p>
                        <p className="text-lg font-semibold text-gray-900">{product.features.length}</p>
                      </div>
                      <Tag className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Rental Options</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {product.rentalPrices?.filter(rp => rp.isActive).length || 0}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Images</p>
                        <p className="text-lg font-semibold text-gray-900">{product.images.length}</p>
                      </div>
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`text-sm font-semibold ${
                          product.isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                      {product.isAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Rental Prices Preview */}
                {product.rentalPrices && product.rentalPrices.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Rental options:</span>
                    {product.rentalPrices
                      .filter(rp => rp.isActive)
                      .slice(0, 3)
                      .map((rp, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {rp.days} days: ${rp.price.toFixed(2)}
                        </span>
                      ))}
                    {product.rentalPrices.filter(rp => rp.isActive).length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{product.rentalPrices.filter(rp => rp.isActive).length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleProductExpansion(product._id)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <Layers className="w-4 h-4 mr-1" />
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Featured Toggle */}
                    <button
                      onClick={() => onToggleFeatured?.(product._id, !product.isFeatured)}
                      className={`p-2 rounded-lg ${
                        product.isFeatured
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title={product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <Star className="w-4 h-4" />
                    </button>

                    {/* Publish Toggle */}
                    <button
                      onClick={() => onTogglePublish?.(product._id, !product.isPublished)}
                      className={`p-2 rounded-lg ${
                        product.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title={product.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      <Globe className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    {onEditProduct && (
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {onDeleteProduct && (
                      <button
                        onClick={() => onDeleteProduct(product._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Features */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                        {product.features.length > 0 ? (
                          <ul className="space-y-2">
                            {product.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No features added</p>
                        )}
                      </div>

                      {/* All Rental Options */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">All Rental Options</h4>
                        {product.rentalPrices && product.rentalPrices.length > 0 ? (
                          <div className="space-y-2">
                            {product.rentalPrices.map((rp, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className={rp.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}>
                                    {rp.days} days
                                  </span>
                                </div>
                                <span className={`font-medium ${rp.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                  ${rp.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No rental options</p>
                        )}
                      </div>

                      {/* All Images */}
                      {product.images && product.images.length > 1 && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">All Images</h4>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {product.images.map((image, idx) => (
                              <img
                                key={idx}
                                src={image}
                                alt={`${product.name} - ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {paginatedProducts.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg border ${
                    currentPage === pageNum
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}