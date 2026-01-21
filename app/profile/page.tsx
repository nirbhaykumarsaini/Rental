// app/profile/page.tsx (updated)
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  User, 
  Calendar,
  Globe,
  Briefcase,
  Edit2,
  Camera,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types/profile.types';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    bio: '',
    location: '',
    timezone: 'America/New_York (GMT-5)',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  useEffect(() => {
    setIsClient(true);
    if (user) {
      // Initialize profile data from user context
      setProfileData({
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || 'Administrator',
        department: user.department || 'Management',
        bio: user.bio || 'Experienced business administrator with focus on operational efficiency and team leadership.',
        location: user.location || 'New York, USA',
        timezone: user.timezone || 'America/New_York (GMT-5)',
        language: user.language || 'English',
        dateFormat: user.dateFormat || 'MM/DD/YYYY',
        currency: user.currency || 'USD',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context and localStorage
      const updatedUser = updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        jobTitle: profileData.jobTitle,
        department: profileData.department,
        bio: profileData.bio,
        location: profileData.location,
        timezone: profileData.timezone,
        language: profileData.language,
        dateFormat: profileData.dateFormat,
        currency: profileData.currency,
      });
      
      if (updatedUser) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original user data
    if (user) {
      setProfileData({
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || 'Administrator',
        department: user.department || 'Management',
        bio: user.bio || 'Experienced business administrator with focus on operational efficiency and team leadership.',
        location: user.location || 'New York, USA',
        timezone: user.timezone || 'America/New_York (GMT-5)',
        language: user.language || 'English',
        dateFormat: user.dateFormat || 'MM/DD/YYYY',
        currency: user.currency || 'USD',
      });
    }
  };

  // Format date to avoid hydration errors
  const formatDate = (date?: Date) => {
    if (!isClient || !date) return '';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-500">Manage your personal information and preferences</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.lastName}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="jobTitle"
                    value={profileData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.jobTitle}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.department}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio</h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {profileData.bio}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Avatar & Preferences */}
        <div className="space-y-8">
          {/* Profile Photo */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Photo</h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-4xl font-medium">
                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 text-center mb-4">
                JPG, GIF or PNG. Max size 2MB
              </p>
              {isEditing && (
                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                  Upload New Photo
                </button>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    Timezone
                  </div>
                </label>
                {isEditing ? (
                  <select
                    name="timezone"
                    value={profileData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                    <option value="America/Chicago (GMT-6)">America/Chicago (GMT-6)</option>
                    <option value="America/Denver (GMT-7)">America/Denver (GMT-7)</option>
                    <option value="America/Los_Angeles (GMT-8)">America/Los_Angeles (GMT-8)</option>
                    <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                    <option value="Europe/Paris (GMT+1)">Europe/Paris (GMT+1)</option>
                    <option value="Asia/Dubai (GMT+4)">Asia/Dubai (GMT+4)</option>
                    <option value="Asia/Singapore (GMT+8)">Asia/Singapore (GMT+8)</option>
                  </select>
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.timezone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Date Format
                  </div>
                </label>
                {isEditing ? (
                  <select
                    name="dateFormat"
                    value={profileData.dateFormat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.dateFormat}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    Currency
                  </div>
                </label>
                {isEditing ? (
                  <select
                    name="currency"
                    value={profileData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.currency}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {isClient ? formatDate(user.createdAt) : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {isClient && user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Role</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded capitalize">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {user.isVerified ? 'Active' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}