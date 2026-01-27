// app/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CategoryList } from '@/app/components/categories/CategoryList';
import { AddCategory } from '@/app/components/categories/AddCategory';
import { Layers, Package, Plus, RefreshCw } from 'lucide-react';
import { Category } from '../types/category.types';
import categoryService, { CategoryStatistics } from '@/app/services/categoryService';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<CategoryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories({
        withSubcategories: true,
        withProductCount: true
      });
      
      if (response.status && response.data) {
        setCategories(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await categoryService.getStatistics();
      if (response.status && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        active: true,
        limit: 100
      });
      
      if (response.status && response.data) {
        setParentCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatistics();
    fetchParentCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddModalOpen(true);
  };

  const handleSubmitCategory = async (categoryData: CategoryFormData, imageFile?: File) => {
    try {
      let response;
      
      if (editingCategory) {
        // Update existing category
        response = await categoryService.updateCategory(
          editingCategory._id.toString(),
          categoryData,
          imageFile,
          !categoryData.category_image // remove image if empty
        );
      } else {
        // Create new category
        response = await categoryService.createCategory(categoryData, imageFile);
      }

      if (response.status) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setIsAddModalOpen(false);
        fetchCategories();
        fetchStatistics();
        fetchParentCategories();
      } else {
        toast.error(response.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete the category image from Cloudinary.')) {
      return;
    }

    try {
      const response = await categoryService.deleteCategory(categoryId);
      if (response.status) {
        toast.success('Category deleted successfully');
        fetchCategories();
        fetchStatistics();
        fetchParentCategories();
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
    fetchStatistics();
    fetchParentCategories();
  };

  console.log(statistics)

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-500 mt-1">Organize products with categories and manage category images</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button> */}
            
            <button
              onClick={handleAddCategory}
              className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Categories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : statistics?.totalCategories || 0}
              </p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-full">
              <Layers className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Categories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : statistics?.activeCategories || 0}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Inactive Categories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : statistics?.inactiveCategories || 0}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">


        {/* Category List Component */}
        {loading ? (
          <div className="p-8 md:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first product category
            </p>
            <button
              onClick={handleAddCategory}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add First Category
            </button>
          </div>
        ) : (
          <CategoryList 
            categories={categories}
            loading={loading}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <AddCategory
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmitCategory}
        editingCategory={editingCategory}
        parentCategories={parentCategories}
      />
    </div>
  );
}