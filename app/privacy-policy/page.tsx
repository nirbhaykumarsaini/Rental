// app/admin/privacy-policy/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Download,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  ChevronRight,
  Users,
  Lock,
  Globe,
  Mail
} from 'lucide-react';

interface PolicySection {
  title: string;
  content: string;
  order: number;
}

interface PrivacyPolicyData {
  _id: string;
  title: string;
  content: string;
  version: string;
  summary: string;
  effectiveDate: string;
  isActive: boolean;
  sections: PolicySection[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPrivacyPolicyPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<PrivacyPolicyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Popup states
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PrivacyPolicyData | null>(null);
  
  // Edit popup state
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PrivacyPolicyData | null>(null);
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New policy form
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    content: '',
    version: '',
    summary: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    summary: '',
    effectiveDate: ''
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/privacy-policy?includeHistory=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.status && data.data) {
        const allPolicies = [
          ...(data.data.active ? [data.data.active] : []),
          ...(data.data.history || [])
        ];
        setPolicies(allPolicies);
      } else {
        setError(data.message || 'Failed to fetch policies');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    if (!newPolicy.title || !newPolicy.content || !newPolicy.version) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/privacy-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPolicy)
      });

      const data = await response.json();

      if (data.status) {
        setSuccess('Privacy policy created successfully');
        setShowCreateModal(false);
        setNewPolicy({
          title: '',
          content: '',
          version: '',
          summary: '',
          effectiveDate: new Date().toISOString().split('T')[0]
        });
        fetchPolicies();
      } else {
        setError(data.message || 'Failed to create policy');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!editingPolicy?._id) {
      setError('No policy selected for editing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/privacy-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingPolicy._id,
          ...editForm
        })
      });

      const data = await response.json();

      if (data.status) {
        setSuccess('Privacy policy updated successfully');
        setShowEditPopup(false);
        setEditingPolicy(null);
        fetchPolicies();
      } else {
        setError(data.message || 'Failed to update policy');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string, policyVersion: string) => {
    // Use browser's confirm dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete privacy policy version ${policyVersion}?\n\nThis action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/v1/privacy-policy?id=${policyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status) {
        setSuccess('Privacy policy deleted successfully');
        fetchPolicies();
      } else {
        setError(data.message || 'Failed to delete policy');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPolicy = (policy: PrivacyPolicyData) => {
    setSelectedPolicy(policy);
    setShowDetailsPopup(true);
  };

  const handleEditPolicy = (policy: PrivacyPolicyData) => {
    setEditingPolicy(policy);
    setEditForm({
      title: policy.title,
      content: policy.content,
      summary: policy.summary || '',
      effectiveDate: policy.effectiveDate.split('T')[0]
    });
    setShowEditPopup(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPolicy(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyPolicy = (policy: PrivacyPolicyData) => {
    const policyText = `${policy.title}\n\nVersion: ${policy.version}\nEffective: ${formatDate(policy.effectiveDate)}\n\n${policy.content}`;
    
    navigator.clipboard.writeText(policyText)
      .then(() => {
        setSuccess(`Policy version ${policy.version} copied to clipboard!`);
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(() => {
        setError('Failed to copy policy');
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading privacy policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-row lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Privacy Policy Management</h1>
              <p className="text-gray-500">Create and manage privacy policy versions</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Policy
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

      {/* Policies Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${policy.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FileText className={`w-4 h-4 ${policy.isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{policy.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{policy.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{policy.summary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(policy.effectiveDate)}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(policy.updatedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      policy.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPolicy(policy)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Policy Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPolicy(policy)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit Policy"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!policy.isActive && (
                        <button
                          onClick={() => handleDeletePolicy(policy._id, policy.version)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Privacy Policy</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newPolicy.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Privacy Policy 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version (Semantic) *
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={newPolicy.version}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.1.0"
                  />
                  <p className="mt-1 text-sm text-gray-500">Follow semantic versioning: major.minor.patch</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={newPolicy.effectiveDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={newPolicy.summary}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this policy version..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Content *
                  </label>
                  <textarea
                    name="content"
                    value={newPolicy.content}
                    onChange={handleInputChange}
                    rows={10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter the full privacy policy content here..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePolicy}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Create Policy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Details Popup */}
      {showDetailsPopup && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Policy Details</h2>
                    <p className="text-gray-500">Version {selectedPolicy.version}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  
                  <button
                    onClick={() => setShowDetailsPopup(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Policy Header */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">{selectedPolicy.title}</h3>
                  <p className="text-blue-700">{selectedPolicy.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Effective Date</span>
                      </div>
                      <p className="text-gray-900 font-medium">{formatDate(selectedPolicy.effectiveDate)}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Last Updated</span>
                      </div>
                      <p className="text-gray-900 font-medium">{formatDate(selectedPolicy.updatedAt)}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Shield className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Status</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedPolicy.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPolicy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policy Content */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Policy Content</h4>
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedPolicy.content}
                    </div>
                  </div>
                </div>
                

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsPopup(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsPopup(false);
                      handleEditPolicy(selectedPolicy);
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Policy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Popup */}
      {showEditPopup && editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Edit className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Edit Privacy Policy</h2>
                    <p className="text-gray-500">Version {editingPolicy.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Version Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Version</p>
                      <p className="font-medium text-gray-900">{editingPolicy.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        editingPolicy.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {editingPolicy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={editForm.effectiveDate}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={editForm.summary}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Content *
                  </label>
                  <textarea
                    name="content"
                    value={editForm.content}
                    onChange={handleEditInputChange}
                    rows={10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowEditPopup(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePolicy}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update Policy
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