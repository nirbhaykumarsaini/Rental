// app/components/categories/AddCategory.tsx
'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryFormData ,SubCategory } from '@/app/types/category.types';
import { X, Plus, Trash2, Palette, Hash } from 'lucide-react';

interface AddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: CategoryFormData) => void;
  editingCategory: Category | null;
}

const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function AddCategory({ isOpen, onClose, onSubmit, editingCategory }: AddCategoryProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#3B82F6',
    slug: '',
    parentId: null,
  });
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [newSubCategory, setNewSubCategory] = useState('');

  // Mock parent categories for dropdown
  const parentCategories = [
    { id: null, name: 'No Parent (Main Category)' },
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Fashion' },
    { id: '3', name: 'Home & Kitchen' },
  ];

  const resetForm = () => {
  setFormData({
    name: '',
    description: '',
    color: '#3B82F6',
    slug: '',
    parentId: null,
  });
  setSubCategories([]);
  setNewSubCategory('');
};

useEffect(() => {
  if (editingCategory) {
    setFormData({
      name: editingCategory.name,
      description: editingCategory.description || '',
      color: editingCategory.color,
      slug: editingCategory.slug,
      parentId: editingCategory.parentId,
    });

    setSubCategories(
      editingCategory.subCategories?.map(sc => ({
        id: sc.id,
        name: sc.name,
      })) || []
    );
  } else {
    resetForm();
  }
}, [editingCategory]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleAddSubCategory = () => {
    if (newSubCategory.trim()) {
      setSubCategories(prev => [
        ...prev,
        { id: `temp-${Date.now()}`, name: newSubCategory.trim() }
      ]);
      setNewSubCategory('');
    }
  };

  const handleRemoveSubCategory = (id: string) => {
    setSubCategories(prev => prev.filter(sc => sc.id !== id));
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.slug) return;

  const categoryData: CategoryFormData = {
    name: formData.name,
    description: formData.description,
    icon: formData.icon,
    color: formData.color || '#3B82F6',
    slug: formData.slug,
    parentId: formData.parentId ?? null,
    subCategories: subCategories.map(sc => sc.name),
  };

  onSubmit(categoryData);
  resetForm();
  onClose();
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="text-sm text-gray-500">
                {editingCategory ? 'Update category details' : 'Create a new category for your products'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Electronics"
                  required
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Color
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm text-gray-500">{formData.color}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Generate from name
                  </button>
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="electronics"
                  />
                </div>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <select
                  name="parentId"
                  value={formData.parentId || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {parentCategories.map(category => (
                    <option key={category.id || 'none'} value={category.id || ''}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description (Full width) */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe this category..."
                />
              </div>

              {/* Sub-categories */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub-categories
                  </label>
                  <span className="text-sm text-gray-500">
                    {subCategories.length} added
                  </span>
                </div>
                
                {/* Add Sub-category Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add a sub-category"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubCategory())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Sub-categories List */}
                {subCategories.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {subCategories.map(subCategory => (
                      <div
                        key={subCategory.id}
                        className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span>{subCategory.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubCategory(subCategory.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}