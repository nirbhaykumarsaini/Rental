// components/products/ProductList.tsx
'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product } from '@/app/types/product.types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Apple Watch Series 7',
    category: 'Electronics',
    price: 399,
    stock: 423,
    status: 'In Stock',
    sku: 'APL-WATCH-001',
    description: 'Latest Apple Watch with advanced features',
    createdAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'iPhone 14 Pro',
    category: 'Electronics',
    price: 999,
    stock: 15,
    status: 'Low Stock',
    sku: 'APL-IPH-014',
    description: 'Professional grade iPhone',
    createdAt: new Date('2023-11-15')
  },
  {
    id: '3',
    name: 'MacBook Pro M2',
    category: 'Computers',
    price: 1299,
    stock: 0,
    status: 'Out of Stock',
    sku: 'APL-MBP-M2',
    description: 'Powerful laptop for professionals',
    createdAt: new Date('2023-10-20')
  },
  {
    id: '4',
    name: 'AirPods Pro',
    category: 'Audio',
    price: 249,
    stock: 156,
    status: 'In Stock',
    sku: 'APL-AIR-PRO',
    description: 'Noise cancelling wireless earbuds',
    createdAt: new Date('2023-12-10')
  },
  {
    id: '5',
    name: 'iPad Air',
    category: 'Tablets',
    price: 599,
    stock: 42,
    status: 'In Stock',
    sku: 'APL-IPA-AIR',
    description: 'Lightweight and powerful tablet',
    createdAt: new Date('2023-11-30')
  }
];

interface ProductListProps {
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
}

export function ProductList({ onAddProduct, onEditProduct }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const categories = ['All', 'Electronics', 'Computers', 'Audio', 'Tablets', 'Accessories'];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your products and inventory</p>
        </div>

        <button
          onClick={onAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center"
        >
          <Package className="w-4 h-4 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">SKU</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{product.category}</td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{product.stock} units</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditProduct?.(product)}
                      className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500 mb-4 md:mb-0">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border ${currentPage === 1
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
              className={`w-10 h-10 rounded-lg border ${currentPage === index + 1
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
            className={`p-2 rounded-lg border ${currentPage === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}