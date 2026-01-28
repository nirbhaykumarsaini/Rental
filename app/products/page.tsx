'use client';

import { useState, useEffect } from 'react';
import { ProductList } from '@/app/components/products/ProductList';
import { AddProduct } from '@/app/components/products/AddProduct';
import { Package } from 'lucide-react';
import { Product } from '../types/product.types';
import productService from '@/app/services/productService';

// Statistics interface
interface ProductStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventory: number;
}

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalInventory: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch products and statistics
  useEffect(() => {
    fetchProducts();
    fetchStatistics();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        limit: 50,
        page: 1
      });
      
      if (response.status && response.data) {
        setProducts(response.data);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await productService.getStatistics();
      if (response.status && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleSubmitProduct = async (productData: Product) => {
    try {
      // Convert Product to FormData for upload
      const formData = await convertProductToFormData(productData);
      
      let response;
      
      if (editingProduct) {
        // Update existing product
        response = await productService.updateProduct(editingProduct._id, formData);
        if (response.status) {
          console.log('Product updated successfully:', response.data);
          alert('Product updated successfully!');
        } else {
          alert(`Failed to update product: ${response.message}`);
        }
      } else {
        // Create new product
        response = await productService.createProduct(formData);
        if (response.status) {
          console.log('Product created successfully:', response.data);
          alert('Product created successfully!');
        } else {
          alert(`Failed to create product: ${response.message}`);
        }
      }
      
      if (response.status) {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1); // Trigger refresh
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('An error occurred while saving the product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await productService.deleteProduct(productId);
      
      if (response.status) {
        alert('Product deleted successfully!');
        setRefreshTrigger(prev => prev + 1); // Trigger refresh
      } else {
        alert(`Failed to delete product: ${response.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Helper function to convert Product to FormData
  const convertProductToFormData = async (productData: Product): Promise<FormData> => {
    const formData = new FormData();
    
    // Basic fields
    formData.append('name', productData.name);
    formData.append('slug', productData.slug);
    formData.append('category', productData.category);
    formData.append('description', productData.description);
    formData.append('minOrderQuantity', productData.minOrderQuantity.toString());
    formData.append('hasVariants', productData.hasVariants.toString());
    formData.append('isFeatured', productData.isFeatured.toString());
    formData.append('isPublished', productData.isPublished.toString());
    
    if (productData.weight) {
      formData.append('weight', productData.weight.toString());
    }
    
    // Tags
    if (productData.tags && productData.tags.length > 0) {
      formData.append('tags', productData.tags.join(','));
    }
    
    // Dimensions
    if (productData.dimensions) {
      formData.append('dimensions.length', productData.dimensions.length.toString());
      formData.append('dimensions.width', productData.dimensions.width.toString());
      formData.append('dimensions.height', productData.dimensions.height.toString());
    }
    
    // Handle main images
    if (productData.images && productData.images.length > 0) {
      // For new images (base64), convert to File objects
      const imageFiles = await Promise.all(
        productData.images.map(async (image, index) => {
          if (image.startsWith('data:')) {
            // Base64 image - convert to File
            const response = await fetch(image);
            const blob = await response.blob();
            return new File([blob], `product-image-${index}.jpg`, { type: 'image/jpeg' });
          }
          // Existing image URL - keep it
          return image;
        })
      );
      
      // Separate existing images and new files
      const existingImages: string[] = [];
      const newFiles: File[] = [];
      
      imageFiles.forEach(item => {
        if (typeof item === 'string') {
          existingImages.push(item);
        } else {
          newFiles.push(item);
        }
      });
      
      // Append existing images to keep
      if (existingImages.length > 0) {
        formData.append('keepImages', existingImages.join(','));
      }
      
      // Append new image files
      newFiles.forEach(file => {
        formData.append('mainImages', file);
      });
    }
    
    // Handle variants if product has variants
    if (productData.hasVariants && productData.variants.length > 0) {
      // Add variants as JSON
      const variantsJson = JSON.stringify(productData.variants.map(variant => ({
        color: variant.color,
        colorCode: variant.colorCode,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        sizes: variant.sizes,
        isActive: variant.isActive,
        images: variant.images // We'll handle the actual file upload separately
      })));
      
      formData.append('variants', variantsJson);
      
      // Handle variant images
      for (let i = 0; i < productData.variants.length; i++) {
        const variant = productData.variants[i];
        
        if (variant.images && variant.images.length > 0) {
          // Separate existing and new images for this variant
          const existingVariantImages: string[] = [];
          const newVariantFiles: File[] = [];
          
          await Promise.all(
            variant.images.map(async (image, index) => {
              if (image.startsWith('data:')) {
                // Base64 image - convert to File
                const response = await fetch(image);
                const blob = await response.blob();
                const file = new File([blob], `variant-${i}-image-${index}.jpg`, { 
                  type: 'image/jpeg' 
                });
                newVariantFiles.push(file);
              } else {
                existingVariantImages.push(image);
              }
            })
          );
          
          // Append existing variant images to keep
          if (existingVariantImages.length > 0) {
            formData.append(`keepVariantImages_${i}`, existingVariantImages.join(','));
          }
          
          // Append new variant image files
          newVariantFiles.forEach(file => {
            formData.append(`variantImages_${i}`, file);
          });
        }
      }
    }
    
    return formData;
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

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

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-800 hover:text-red-900"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.inStock}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStock}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.outOfStock}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-full">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Component */}
      <ProductList 
        products={products}
        loading={loading}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
      />

      {/* Add/Edit Product Modal */}
      <AddProduct
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        isLoading={false} // You can add loading state for form submission
      />
    </div>
  );
}