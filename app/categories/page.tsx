// app/categories/page.tsx
'use client';

import { useState } from 'react';
import { CategoryList } from '@/app/components/categories/CategoryList';
import { AddCategory } from '@/app/components/categories/AddCategory';
import { Layers, Package, Plus } from 'lucide-react';
import { Category, CategoryFormData } from '../types/category.types';

export default function CategoriesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddModalOpen(true);
  };

  const handleSubmitCategory = (categoryData: CategoryFormData) => {
    console.log('Category submitted:', categoryData);
    // Here you would typically make an API call
    if (editingCategory) {
      console.log('Updating category:', editingCategory.id);
    } else {
      console.log('Adding new category');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-500">Organize products with categories and sub-categories</p>
            </div>
          </div>
          
          <button
            onClick={handleAddCategory}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Categories</p>
              <p className="text-2xl font-semibold text-gray-900">48</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-full">
              <Layers className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Main Categories</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Sub-categories</p>
              <p className="text-2xl font-semibold text-gray-900">36</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">1,245</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Category List Component */}
      <CategoryList 
        onEditCategory={handleEditCategory}
      />

      {/* Add/Edit Category Modal */}
      <AddCategory
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitCategory}
        editingCategory={editingCategory}
      />
    </div>
  );
}