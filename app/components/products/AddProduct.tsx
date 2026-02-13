'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Package,
  DollarSign,
  Hash,
  FileText,
  Tag,
  Palette,
  Ruler,
  CheckSquare,
  Star,
  Clock,
  Plus,
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Calendar,
  Percent,
  Copy
} from 'lucide-react';
import { Product, ProductFeature, ProductRentalPrice } from '@/app/types/product.types';
import { Category } from '@/app/types/category.types';
import toast from 'react-hot-toast';
import categoryService from '@/app/services/categoryService';

interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  editingProduct?: Product | null;
  isLoading?: boolean;
}

// Predefined color options
const colorOptions = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Red', code: '#FF0000' },
  { name: 'Blue', code: '#0000FF' },
  { name: 'Green', code: '#00FF00' },
  { name: 'Yellow', code: '#FFFF00' },
  { name: 'Purple', code: '#800080' },
  { name: 'Pink', code: '#FFC0CB' },
  { name: 'Gray', code: '#808080' },
  { name: 'Brown', code: '#A52A2A' },
  { name: 'Navy', code: '#000080' },
  { name: 'Maroon', code: '#800000' },
  { name: 'Teal', code: '#008080' },
  { name: 'Olive', code: '#808000' },
  { name: 'Coral', code: '#FF7F50' },
  { name: 'Lavender', code: '#E6E6FA' }
];

// Predefined size options
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', 'One Size'];

const defaultProduct: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'discountPercentage'> = {
  slug: '',
  name: '',
  category: '',
  description: '',
  images: [],
  color: '',
  colorCode: '#000000',
  price: 0,
  compareAtPrice: undefined,
  sizes: [],
  features: [],
  rentalPrices: [], // Start with empty array
  isAvailable: true,
  isFeatured: false,
  isNewArrival: false,
  isPublished: false,
  status: 'draft'
};

