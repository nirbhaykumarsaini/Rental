// app/admin/sliders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Upload,
  Save,
  Grid,
  Star,
  AlertCircle
} from 'lucide-react';

interface Slider {
  _id: string;
  slider_images: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function SliderPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Selected slider states
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [previewSlider, setPreviewSlider] = useState<Slider | null>(null);
  
  // Form states
  const [newSlider, setNewSlider] = useState({
    slider_images: null as File | null,
    isActive: true
  });

  const [editForm, setEditForm] = useState({
    id: '',
    slider_images: null as File | null,
    isActive: true,
    currentImage: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/slider', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.status && data.data) {
        setSliders(data.data);
      } else {
        setError(data.message || 'Failed to fetch sliders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sliders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlider = async () => {
    if (!newSlider.slider_images) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('slider_images', newSlider.slider_images);
    formData.append('isActive', newSlider.isActive.toString());

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/slider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.status) {
        setSuccess('Slider created successfully');
        setShowCreateModal(false);
        setNewSlider({
          slider_images: null,
          isActive: true
        });
        setImagePreview(null);
        fetchSliders();
      } else {
        setError(data.message || 'Failed to create slider');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create slider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSlider = async () => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('id', editForm.id);
    
    if (editForm.slider_images) {
      formData.append('slider_images', editForm.slider_images);
    }
    
    formData.append('isActive', editForm.isActive.toString());

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/slider', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.status) {
        setSuccess('Slider updated successfully');
        setShowEditModal(false);
        setSelectedSlider(null);
        setEditForm({
          id: '',
          slider_images: null,
          isActive: true,
          currentImage: ''
        });
        setEditImagePreview(null);
        fetchSliders();
      } else {
        setError(data.message || 'Failed to update slider');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update slider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSlider = async (sliderId: string) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this slider?\n\nThis action cannot be undone.'
    );

    if (!isConfirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/v1/slider?id=${sliderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status) {
        setSuccess('Slider deleted successfully');
        fetchSliders();
      } else {
        setError(data.message || 'Failed to delete slider');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete slider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (slider: Slider) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('id', slider._id);
    formData.append('isActive', (!slider.isActive).toString());

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/slider', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.status) {
        setSuccess(`Slider ${!slider.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchSliders();
      } else {
        setError(data.message || 'Failed to update slider status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update slider status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSlider({ ...newSlider, slider_images: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, slider_images: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSlider = (slider: Slider) => {
    setSelectedSlider(slider);
    setEditForm({
      id: slider._id,
      slider_images: null,
      isActive: slider.isActive,
      currentImage: slider.slider_images
    });
    setEditImagePreview(null);
    setShowEditModal(true);
  };

  const handlePreviewSlider = (slider: Slider) => {
    setPreviewSlider(slider);
    setShowPreviewModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-row lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Slider</h1>
              <p className="text-gray-500">Manage homepage slider images</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Slider
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Sliders Grid */}
      {sliders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sliders Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first slider image.
          </p>
        
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider) => (
            <div
              key={slider._id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={slider.slider_images}
                  alt="Slider"
                  className="w-full h-full object-cover"
                />
                {slider.isActive && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                  </span>
                  <button
                    onClick={() => handleToggleStatus(slider)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                      slider.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {slider.isActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    <span>{slider.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreviewSlider(slider)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditSlider(slider)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlider(slider._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Slider</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slider Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setNewSlider({ ...newSlider, slider_images: null });
                            setImagePreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-gray-500">
                          Recommended: 1920x1080px, max 5MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="slider-upload"
                        />
                        <label
                          htmlFor="slider-upload"
                          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          Select Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Status</p>
                      <p className="text-sm text-gray-500">Show this slider on homepage</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewSlider({ ...newSlider, isActive: !newSlider.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      newSlider.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newSlider.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSlider}
                    disabled={isLoading || !newSlider.slider_images}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Create Slider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSlider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Edit className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Slider</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Image
                  </label>
                  <img
                    src={selectedSlider.slider_images}
                    alt="Current slider"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* New Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    {editImagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={editImagePreview}
                          alt="New preview"
                          className="mx-auto h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setEditForm({ ...editForm, slider_images: null });
                            setEditImagePreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove New Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="hidden"
                          id="edit-slider-upload"
                        />
                        <label
                          htmlFor="edit-slider-upload"
                          className="mt-2 inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      editForm.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {editForm.isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Status</p>
                      <p className="text-sm text-gray-500">
                        {editForm.isActive ? 'Currently active' : 'Currently inactive'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editForm.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSlider}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update Slider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewSlider && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 z-10"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="bg-white rounded-xl overflow-hidden">
              <img
                src={previewSlider.slider_images}
                alt="Slider preview"
                className="w-full max-h-[70vh] object-contain"
              />
              
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Slider Preview</h3>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(previewSlider.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    previewSlider.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {previewSlider.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleEditSlider(previewSlider);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Slider
                  </button>
                  <button
                    onClick={() => handleToggleStatus(previewSlider)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                      previewSlider.isActive
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {previewSlider.isActive ? (
                      <ToggleLeft className="w-4 h-4 mr-2" />
                    ) : (
                      <ToggleRight className="w-4 h-4 mr-2" />
                    )}
                    {previewSlider.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}