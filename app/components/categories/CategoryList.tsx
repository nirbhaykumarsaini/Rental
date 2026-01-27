// app/components/categories/CategoryList.tsx
'use client';

import { useState } from 'react';
import { Category } from '@/app/types/category.types';
import {
  Edit2,
  Trash2,
  Folder,
  Loader2
} from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export function CategoryList({
  categories,
  loading,
  onEditCategory,
  onDeleteCategory
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (categoryId: string) => {
    try {
      setDeletingId(categoryId);
      await onDeleteCategory(categoryId);
    } finally {
      setDeletingId(null);
    }
  };

  const CategoryItem = ({
    category,
    level = 0,
  }: {
    category: Category;
    level: number;
    isParent: boolean;
  }) => {
    const isDeleting = deletingId === category._id.toString();

    return (
      <>
        <div
          className={`flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 ${level > 0 ? 'bg-gray-50' : 'bg-white'
            }`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">

            <div
              className="w-4 h-4 rounded-full"
            />

            <div className="flex-1">
              <div className="flex items-center space-x-3">
                {(category.category_image) && (
                  <div className="relative">
                    <div className="w-full h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={category.category_image}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                  </div>
                )}
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                {!category.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {category.productCount || 0} products
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditCategory(category)}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(category._id.toString())}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
          <p className="text-sm text-gray-500">Loading categories...</p>
        </div>
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
            <p className="text-sm text-gray-500">Manage and organize your product categories</p>
          </div>
          <div className="text-sm text-gray-500">
            {categories.length} categories
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="divide-y divide-gray-100">
        {categories.map(category => (
          <CategoryItem
            key={category._id.toString()}
            category={category}
            level={0}
            isParent={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="py-16 text-center">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Start by creating your first category to organize your products.
          </p>
        </div>
      )}
    </div>
  );
}