// app/components/categories/AddCategory.tsx
'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '@/app/types/category.types';
import { X, Plus, Trash2, Palette, Hash, Loader2, Check } from 'lucide-react';
import categoryService from '@/app/services/categoryService';
import { Types } from 'mongoose';

interface AddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: CategoryFormData) => void;
  editingCategory: Category | null;
  parentCategories: Category[];
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

export function AddCategory({ isOpen, onClose, onSubmit, editingCategory, parentCategories }: AddCategoryProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#3B82F6',
    slug: '',
    parentId: null,
    sortOrder: 0,
    isFeatured: false,
    isActive: true,
  });
  const [subCategories, setSubCategories] = useState<Array<{id: string, name: string}>>([]);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      slug: '',
      parentId: null,
      sortOrder: 0,
      isFeatured: false,
      isActive: true,
    });
    setSubCategories([]);
    setNewSubCategory('');
    setSlugAvailable(null);
    setErrors([]);
  };

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        color: editingCategory.color,
        slug: editingCategory.slug,
        parentId: editingCategory.parentId,
        sortOrder: editingCategory.sortOrder || 0,
        isFeatured: editingCategory.isFeatured || false,
        isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true,
      });

      setSubCategories(
        editingCategory.subCategories?.map(sc => ({
          id: sc._id.toString(),
          name: sc.name,
        })) || []
      );
    } else {
      resetForm();
    }
  }, [editingCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear slug availability when slug changes
    if (name === 'slug') {
      setSlugAvailable(null);
    }
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
    if(!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    setFormData(prev => ({ ...prev, slug }));
    setSlugAvailable(null);
  };

  const checkSlugAvailability = async () => {
    if (!formData.slug) return;
    
    try {
      setCheckingSlug(true);
      const response = await categoryService.checkSlugAvailability(
        formData.slug,
        editingCategory?._id.toString()
      );
      
      if (response.status && response.data) {
        setSlugAvailable(response.data.available);
        if (!response.data.available) {
          setErrors(['Slug is already taken. Please choose another.']);
        } else {
          setErrors([]);
        }
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = categoryService.validateCategoryData({
      name: formData.name || '',
      slug: formData.slug || '',
      color: formData.color || '#3B82F6',
      description: formData.description,
      parentId: formData.parentId,
      subCategories: subCategories.map(sc => sc.name),
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Check slug availability if not already checked
    if (slugAvailable === null) {
      await checkSlugAvailability();
      if (!slugAvailable) {
        return;
      }
    }

    // Check slug availability for new categories
    if (!editingCategory && slugAvailable === false) {
      setErrors(['Slug is already taken. Please choose another.']);
      return;
    }

    const categoryData: CategoryFormData = {
      name: formData.name || '',
      description: formData.description,
      color: formData.color || '#3B82F6',
      slug: formData.slug || '',
      parentId: formData.parentId ?? null,
      sortOrder: formData.sortOrder || 0,
      isFeatured: formData.isFeatured || false,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      subCategories: subCategories.map(sc => sc.name),
    };

    setLoading(true);
    try {
      await onSubmit(categoryData);
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

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
                  disabled={loading}
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Color
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm text-gray-500">{formData.color}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      disabled={loading}
                      className={`w-6 h-6 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-transparent'
                      } disabled:opacity-50`}
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
                    Slug *
                  </label>
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    disabled={loading || !formData.name}
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
                    onBlur={checkSlugAvailability}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      slugAvailable === false 
                        ? 'border-red-300' 
                        : slugAvailable === true 
                          ? 'border-green-300' 
                          : 'border-gray-300'
                    }`}
                    placeholder="electronics"
                    required
                    disabled={loading}
                  />
                  {checkingSlug ? (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  ) : slugAvailable === true ? (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  ) : null}
                </div>
                {slugAvailable === false && (
                  <p className="text-sm text-red-600">This slug is already taken</p>
                )}
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">No Parent (Main Category)</option>
                  {parentCategories
                    .filter(cat => !editingCategory || cat._id !== editingCategory._id)
                    .map(category => (
                      <option key={category._id.toString()} value={category._id.toString()}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Lower numbers appear first</p>
              </div>

              {/* Featured & Active */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured || false}
                    onChange={handleInputChange}
                    id="isFeatured"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured Category
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive !== undefined ? formData.isActive : true}
                    onChange={handleInputChange}
                    id="isActive"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Category
                  </label>
                </div>
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
                    disabled={loading}
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
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          disabled={loading}
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
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || slugAvailable === false}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingCategory ? (
                  'Update Category'
                ) : (
                  'Create Category'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}