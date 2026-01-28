'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
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
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Product } from '@/app/types/product.types';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onRefresh?: () => void;
}

// Categories and status options
const categories = ['All', 'Clothing', 'Electronics', 'Accessories', 'Footwear', 'Home', 'Other'];
const statusOptions = ['All', 'in-stock', 'low-stock', 'out-of-stock', 'draft', 'archived'];

export function ProductList({ 
  products, 
  loading, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  onRefresh 
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 5;

  // Filter products based on search, category, and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.variants && a.variants.length > 0 ? Math.min(...a.variants.map(v => v.price)) : 0;
        bValue = b.variants && b.variants.length > 0 ? Math.min(...b.variants.map(v => v.price)) : 0;
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

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Product['status']) => {
    switch (status) {
      case 'in-stock': return <CheckCircle className="w-4 h-4" />;
      case 'low-stock': return <AlertCircle className="w-4 h-4" />;
      case 'out-of-stock': return <XCircle className="w-4 h-4" />;
      case 'draft': return <Package className="w-4 h-4" />;
      case 'archived': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'in-stock': return 'In Stock';
      case 'low-stock': return 'Low Stock';
      case 'out-of-stock': return 'Out of Stock';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const calculateTotalStock = (product: Product) => {
    if (!product.hasVariants || !product.variants || product.variants.length === 0) {
      return product.minOrderQuantity || 0;
    }
    
    return product.variants.reduce((total, variant) => {
      const variantTotal = variant.sizes?.reduce((sum, size) => sum + (size.inventory || 0), 0) || 0;
      return total + variantTotal;
    }, 0);
  };

  const calculateLowStockCount = (product: Product) => {
    if (!product.hasVariants || !product.variants) return 0;
    
    return product.variants.reduce((count, variant) => {
      const lowStockSizes = variant.sizes?.filter(size => 
        (size.inventory || 0) > 0 && (size.inventory || 0) <= 10
      ).length || 0;
      return count + lowStockSizes;
    }, 0);
  };

  const calculateOutOfStockCount = (product: Product) => {
    if (!product.hasVariants || !product.variants) return 0;
    
    return product.variants.reduce((count, variant) => {
      const outOfStockSizes = variant.sizes?.filter(size => 
        (size.inventory || 0) === 0
      ).length || 0;
      return count + outOfStockSizes;
    }, 0);
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

  const getPriceRange = (product: Product) => {
    if (!product.hasVariants || !product.variants || product.variants.length === 0) {
      return `₹${product.variants?.[0]?.price?.toFixed(2) || '0.00'}`;
    }
    
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `₹${minPrice.toFixed(2)}`;
    }
    
    return `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
  };

  const getUniqueSizes = (product: Product) => {
    if (!product.hasVariants || !product.variants) return [];
    
    const sizeSet = new Set<string>();
    product.variants.forEach(variant => {
      variant.sizes?.forEach(size => {
        sizeSet.add(size.size);
      });
    });
    
    return Array.from(sizeSet);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleSort = (field: 'name' | 'createdAt' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
          <p className="text-gray-500 text-sm mt-1">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </button>
          
          <button
            onClick={onAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, description, slug, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className={`px-4 py-2.5 border rounded-lg flex items-center ${
                sortBy === 'name' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Name
              {sortBy === 'name' && (
                <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            
            <button 
              onClick={() => handleSort('price')}
              className={`px-4 py-2.5 border rounded-lg flex items-center ${
                sortBy === 'price' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Price
              {sortBy === 'price' && (
                <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && products.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Products List */}
          <div className="space-y-4">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No products found</h4>
                <p className="text-gray-500 mb-4">
                  {filteredProducts.length === 0 && products.length > 0
                    ? 'No products match your current filters.'
                    : 'Start by adding your first product.'}
                </p>
                {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
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
                )}
                {onAddProduct && filteredProducts.length === 0 && products.length === 0 && (
                  <button
                    onClick={onAddProduct}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              paginatedProducts.map((product) => {
                const isExpanded = expandedProducts.has(product._id);
                const totalStock = calculateTotalStock(product);
                const lowStockCount = calculateLowStockCount(product);
                const outOfStockCount = calculateOutOfStockCount(product);
                const uniqueSizes = getUniqueSizes(product);
                
                return (
                  <div key={product._id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    {/* Product Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                              {product.isFeatured && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                  Featured
                                </span>
                              )}
                              {!product.isPublished && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Globe className="w-3 h-3 mr-1" />
                                <span className="font-mono">{product.slug}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Tag className="w-3 h-3 mr-1" />
                                <span>{product.category}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Hash className="w-3 h-3 mr-1" />
                                <span>Min Qty: {product.minOrderQuantity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(product.status)}`}>
                            {getStatusIcon(product.status)}
                            <span className="ml-1.5 text-sm font-medium">
                              {getStatusText(product.status)}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">{getPriceRange(product)}</p>
                            <p className="text-sm text-gray-500">Total Stock: {totalStock} units</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Colors</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {product.hasVariants && product.variants ? product.variants.length : 1}
                              </p>
                            </div>
                            <Palette className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Sizes</p>
                              <p className="text-lg font-semibold text-gray-900">{uniqueSizes.length}</p>
                            </div>
                            <Ruler className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Low Stock</p>
                              <p className="text-lg font-semibold text-yellow-600">{lowStockCount}</p>
                            </div>
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Out of Stock</p>
                              <p className="text-lg font-semibold text-red-600">{outOfStockCount}</p>
                            </div>
                            <XCircle className="w-5 h-5 text-red-500" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                          {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <button
                              onClick={() => toggleProductExpansion(product._id)}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Layers className="w-4 h-4 mr-1" />
                              {isExpanded ? 'Hide Variants' : `Show ${product.variants.length} Colors`}
                            </button>
                          )}
                          
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex items-center">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded mr-2">
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{product.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {onEditProduct && (
                            <button
                              onClick={() => onEditProduct(product)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="View Product">
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {onDeleteProduct && (
                            <button
                              onClick={() => onDeleteProduct(product._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Variants Section */}
                    {isExpanded && product.hasVariants && product.variants && product.variants.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Color Variants</h4>
                          <div className="space-y-3">
                            {product.variants.map((variant, variantIndex) => (
                              <div key={variant._id || variantIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div 
                                      className="w-6 h-6 rounded border"
                                      style={{ backgroundColor: variant.colorCode }}
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900">{variant.color}</p>
                                      <p className="text-sm text-gray-500">₹{variant.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center">
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        variant.isActive 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {variant.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                      {variant.sizes?.length || 0} size{(variant.sizes?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Stock: {(variant.sizes || []).reduce((sum, size) => sum + (size.inventory || 0), 0)} units
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Sizes Table */}
                                {variant.sizes && variant.sizes.length > 0 && (
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-full">
                                      <thead>
                                        <tr className="bg-gray-50">
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Size
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            SKU
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Inventory
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {variant.sizes.map((size, sizeIndex) => (
                                          <tr key={size._id || sizeIndex} className="border-b border-gray-100 last:border-0">
                                            <td className="px-3 py-2">
                                              <div className="flex items-center">
                                                <Ruler className="w-3 h-3 text-gray-400 mr-2" />
                                                <span className="font-medium text-gray-900">{size.size}</span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="flex items-center">
                                                <Hash className="w-3 h-3 text-gray-400 mr-2" />
                                                <code className="text-sm text-gray-600 font-mono">{size.sku}</code>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="flex items-center">
                                                <span className={`font-medium ${
                                                  (size.inventory || 0) === 0 
                                                    ? 'text-red-600' 
                                                    : (size.inventory || 0) <= 10 
                                                    ? 'text-yellow-600' 
                                                    : 'text-green-600'
                                                }`}>
                                                  {size.inventory || 0} units
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                                  size.isActive 
                                                    ? (size.inventory || 0) === 0 
                                                      ? 'bg-red-500' 
                                                      : (size.inventory || 0) <= 10 
                                                      ? 'bg-yellow-500' 
                                                      : 'bg-green-500'
                                                    : 'bg-gray-400'
                                                }`} />
                                                <span className="text-sm text-gray-700">
                                                  {size.isActive 
                                                    ? (size.inventory || 0) === 0 
                                                      ? 'Out of Stock' 
                                                      : (size.inventory || 0) <= 10 
                                                      ? 'Low Stock' 
                                                      : 'In Stock'
                                                    : 'Inactive'
                                                  }
                                                </span>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                
                                {/* Variant Images */}
                                {variant.images && variant.images.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-2">Color Images:</p>
                                    <div className="flex space-x-2 overflow-x-auto pb-2">
                                      {variant.images.map((image, index) => (
                                        <img 
                                          key={index}
                                          src={image} 
                                          alt={`${variant.color} - ${index + 1}`}
                                          className="w-12 h-12 object-cover rounded border border-gray-200"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Product Images */}
                          {product.images && product.images.length > 1 && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-500 mb-2">Product Images:</p>
                              <div className="flex space-x-2 overflow-x-auto pb-2">
                                {product.images.map((image, index) => (
                                  <img 
                                    key={index}
                                    src={image} 
                                    alt={`${product.name} - ${index + 1}`}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 pt-6 border-t border-gray-200">
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

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 rounded-lg border ${
                      currentPage === index + 1
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

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
        </>
      )}
    </div>
  );
}