// app/components/categories/CategoryList.tsx
'use client';

import { useState } from 'react';
import { Category } from '@/app/types/category.types';
import { 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Folder,
  FolderOpen,
  MoreVertical
} from 'lucide-react';

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    description: 'All electronic gadgets and devices',
    color: '#3B82F6',
    slug: 'electronics',
    parentId: null,
    productCount: 245,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    subCategories: [
      {
        id: '1-1',
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        color: '#60A5FA',
        slug: 'smartphones',
        parentId: '1',
        productCount: 120,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-02-21'),
      },
      {
        id: '1-2',
        name: 'Laptops',
        description: 'Computers and laptops',
        color: '#60A5FA',
        slug: 'laptops',
        parentId: '1',
        productCount: 85,
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-02-22'),
      },
    ]
  },
  {
    id: '2',
    name: 'Fashion',
    description: 'Clothing and accessories',
    color: '#8B5CF6',
    slug: 'fashion',
    parentId: null,
    productCount: 180,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15'),
    subCategories: [
      {
        id: '2-1',
        name: 'Men',
        description: 'Men\'s clothing',
        color: '#A78BFA',
        slug: 'men-fashion',
        parentId: '2',
        productCount: 75,
        createdAt: new Date('2024-01-11'),
        updatedAt: new Date('2024-02-16'),
      },
      {
        id: '2-2',
        name: 'Women',
        description: 'Women\'s clothing',
        color: '#A78BFA',
        slug: 'women-fashion',
        parentId: '2',
        productCount: 105,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-02-17'),
      },
    ]
  },
  {
    id: '3',
    name: 'Home & Kitchen',
    description: 'Home appliances and kitchenware',
    color: '#10B981',
    slug: 'home-kitchen',
    parentId: null,
    productCount: 320,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-10'),
    subCategories: [
      {
        id: '3-1',
        name: 'Kitchenware',
        description: 'Cooking utensils and tools',
        color: '#34D399',
        slug: 'kitchenware',
        parentId: '3',
        productCount: 150,
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-02-11'),
      },
      {
        id: '3-2',
        name: 'Furniture',
        description: 'Home furniture',
        color: '#34D399',
        slug: 'furniture',
        parentId: '3',
        productCount: 90,
        createdAt: new Date('2024-01-07'),
        updatedAt: new Date('2024-02-12'),
      },
      {
        id: '3-3',
        name: 'Home Decor',
        description: 'Decoration items',
        color: '#34D399',
        slug: 'home-decor',
        parentId: '3',
        productCount: 80,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-02-13'),
      },
    ]
  },
];

interface CategoryListProps {
  onEditCategory: (category: Category) => void;
}

export function CategoryList({ onEditCategory }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2', '3']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this category?')) {
      console.log('Delete category:', categoryId);
      // In a real app, you would make an API call here
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const CategoryItem = ({ 
    category, 
    level = 0,
    isParent = false 
  }: { 
    category: Category; 
    level: number;
    isParent: boolean;
  }) => {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.includes(category.id);

    return (
      <>
        <div
          className={`flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 ${
            level > 0 ? 'bg-gray-50' : 'bg-white'
          }`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasSubCategories ? (
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" /> // Spacer for alignment
            )}
            
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            
            {hasSubCategories ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5 text-gray-500" />
              ) : (
                <Folder className="w-5 h-5 text-gray-500" />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {category.productCount} products
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(category);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDeleteCategory(category.id, e)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Render sub-categories if expanded */}
        {hasSubCategories && isExpanded && category.subCategories?.map(subCategory => (
          <CategoryItem
            key={subCategory.id}
            category={subCategory}
            level={level + 1}
            isParent={false}
          />
        ))}
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
        <p className="text-sm text-gray-500">Manage and organize your product categories</p>
      </div>

      {/* Categories List */}
      <div className="divide-y divide-gray-100">
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            level={0}
            isParent={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
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