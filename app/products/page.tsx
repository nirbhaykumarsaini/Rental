// D:\B2B\app\products\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductList } from '@/app/components/products/ProductList';
import { AddProduct } from '@/app/components/products/AddProduct';
import { Package, TrendingUp, Clock, Tag, DollarSign, AlertCircle, CheckCircle, XCircle, Star } from 'lucide-react';
import { Product, ProductStatistics } from '../types/product.types';
import productService from '@/app/services/productService';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProductStatistics>({
    totalProducts: 0,
    available: 0,
    unavailable: 0,
    featured: 0,
    newArrivals: 0,
    draftCount: 0,
    byCategory: {}
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
        limit: 100,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.status && response.data) {
        setProducts(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
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
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
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

  const handleSubmitProduct = async (formData: FormData) => {
    try {
      let response;
      
      if (editingProduct) {
        response = await productService.updateProduct(editingProduct._id, formData);
        if (response.status) {
          toast.success('Product updated successfully!');
        } else {
          toast.error(response.message || 'Failed to update product');
        }
      } else {
        response = await productService.createProduct(formData);
        if (response.status) {
          toast.success('Product created successfully!');
        } else {
          toast.error(response.message || 'Failed to create product');
        }
      }
      
      if (response.status) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('An error occurred while saving the product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await productService.deleteProduct(productId);
      
      if (response.status) {
        toast.success('Product deleted successfully!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      const response = await productService.toggleFeatured(productId, isFeatured);
      if (response.status) {
        toast.success(isFeatured ? 'Product marked as featured' : 'Product removed from featured');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleTogglePublish = async (productId: string, isPublished: boolean) => {
    try {
      const response = await productService.togglePublish(productId, isPublished);
      if (response.status) {
        toast.success(isPublished ? 'Product published' : 'Product unpublished');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const handleToggleAvailability = async (productId: string, isAvailable: boolean) => {
    try {
      const response = await productService.toggleAvailability(productId, isAvailable);
      if (response.status) {
        toast.success(isAvailable ? 'Product marked as available' : 'Product marked as unavailable');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog and rental inventory</p>
            </div>
          </div>
        </div>        

        {/* Category Breakdown */}
        {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              Products by Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.byCategory)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{category}</p>
                    <p className="text-lg font-semibold text-gray-900">{count}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Product List */}
        <ProductList
          products={products}
          loading={loading}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublish={handleTogglePublish}
          onToggleAvailability={handleToggleAvailability}
        />

        {/* Add/Edit Product Modal */}
        <AddProduct
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSubmitProduct}
          editingProduct={editingProduct}
          isLoading={false}
        />
      </div>
    </div>
  );
}