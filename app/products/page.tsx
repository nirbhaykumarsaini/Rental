// app/products/page.tsx
'use client';

import { useState } from 'react';
import { ProductList } from '@/app/components/products/ProductList';
import { AddProduct } from '@/app/components/products/AddProduct';
import { Package } from 'lucide-react';
import { Product } from '../types/product.types';

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleSubmitProduct = (productData: Product) => {
    console.log('Product submitted:', productData);
    // Here you would typically make an API call
    if (editingProduct) {
      console.log('Updating product:', editingProduct.id);
    } else {
      console.log('Adding new product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-500">Manage your product inventory and details</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">245</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">189</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">42</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full">
              <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">14</p>
            </div>
            <div className="p-2 bg-red-50 rounded-full">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Component */}
      <ProductList 
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
      />

      {/* Add/Edit Product Modal */}
      <AddProduct
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
}