// app/components/categories/AddCategory.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Category, CategoryFormData } from '@/app/types/category.types';
import { X, Plus, Trash2, Palette, Hash, Loader2, Check, Upload, Image as ImageIcon } from 'lucide-react';
import categoryService from '@/app/services/categoryService';

interface AddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: CategoryFormData, imageFile?: File) => void;
  editingCategory: Category | null;
  parentCategories: Category[];
}

export function AddCategory({ isOpen, onClose, onSubmit, editingCategory }: AddCategoryProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    category_image: '',
    slug: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      category_image: '',
      slug: '',
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setSlugAvailable(null);
    setErrors([]);
  };

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        category_image: editingCategory.category_image,
        slug: editingCategory.slug,
        isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true,
      });

      if (editingCategory.category_image) {
        setImagePreview(editingCategory.category_image);
      }
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

    if (name === 'slug') {
      setSlugAvailable(null);
    }

  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(['Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.']);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(['File size too large. Maximum size is 5MB.']);
      return;
    }

    setImageFile(file);
    setErrors(prev => prev.filter(error => !error.includes('file')));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (!editingCategory) {
      setFormData(prev => ({ ...prev, category_image: '' }));
    }
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
    setSlugAvailable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = categoryService.validateCategoryData({
      name: formData.name || '',
      slug: formData.slug || '',
      category_image: formData.category_image || '',
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Check slug availability for new categories
    if (!editingCategory && slugAvailable === false) {
      setErrors(['Slug is already taken. Please choose another.']);
      return;
    }

    const categoryData: CategoryFormData = {
      name: formData.name || '',
      category_image: formData.category_image || '',
      slug: formData.slug || '',
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    };

    setLoading(true);
    try {
      await onSubmit(categoryData, imageFile || undefined);
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

              {/* Category Image */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Image
                </label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {(imagePreview || formData.category_image) && (
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview || formData.category_image}
                          alt="Category preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 left-20 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  { (!imagePreview || !formData.category_image) && (<div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center"
                      disabled={loading}
                    >
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {imagePreview ? 'Change Image' : 'Upload Category Image'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, WebP up to 5MB
                      </span>
                    </button>
                  </div>)}
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
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${slugAvailable === false
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

              {/* Active Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
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
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active Category
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Inactive categories won't be displayed to customers
                </p>
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