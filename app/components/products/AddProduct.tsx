'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Package,
  DollarSign,
  Hash,
  FileText,
  Box,
  Tag,
  Layers,
  Palette,
  Ruler,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Globe,
  Minus,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Product, ProductVariant, ProductVariantSize } from '@/app/types/product.types';
import { Category } from '@/app/types/category.types';
import toast from 'react-hot-toast';
import categoryService from '@/app/services/categoryService';

interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Product) => void;
  editingProduct?: Product | null;
  isLoading?: boolean;
}

const defaultSize: Omit<ProductVariantSize, '_id'> = {
  size: '',
  inventory: 0,
  sku: '',
  isActive: true
};

const defaultVariant: Omit<ProductVariant, '_id'> = {
  color: '',
  colorCode: '#000000',
  images: [],
  price: 0,
  sizes: [{
    ...defaultSize,
    size: 'Default'
  }],
  isActive: true
};

const defaultProduct: Omit<Product, '_id' | 'createdAt' | 'updatedAt'> = {
  slug: '',
  name: '',
  category: 'Electronics',
  minOrderQuantity: 1,
  description: '',
  images: [],
  tags: [],
  variants: [],
  hasVariants: false,
  isFeatured: false,
  isPublished: false,
  status: 'draft'
};

export function AddProduct({ isOpen, onClose, onSubmit, editingProduct, isLoading = false }: AddProductProps) {
  const [formData, setFormData] = useState<any>(defaultProduct);
  const [activeTab, setActiveTab] = useState<'basic' | 'variants'>('basic');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
console.log(categories)

  // State for custom input visibility
  const [customColorInputs, setCustomColorInputs] = useState<{ [key: number]: boolean }>({});
  const [customSizeInputs, setCustomSizeInputs] = useState<{ [key: number]: { [sizeIndex: number]: boolean } }>({});

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
    { name: 'Brown', code: '#A52A2A' }
  ];

  // Predefined size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Initialize form data when editing
  useEffect(() => {
    if (editingProduct) {
      // Remove MongoDB _id fields from nested objects when editing
      const cleanProduct = {
        ...editingProduct,
        variants: editingProduct.variants?.map(variant => ({
          color: variant.color,
          colorCode: variant.colorCode,
          images: variant.images || [],
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          sizes: variant.sizes?.map(size => ({
            size: size.size,
            inventory: size.inventory,
            sku: size.sku,
            isActive: size.isActive
          })) || [],
          isActive: variant.isActive
        })) || []
      };
      setFormData(cleanProduct);
      setImagePreviews(editingProduct.images || []);
      // Reset errors
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
      } else {
        toast.error(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset form to default
  const resetForm = () => {
    setFormData(defaultProduct);
    setImagePreviews([]);
    setActiveTab('basic');
    setExpandedVariant(null);
    setCustomColorInputs({});
    setCustomSizeInputs({});
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Product slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.minOrderQuantity < 1) {
      newErrors.minOrderQuantity = 'Minimum order quantity must be at least 1';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (imagePreviews.length === 0 && formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    // Variant validation
    if (formData.hasVariants) {
      if (formData.variants.length === 0) {
        newErrors.variants = 'At least one color variant is required when using variants';
      }

      formData.variants.forEach((variant: any, variantIndex: number) => {
        if (!variant.color?.trim()) {
          newErrors[`variant_${variantIndex}_color`] = 'Color name is required';
        }

        if (variant.price <= 0) {
          newErrors[`variant_${variantIndex}_price`] = 'Price must be greater than 0';
        }

        if (variant.sizes?.length === 0) {
          newErrors[`variant_${variantIndex}_sizes`] = 'At least one size is required';
        }

        variant.sizes?.forEach((size: any, sizeIndex: number) => {
          if (!size.size?.trim()) {
            newErrors[`variant_${variantIndex}_size_${sizeIndex}`] = 'Size is required';
          }

          if (!size.sku?.trim()) {
            newErrors[`variant_${variantIndex}_sku_${sizeIndex}`] = 'SKU is required';
          }

          if (size.inventory < 0) {
            newErrors[`variant_${variantIndex}_inventory_${sizeIndex}`] = 'Inventory cannot be negative';
          }
        });
      });
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

  const generateSKU = (productName: string, color?: string, size?: string) => {
    const productCode = productName.substring(0, 3).toUpperCase();
    const colorCode = color ? color.substring(0, 2).toUpperCase() : '';
    const sizeCode = size ? size.substring(0, 2).toUpperCase() : '';
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    return `${productCode}-${colorCode}${sizeCode}-${randomNum}`;
  };

  const handleBasicChange = (field: keyof Product, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };

      if (field === 'name' && !editingProduct) {
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

  const handleVariantChange = (variantIndex: number, field: keyof ProductVariant, value: any) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[variantIndex];

      // Clear variant errors
      if (errors[`variant_${variantIndex}_${field}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`variant_${variantIndex}_${field}`];
          return newErrors;
        });
      }

      // Handle custom color input
      if (field === 'color' && value === 'custom') {
        // Show custom color input
        setCustomColorInputs(prev => ({
          ...prev,
          [variantIndex]: true
        }));
        // Set temporary value for custom color
        updatedVariants[variantIndex] = {
          ...variant,
          color: ''
        };
      } else if (field === 'color') {
        // Hide custom color input if it was shown
        setCustomColorInputs(prev => ({
          ...prev,
          [variantIndex]: false
        }));

        updatedVariants[variantIndex] = {
          ...variant,
          [field]: value
        };

        // Update color code and regenerate SKUs
        const selectedColor = colorOptions.find(c => c.name === value);
        if (selectedColor) {
          updatedVariants[variantIndex].colorCode = selectedColor.code;
        }

        // Update SKUs for all sizes in this variant
        if (variant.sizes) {
          updatedVariants[variantIndex].sizes = variant.sizes.map((size: any) => ({
            ...size,
            sku: generateSKU(formData.name, value, size.size)
          }));
        }
      } else {
        updatedVariants[variantIndex] = {
          ...variant,
          [field]: value
        };
      }

      return { ...prev, variants: updatedVariants };
    });
  };

  // Handle custom color input
  const handleCustomColorChange = (variantIndex: number, value: string, colorCode: string) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[variantIndex];

      updatedVariants[variantIndex] = {
        ...variant,
        color: value,
        colorCode: colorCode || '#000000'
      };

      // Update SKUs for all sizes with new color name
      if (variant.sizes) {
        updatedVariants[variantIndex].sizes = variant.sizes.map((size: any) => ({
          ...size,
          sku: generateSKU(formData.name, value, size.size)
        }));
      }

      return { ...prev, variants: updatedVariants };
    });
  };

  const handleSizeChange = (variantIndex: number, sizeIndex: number, field: keyof ProductVariantSize, value: any) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[variantIndex];
      const updatedSizes = [...variant.sizes];

      // Clear size errors
      if (errors[`variant_${variantIndex}_${field}_${sizeIndex}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`variant_${variantIndex}_${field}_${sizeIndex}`];
          return newErrors;
        });
      }

      // Handle custom size input
      if (field === 'size' && value === 'custom') {
        // Show custom size input
        setCustomSizeInputs(prev => ({
          ...prev,
          [variantIndex]: {
            ...prev[variantIndex],
            [sizeIndex]: true
          }
        }));
        // Set temporary empty value for custom size
        updatedSizes[sizeIndex] = {
          ...updatedSizes[sizeIndex],
          size: ''
        };
      } else if (field === 'size') {
        // Hide custom size input if it was shown
        setCustomSizeInputs(prev => ({
          ...prev,
          [variantIndex]: {
            ...prev[variantIndex],
            [sizeIndex]: false
          }
        }));

        updatedSizes[sizeIndex] = {
          ...updatedSizes[sizeIndex],
          [field]: value
        };

        // Auto-generate SKU when size changes
        updatedSizes[sizeIndex].sku = generateSKU(
          formData.name,
          variant.color,
          value
        );
      } else {
        updatedSizes[sizeIndex] = {
          ...updatedSizes[sizeIndex],
          [field]: value
        };
      }

      updatedVariants[variantIndex] = {
        ...variant,
        sizes: updatedSizes
      };

      return { ...prev, variants: updatedVariants };
    });
  };

  // Handle custom size input
  const handleCustomSizeChange = (variantIndex: number, sizeIndex: number, value: string) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[variantIndex];
      const updatedSizes = [...variant.sizes];

      updatedSizes[sizeIndex] = {
        ...updatedSizes[sizeIndex],
        size: value,
        sku: generateSKU(formData.name, variant.color, value)
      };

      updatedVariants[variantIndex] = {
        ...variant,
        sizes: updatedSizes
      };

      return { ...prev, variants: updatedVariants };
    });
  };

  const addVariant = () => {
    const newVariant: Omit<ProductVariant, '_id'> = {
      ...defaultVariant,
      price: 0,
      sizes: sizeOptions.map((size) => ({
        size,
        inventory: 0,
        sku: generateSKU(formData.name, '', size),
        isActive: true
      }))
    };

    setFormData((prev: any) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
      hasVariants: true
    }));
  };

  const removeVariant = (variantIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== variantIndex)
    }));

    // Clean up custom inputs state
    setCustomColorInputs(prev => {
      const { [variantIndex]: _, ...rest } = prev;
      return rest;
    });

    setCustomSizeInputs(prev => {
      const { [variantIndex]: _, ...rest } = prev;
      return rest;
    });

    // Clean up errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`variant_${variantIndex}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const addSizeToVariant = (variantIndex: number) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[variantIndex];

      const newSize: Omit<ProductVariantSize, '_id'> = {
        size: '',
        inventory: 0,
        sku: generateSKU(formData.name, variant.color, 'NEW'),
        isActive: true
      };

      updatedVariants[variantIndex] = {
        ...variant,
        sizes: [...(variant.sizes || []), newSize]
      };

      return { ...prev, variants: updatedVariants };
    });
  };

  const removeSizeFromVariant = (variantIndex: number, sizeIndex: number) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[variantIndex];

      updatedVariants[variantIndex] = {
        ...variant,
        sizes: (variant.sizes || []).filter((_: any, i: number) => i !== sizeIndex)
      };

      return { ...prev, variants: updatedVariants };
    });

    // Clean up custom size input state
    setCustomSizeInputs(prev => ({
      ...prev,
      [variantIndex]: {
        ...prev[variantIndex],
        [sizeIndex]: false
      }
    }));

    // Clean up errors for this size
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`variant_${variantIndex}_size_${sizeIndex}`) ||
        key.startsWith(`variant_${variantIndex}_sku_${sizeIndex}`) ||
        key.startsWith(`variant_${variantIndex}_inventory_${sizeIndex}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const toggleVariantExpansion = (variantIndex: number) => {
    setExpandedVariant(expandedVariant === variantIndex ? null : variantIndex);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, variantIndex?: number) => {
    const files = Array.from(e.target.files || []);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: 'Only JPEG, PNG, and WebP images are allowed'
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

    if (variantIndex !== undefined) {
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newImages => {
        handleVariantChange(variantIndex, 'images', [
          ...(formData.variants[variantIndex]?.images || []),
          ...newImages
        ]);
      });
    } else {
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
          images: [...prev.images, ...newImages]
        }));
        setImagePreviews(prev => [...prev, ...newImages]);

        // Clear image error if any
        if (errors.images) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.images;
            return newErrors;
          });
        }
      });
    }
  };

  const removeImage = (index: number, variantIndex?: number) => {
    if (variantIndex !== undefined) {
      handleVariantChange(variantIndex, 'images',
        (formData.variants[variantIndex]?.images || []).filter((_: any, i: number) => i !== index)
      );
    } else {
      setFormData((prev: any) => ({
        ...prev,
        images: prev.images.filter((_: any, i: number) => i !== index)
      }));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotalStock = () => {
    if (!formData.hasVariants || formData.variants.length === 0) {
      return formData.minOrderQuantity;
    }

    return formData.variants.reduce((total: number, variant: any) => {
      const variantTotal = (variant.sizes || []).reduce((sum: number, size: any) => sum + (size.inventory || 0), 0);
      return total + variantTotal;
    }, 0);
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

    // Ensure formData has all required images
    const productToSubmit = {
      ...formData,
      images: formData.images.length > 0 ? formData.images : imagePreviews
    };

    onSubmit(productToSubmit as Product);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {editingProduct ? 'Update product information' : 'Add a new product to your inventory'}
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              disabled={isLoading}
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'basic'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                } disabled:opacity-50`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              disabled={isLoading}
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'variants'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                } disabled:opacity-50`}
            >
              Variants & Inventory
            </button>
          </nav>
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Product Images */}
              <div id="images">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
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
                  <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 hover:border-blue-500 transition-colors">
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
                <p className="text-xs text-gray-500">Upload up to 8 images. First image will be the main product image.</p>
              </div>

              {/* Product Name and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="name">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleBasicChange('name', e.target.value)}
                      placeholder="Enter product name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      disabled={isLoading}
                      required
                    />
                  </div>
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.slug ? 'border-red-300' : 'border-gray-300'
                        }`}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                  )}
                </div>
              </div>

              {/* Category and Min Order Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="category">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleBasicChange('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={isLoading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                  )}
                </div>

                <div id="minOrderQuantity">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Quantity *
                  </label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.minOrderQuantity}
                      onChange={(e) => handleBasicChange('minOrderQuantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      min="1"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.minOrderQuantity ? 'border-red-300' : 'border-gray-300'
                        }`}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.minOrderQuantity && (
                    <p className="text-sm text-red-600 mt-1">{errors.minOrderQuantity}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum quantity customers must purchase
                  </p>
                </div>
              </div>

              {/* Total Stock Summary */}
              {formData.hasVariants && formData.variants.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Total Stock Summary</h4>
                      <p className="text-sm text-blue-700">Calculated from all variants and sizes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">{calculateTotalStock()} units</p>
                      <p className="text-sm text-blue-700">
                        Across {formData.variants.length} colors and {' '}
                        {formData.variants.reduce((total: number, variant: any) => total + (variant.sizes?.length || 0), 0)} sizes
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div id="description">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleBasicChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => handleBasicChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    placeholder="Enter tags separated by commas"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Publish & Featured Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => handleBasicChange('isPublished', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="isPublished" className="text-sm text-gray-700">
                    Publish Product
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => handleBasicChange('isFeatured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="isFeatured" className="text-sm text-gray-700">
                    Mark as Featured
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {errors.variants && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.variants}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
                  <p className="text-sm text-gray-500">
                    Add colors with multiple sizes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Color Variant
                </button>
              </div>

              {/* Variant List */}
              {formData.variants.length > 0 ? (
                <div className="space-y-4">
                  {formData.variants.map((variant: any, variantIndex: number) => {
                    const showCustomColorInput = customColorInputs[variantIndex];

                    return (
                      <div key={variantIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => toggleVariantExpansion(variantIndex)}
                              disabled={isLoading}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              {expandedVariant === variantIndex ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: variant.colorCode }}
                              />
                              <h4 className="font-medium text-gray-900">
                                {variant.color || 'Unnamed Color'}
                                {showCustomColorInput && <span className="text-blue-600 ml-1">(Custom)</span>}
                              </h4>
                              <span className="text-sm text-gray-500">
                                ({variant.sizes?.length || 0} sizes)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => removeVariant(variantIndex)}
                              disabled={isLoading}
                              className="p-2 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Delete Color"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>

                        {expandedVariant === variantIndex && (
                          <div className="space-y-4 pl-8 border-l-2 border-gray-100">
                            {/* Color Selection with Custom Input */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div id={`variant_${variantIndex}_color`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Color Name *
                                </label>
                                {showCustomColorInput ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={variant.color}
                                      onChange={(e) => handleCustomColorChange(variantIndex, e.target.value, variant.colorCode)}
                                      placeholder="Enter custom color name"
                                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`variant_${variantIndex}_color`] ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                      disabled={isLoading}
                                    />
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="color"
                                        value={variant.colorCode}
                                        onChange={(e) => handleCustomColorChange(variantIndex, variant.color, e.target.value)}
                                        className="w-10 h-10 cursor-pointer"
                                        disabled={isLoading}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCustomColorInputs(prev => ({ ...prev, [variantIndex]: false }));
                                          handleVariantChange(variantIndex, 'color', '');
                                        }}
                                        disabled={isLoading}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <select
                                    value={variant.color}
                                    onChange={(e) => handleVariantChange(variantIndex, 'color', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`variant_${variantIndex}_color`] ? 'border-red-300' : 'border-gray-300'
                                      }`}
                                    disabled={isLoading}
                                  >
                                    <option value="">Select Color</option>
                                    {colorOptions.map(color => (
                                      <option key={color.code} value={color.name}>
                                        {color.name}
                                      </option>
                                    ))}
                                    <option value="custom">Custom Color...</option>
                                  </select>
                                )}
                                {errors[`variant_${variantIndex}_color`] && (
                                  <p className="text-sm text-red-600 mt-1">{errors[`variant_${variantIndex}_color`]}</p>
                                )}
                              </div>

                              {/* Color Preview */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Color Preview
                                </label>
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-10 h-10 rounded border"
                                    style={{ backgroundColor: variant.colorCode }}
                                  />
                                  <input
                                    type="color"
                                    value={variant.colorCode}
                                    onChange={(e) => handleVariantChange(variantIndex, 'colorCode', e.target.value)}
                                    className="w-10 h-10 cursor-pointer"
                                    disabled={isLoading}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Price for this Color */}
                            <div id={`variant_${variantIndex}_price`}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price for this Color *
                              </label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(variantIndex, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`variant_${variantIndex}_price`] ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                  disabled={isLoading}
                                />
                              </div>
                              {errors[`variant_${variantIndex}_price`] && (
                                <p className="text-sm text-red-600 mt-1">{errors[`variant_${variantIndex}_price`]}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                This price applies to all sizes of this color
                              </p>
                            </div>

                            {/* Variant Images */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color-specific Images
                              </label>
                              <div className="flex space-x-2 overflow-x-auto pb-2">
                                {variant.images?.map((img: string, imgIndex: number) => (
                                  <div key={imgIndex} className="relative flex-shrink-0">
                                    <img
                                      src={img}
                                      alt={`Color ${variant.color} - Image ${imgIndex + 1}`}
                                      className="w-20 h-20 object-cover rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(imgIndex, variantIndex)}
                                      disabled={isLoading}
                                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full disabled:opacity-50"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded w-20 h-20 flex items-center justify-center hover:border-blue-500 flex-shrink-0">
                                  <Upload className="w-5 h-5 text-gray-400" />
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, variantIndex)}
                                    className="hidden"
                                    disabled={isLoading}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Sizes Management with Custom Input */}
                            <div id={`variant_${variantIndex}_sizes`}>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h5 className="font-medium text-gray-900">Sizes & Inventory</h5>
                                  {errors[`variant_${variantIndex}_sizes`] && (
                                    <p className="text-sm text-red-600 mt-1">{errors[`variant_${variantIndex}_sizes`]}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addSizeToVariant(variantIndex)}
                                  disabled={isLoading}
                                  className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Size
                                </button>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full min-w-full divide-y divide-gray-200">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Size
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Inventory
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SKU
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {variant.sizes?.map((size: any, sizeIndex: number) => {
                                      const showCustomSizeInput = customSizeInputs[variantIndex]?.[sizeIndex];

                                      return (
                                        <tr key={sizeIndex}>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {showCustomSizeInput ? (
                                              <div className="space-y-2">
                                                <input
                                                  type="text"
                                                  value={size.size}
                                                  onChange={(e) => handleCustomSizeChange(variantIndex, sizeIndex, e.target.value)}
                                                  placeholder="Enter custom size (e.g., 38, 7, One Size)"
                                                  className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`variant_${variantIndex}_size_${sizeIndex}`] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                  disabled={isLoading}
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setCustomSizeInputs(prev => ({
                                                      ...prev,
                                                      [variantIndex]: {
                                                        ...prev[variantIndex],
                                                        [sizeIndex]: false
                                                      }
                                                    }));
                                                    handleSizeChange(variantIndex, sizeIndex, 'size', '');
                                                  }}
                                                  disabled={isLoading}
                                                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <select
                                                value={size.size}
                                                onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
                                                className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`variant_${variantIndex}_size_${sizeIndex}`] ? 'border-red-300' : 'border-gray-300'
                                                  }`}
                                                disabled={isLoading}
                                              >
                                                <option value="">Select Size</option>
                                                {sizeOptions.map(sizeOption => (
                                                  <option key={sizeOption} value={sizeOption}>
                                                    {sizeOption}
                                                  </option>
                                                ))}
                                                <option value="custom">Custom...</option>
                                              </select>
                                            )}
                                            {errors[`variant_${variantIndex}_size_${sizeIndex}`] && (
                                              <p className="text-xs text-red-600 mt-1">{errors[`variant_${variantIndex}_size_${sizeIndex}`]}</p>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="relative">
                                              <input
                                                type="number"
                                                value={size.inventory}
                                                onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'inventory', parseInt(e.target.value) || 0)}
                                                min="0"
                                                className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`variant_${variantIndex}_inventory_${sizeIndex}`] ? 'border-red-300' : 'border-gray-300'
                                                  }`}
                                                disabled={isLoading}
                                              />
                                              {errors[`variant_${variantIndex}_inventory_${sizeIndex}`] && (
                                                <p className="text-xs text-red-600 mt-1">{errors[`variant_${variantIndex}_inventory_${sizeIndex}`]}</p>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="relative">
                                              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                              <input
                                                type="text"
                                                value={size.sku}
                                                onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'sku', e.target.value)}
                                                className={`w-full pl-8 pr-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`variant_${variantIndex}_sku_${sizeIndex}`] ? 'border-red-300' : 'border-gray-300'
                                                  }`}
                                                disabled={isLoading}
                                              />
                                              {errors[`variant_${variantIndex}_sku_${sizeIndex}`] && (
                                                <p className="text-xs text-red-600 mt-1">{errors[`variant_${variantIndex}_sku_${sizeIndex}`]}</p>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <label className="inline-flex items-center">
                                              <input
                                                type="checkbox"
                                                checked={size.isActive}
                                                onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'isActive', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                disabled={isLoading}
                                              />
                                              <span className="ml-2 text-sm text-gray-700">
                                                Active
                                              </span>
                                            </label>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <button
                                              type="button"
                                              onClick={() => removeSizeFromVariant(variantIndex, sizeIndex)}
                                              disabled={isLoading}
                                              className="p-1 hover:bg-red-50 rounded text-red-600 disabled:opacity-50"
                                              title="Remove Size"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Size Summary */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">
                                      Total Inventory for {variant.color}:{' '}
                                      <span className="font-bold">
                                        {(variant.sizes || []).reduce((sum: number, size: any) => sum + (size.inventory || 0), 0)} units
                                      </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(variant.sizes || []).filter((s: any) => s.isActive).length} active sizes
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">
                                      Price: <span className="font-bold">₹{variant.price.toFixed(2)}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Variants Added</h4>
                </div>
              )}

              {/* Use variants toggle */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useVariants"
                    checked={formData.hasVariants}
                    onChange={(e) => handleBasicChange('hasVariants', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="useVariants" className="ml-3 text-sm text-gray-700">
                    This product has multiple colors and sizes
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  When enabled, you can add different colors with multiple sizes. Select "Custom Color..."
                  or "Custom..." size options to enter custom values.
                </p>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${activeTab === 'basic'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
              >
                Basic
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${activeTab === 'variants'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
              >
                Variants
              </button>
            </div>

            <div className="flex space-x-4">
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
          </div>
        </form>
      </div>
    </div>
  );
}