export function AddProduct({ isOpen, onClose, onSubmit, editingProduct, isLoading = false }: AddProductProps) {
  const [formData, setFormData] = useState<any>(defaultProduct);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customColorInput, setCustomColorInput] = useState(false);
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<string, boolean>>({});
  const [featureInput, setFeatureInput] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  
  // State for new rental option
  const [newRentalDays, setNewRentalDays] = useState<number>(7);
  const [newRentalPrice, setNewRentalPrice] = useState<number>(0);
  const [showAddRentalForm, setShowAddRentalForm] = useState(false);
  
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize form data when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        // Ensure rental prices exist
        rentalPrices: editingProduct.rentalPrices?.length 
          ? editingProduct.rentalPrices 
          : []
      });
      setImagePreviews(editingProduct.images || []);
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        withSubcategories: true,
        withProductCount: true
      });
      if (response.status && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setFormData(defaultProduct);
    setImagePreviews([]);
    setCustomColorInput(false);
    setCustomSizeInputs({});
    setFeatureInput('');
    setErrors({});
    setExpandedSection('basic');
    setNewRentalDays(7);
    setNewRentalPrice(0);
    setShowAddRentalForm(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Product slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (imagePreviews.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    // Color validation
    if (!formData.color?.trim()) {
      newErrors.color = 'Color is required';
    }

    // Price validation
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.compareAtPrice && formData.compareAtPrice <= formData.price) {
      newErrors.compareAtPrice = 'Compare at price should be higher than regular price';
    }

    // Sizes validation
    if (!formData.sizes || formData.sizes.length === 0) {
      newErrors.sizes = 'At least one size is required';
    }

    // Features validation (at least one feature)
    if (!formData.features || formData.features.length === 0) {
      newErrors.features = 'At least one feature is required';
    }

    // Rental prices validation
    if (!formData.rentalPrices || formData.rentalPrices.length === 0) {
      newErrors.rentalPrices = 'At least one rental price is required';
    } else {
      // Check each rental price
      formData.rentalPrices.forEach((rp: ProductRentalPrice, index: number) => {
        if (rp.isActive) {
          if (!rp.days || rp.days <= 0) {
            newErrors[`rental_${index}_days`] = 'Rental days must be greater than 0';
          }
          if (!rp.price || rp.price <= 0) {
            newErrors[`rental_${index}_price`] = 'Rental price must be greater than 0';
          }
        }
      });

      // Check for duplicate days
      const activeDays = formData.rentalPrices
        .filter((rp: ProductRentalPrice) => rp.isActive)
        .map((rp: ProductRentalPrice) => rp.days);
      
      const hasDuplicates = activeDays.some((day: number, index: number) => 
        activeDays.indexOf(day) !== index
      );
      
      if (hasDuplicates) {
        newErrors.rentalPrices = 'Duplicate rental days are not allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleBasicChange = (field: keyof Product, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from name
      if (field === 'name' && !editingProduct && !prev.slug) {
        updated.slug = generateSlug(value);
      }

      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      return updated;
    });
  };

  const handleColorSelect = (colorName: string, colorCode: string) => {
    setFormData((prev: any) => ({
      ...prev,
      color: colorName,
      colorCode
    }));
    setCustomColorInput(false);
    
    if (errors.color) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.color;
        return newErrors;
      });
    }
  };

  const handleCustomColor = (colorName: string, colorCode: string) => {
    setFormData((prev: any) => ({
      ...prev,
      color: colorName,
      colorCode
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev: any) => {
      const currentSizes = [...(prev.sizes || [])];
      let updatedSizes;
      
      if (currentSizes.includes(size)) {
        updatedSizes = currentSizes.filter(s => s !== size);
      } else {
        updatedSizes = [...currentSizes, size];
      }
      
      return { ...prev, sizes: updatedSizes };
    });

    if (errors.sizes) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sizes;
        return newErrors;
      });
    }
  };

  const handleCustomSizeAdd = (customSize: string) => {
    if (!customSize.trim()) return;
    
    setFormData((prev: any) => {
      const currentSizes = [...(prev.sizes || [])];
      if (!currentSizes.includes(customSize)) {
        return { ...prev, sizes: [...currentSizes, customSize] };
      }
      return prev;
    });
    
    // Close custom input after adding
    setCustomSizeInputs({});
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((size: string) => size !== sizeToRemove)
    }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    
    const newFeature: ProductFeature = {
      name: featureInput.trim()
    };
    
    setFormData((prev: any) => ({
      ...prev,
      features: [...(prev.features || []), newFeature]
    }));
    setFeatureInput('');
    
    if (errors.features) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.features;
        return newErrors;
      });
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      features: (prev.features || []).filter((_: any, i: number) => i !== index)
    }));
  };

  // ============ DYNAMIC RENTAL PRICE FUNCTIONS ============
  
  const handleAddRentalOption = () => {
    // Validate
    if (newRentalDays <= 0) {
      toast.error('Rental days must be greater than 0');
      return;
    }
    
    if (newRentalPrice <= 0) {
      toast.error('Rental price must be greater than 0');
      return;
    }
    
    // Check for duplicate days
    const existingDays = formData.rentalPrices?.map((rp: ProductRentalPrice) => rp.days) || [];
    if (existingDays.includes(newRentalDays)) {
      toast.error(`Rental option for ${newRentalDays} days already exists`);
      return;
    }
    
    const newRentalOption: ProductRentalPrice = {
      days: newRentalDays,
      price: newRentalPrice,
      isActive: true
    };
    
    setFormData((prev: any) => ({
      ...prev,
      rentalPrices: [...(prev.rentalPrices || []), newRentalOption]
    }));
    
    // Reset form
    setNewRentalDays(7);
    setNewRentalPrice(0);
    setShowAddRentalForm(false);
    
    // Clear errors
    if (errors.rentalPrices) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rentalPrices;
        return newErrors;
      });
    }
  };

  const handleUpdateRentalPrice = (index: number, field: keyof ProductRentalPrice, value: any) => {
    setFormData((prev: any) => {
      const updatedRentalPrices = [...(prev.rentalPrices || [])];
      updatedRentalPrices[index] = {
        ...updatedRentalPrices[index],
        [field]: value
      };
      return { ...prev, rentalPrices: updatedRentalPrices };
    });
  };

  const handleRemoveRentalOption = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      rentalPrices: (prev.rentalPrices || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleDuplicateRentalOption = (index: number) => {
    const rentalToDuplicate = formData.rentalPrices[index];
    
    // Find a new days value (original + 1, or original + something)
    let newDays = rentalToDuplicate.days + 1;
    const existingDays = formData.rentalPrices.map((rp: ProductRentalPrice) => rp.days);
    
    while (existingDays.includes(newDays)) {
      newDays++;
    }
    
    const newRentalOption: ProductRentalPrice = {
      days: newDays,
      price: rentalToDuplicate.price,
      isActive: rentalToDuplicate.isActive
    };
    
    setFormData((prev: any) => ({
      ...prev,
      rentalPrices: [...prev.rentalPrices, newRentalOption]
    }));
  };

  // ============ IMAGE HANDLING ============

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: 'Only JPEG, PNG, Avif and WebP images are allowed'
      }));
      return;
    }
    
    if (files.some(file => file.size > 10 * 1024 * 1024)) {
      setErrors(prev => ({
        ...prev,
        images: 'Image size should be less than 10MB'
      }));
      return;
    }
    
    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers).then(newImages => {
      setFormData((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
      setImagePreviews(prev => [...prev, ...newImages]);
      
      if (errors.images) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: (prev.images || []).filter((_: any, i: number) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      const submitFormData = new FormData();
      
      // Add all form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('slug', formData.slug);
      submitFormData.append('category', formData.category);
      submitFormData.append('description', formData.description);
      submitFormData.append('color', formData.color);
      submitFormData.append('colorCode', formData.colorCode);
      submitFormData.append('price', formData.price.toString());
      
      if (formData.compareAtPrice) {
        submitFormData.append('compareAtPrice', formData.compareAtPrice.toString());
      }
      
      submitFormData.append('sizes', JSON.stringify(formData.sizes));
      submitFormData.append('features', JSON.stringify(formData.features));
      submitFormData.append('rentalPrices', JSON.stringify(formData.rentalPrices));
      
      // Boolean fields
      submitFormData.append('isAvailable', formData.isAvailable.toString());
      submitFormData.append('isFeatured', formData.isFeatured.toString());
      submitFormData.append('isNewArrival', formData.isNewArrival.toString());
      submitFormData.append('isPublished', formData.isPublished.toString());
      
      // Handle images - convert base64 to files
      const existingImages: string[] = [];
      const newImageFiles: File[] = [];
      
      for (const image of formData.images) {
        if (image.startsWith('data:')) {
          // Convert base64 to file
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], `product-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
          newImageFiles.push(file);
        } else {
          existingImages.push(image);
        }
      }
      
      // Add existing images to keep
      if (existingImages.length > 0) {
        submitFormData.append('keepImages', existingImages.join(','));
      }
      
      // Add new image files
      newImageFiles.forEach(file => {
        submitFormData.append('images', file);
      });
      
      await onSubmit(submitFormData);
      
      if (!editingProduct) {
        resetForm();
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit product');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h4 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h4>
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {Object.entries(errors).slice(0, 3).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
              {Object.keys(errors).length > 3 && (
                <li>...and {Object.keys(errors).length - 3} more errors</li>
              )}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ============ SECTION 1: BASIC INFORMATION ============ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Basic Information</h3>
              </div>
              {expandedSection === 'basic' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'basic' && (
              <div className="p-4 space-y-6">
                {/* Product Images */}
                <div id="images">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images * <span className="text-gray-500 text-xs ml-2">(Multiple images allowed)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {imagePreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isLoading}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                    <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 hover:border-blue-500 transition-colors h-32">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                  {errors.images && (
                    <p className="text-sm text-red-600 mt-1">{errors.images}</p>
                  )}
                  <p className="text-xs text-gray-500">Upload up to 10 images. First image will be the main product image.</p>
                </div>

                {/* Product Name and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div id="name">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleBasicChange('name', e.target.value)}
                      placeholder="Enter product name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div id="slug">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Slug *
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleBasicChange('slug', e.target.value)}
                        placeholder="product-slug"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.slug ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                    )}
                  </div>
                </div>

                {/* Category and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div id="category">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleBasicChange('category', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div id="description">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleBasicChange('description', e.target.value)}
                      placeholder="Enter product description"
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============ SECTION 2: COLOR & PRICING ============ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('pricing')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Color & Pricing</h3>
              </div>
              {expandedSection === 'pricing' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'pricing' && (
              <div className="p-4 space-y-6">
                {/* Single Color Selection */}
                <div id="color">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Color * <span className="text-gray-500 text-xs ml-2">(Single color only)</span>
                  </label>
                  
                  {!customColorInput ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.code}
                            type="button"
                            onClick={() => handleColorSelect(color.name, color.code)}
                            className={`flex flex-col items-center p-3 border rounded-lg transition-all ${
                              formData.color === color.name
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-full border border-gray-200 mb-1"
                              style={{ backgroundColor: color.code }}
                            />
                            <span className="text-xs font-medium text-gray-700">{color.name}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomColorInput(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Custom Color
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Color Name</label>
                          <input
                            type="text"
                            value={formData.color}
                            onChange={(e) => handleCustomColor(e.target.value, formData.colorCode)}
                            placeholder="e.g., Midnight Blue"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Color Code</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={formData.colorCode}
                              onChange={(e) => handleCustomColor(formData.color, e.target.value)}
                              className="w-10 h-10 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.colorCode}
                              onChange={(e) => handleCustomColor(formData.color, e.target.value)}
                              placeholder="#000000"
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setCustomColorInput(false)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.color?.trim()) {
                              setCustomColorInput(false);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          disabled={!formData.color?.trim()}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.color && (
                    <p className="text-sm text-red-600 mt-2">{errors.color}</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div id="price">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Price ($) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => handleBasicChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div id="compareAtPrice">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compare at Price ($) <span className="text-gray-500 text-xs ml-2">(Original price for discount)</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.compareAtPrice || ''}
                        onChange={(e) => handleBasicChange('compareAtPrice', parseFloat(e.target.value) || undefined)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.compareAtPrice ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {formData.compareAtPrice && formData.compareAtPrice > formData.price && (
                      <div className="mt-1 flex items-center">
                        <Percent className="w-4 h-4 text-green-600 mr-1" />
                        <p className="text-xs text-green-600">
                          {Math.round(((formData.compareAtPrice - formData.price) / formData.compareAtPrice) * 100 * 10) / 10}% discount
                        </p>
                      </div>
                    )}
                    {errors.compareAtPrice && (
                      <p className="text-sm text-red-600 mt-1">{errors.compareAtPrice}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============ SECTION 3: SIZES & AVAILABILITY ============ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('sizes')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Ruler className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Sizes & Availability</h3>
              </div>
              {expandedSection === 'sizes' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'sizes' && (
              <div className="p-4 space-y-6">
                {/* Size Selection - Multiple */}
                <div id="sizes">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Sizes * <span className="text-gray-500 text-xs ml-2">(Select multiple)</span>
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          formData.sizes?.includes(size)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Size Input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter custom size (e.g., 38, 42, One Size)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={Object.keys(customSizeInputs)[0] || ''}
                      onChange={(e) => setCustomSizeInputs({ [e.target.value]: true })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCustomSizeAdd((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="custom size"]') as HTMLInputElement;
                        if (input) {
                          handleCustomSizeAdd(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add Custom
                    </button>
                  </div>
                  
                  {/* Selected Sizes Display */}
                  {formData.sizes && formData.sizes.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">Selected Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.sizes.map((size: string) => (
                          <span
                            key={size}
                            className="inline-flex items-center px-3 py-1 bg-white border border-blue-200 rounded-full text-sm"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.sizes && (
                    <p className="text-sm text-red-600 mt-2">{errors.sizes}</p>
                  )}
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => handleBasicChange('isAvailable', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    disabled={isLoading}
                  />
                  <div>
                    <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                      Product is Available
                    </label>
                    <p className="text-xs text-gray-500">
                      Uncheck to mark product as unavailable
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============ SECTION 4: FEATURES ============ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('features')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-gray-900">Features</h3>
              </div>
              {expandedSection === 'features' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'features' && (
              <div className="p-4 space-y-4">
                <div id="features">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Features * <span className="text-gray-500 text-xs ml-2">(Multiple features allowed)</span>
                  </label>
                  
                  {/* Add Feature Input */}
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Enter a feature (e.g., Machine Washable, Breathable Fabric, etc.)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={!featureInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Features List */}
                  {formData.features && formData.features.length > 0 ? (
                    <div className="space-y-2">
                      {formData.features.map((feature: ProductFeature, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckSquare className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">{feature.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    ''
                  )}
                  
                  {errors.features && (
                    <p className="text-sm text-red-600 mt-2">{errors.features}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============ SECTION 5: RENTAL PRICES (DYNAMIC) ============ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('rental')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-gray-900">Rental Prices</h3>
              </div>
              {expandedSection === 'rental' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'rental' && (
              <div className="p-4 space-y-4">
                <div id="rentalPrices">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Rental Price Options * <span className="text-gray-500 text-xs ml-2">(Add multiple durations)</span>
                    </label>
                    
                    {/* Add Rental Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddRentalForm(!showAddRentalForm)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Rental Option
                    </button>
                  </div>
                  
                  {/* Add Rental Form */}
                  {showAddRentalForm && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Rental Option</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">Rental Days *</label>
                          <input
                            type="number"
                            value={newRentalDays}
                            onChange={(e) => setNewRentalDays(parseInt(e.target.value) || 0)}
                            placeholder="e.g., 3, 7, 14, 30"
                            min="1"
                            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">Rental Price ($) *</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="number"
                              value={newRentalPrice}
                              onChange={(e) => setNewRentalPrice(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddRentalForm(false)}
                          className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddRentalOption}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Rental Prices List */}
                  {formData.rentalPrices && formData.rentalPrices.length > 0 ? (
                    <div className="space-y-3">
                      {formData.rentalPrices.map((rental: ProductRentalPrice, index: number) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            rental.isActive 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Days */}
                              <div className="w-32">
                                <label className="block text-xs text-gray-500 mb-1">Days</label>
                                <input
                                  type="number"
                                  value={rental.days}
                                  onChange={(e) => handleUpdateRentalPrice(index, 'days', parseInt(e.target.value) || 0)}
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={isLoading}
                                />
                              </div>
                              
                              {/* Price */}
                              <div className="w-40">
                                <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                    type="number"
                                    value={rental.price}
                                    onChange={(e) => handleUpdateRentalPrice(index, 'price', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading || !rental.isActive}
                                  />
                                </div>
                              </div>
                              
                              {/* Active Toggle */}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={rental.isActive}
                                  onChange={(e) => handleUpdateRentalPrice(index, 'isActive', e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  disabled={isLoading}
                                />
                                <span className="text-xs text-gray-600">Active</span>
                              </div>
                              
                              {/* Price Comparison */}
                              {formData.price > 0 && rental.isActive && rental.price > 0 && (
                                <div className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                  <span className="text-gray-600">
                                    {Math.round((rental.price / formData.price) * 100)}% of base
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                type="button"
                                onClick={() => handleDuplicateRentalOption(index)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveRentalOption(index)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Error messages for this rental option */}
                          {errors[`rental_${index}_days`] && (
                            <p className="text-xs text-red-600 mt-2">{errors[`rental_${index}_days`]}</p>
                          )}
                          {errors[`rental_${index}_price`] && (
                            <p className="text-xs text-red-600 mt-2">{errors[`rental_${index}_price`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                  ''
                  )}
                  
                  {errors.rentalPrices && (
                    <p className="text-sm text-red-600 mt-2">{errors.rentalPrices}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============ SECTION 6: PUBLISH SETTINGS ============ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('publish')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-medium text-gray-900">Publish Settings</h3>
              </div>
              {expandedSection === 'publish' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'publish' && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Featured Checkbox */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleBasicChange('isFeatured', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                      disabled={isLoading}
                    />
                    <div>
                      <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        Featured Product
                      </label>
                      <p className="text-xs text-gray-500">
                        Show this product in featured sections
                      </p>
                    </div>
                  </div>

                  {/* New Arrival Checkbox */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={(e) => handleBasicChange('isNewArrival', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                      disabled={isLoading}
                    />
                    <div>
                      <label htmlFor="isNewArrival" className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 text-green-500 mr-1" />
                        New Arrival
                      </label>
                      <p className="text-xs text-gray-500">
                        Mark as new/recently added product
                      </p>
                    </div>
                  </div>

                  {/* Publish Checkbox */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => handleBasicChange('isPublished', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                      disabled={isLoading}
                    />
                    <div>
                      <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                        Publish Product
                      </label>
                      <p className="text-xs text-gray-500">
                        Make product visible to customers
                      </p>
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`mt-1 w-5 h-5 rounded-full ${
                      formData.isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Status: {formData.isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.isPublished 
                          ? formData.isAvailable 
                            ? 'Product is live and available for rent' 
                            : 'Product is live but marked as unavailable'
                          : 'Product is saved as draft'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}