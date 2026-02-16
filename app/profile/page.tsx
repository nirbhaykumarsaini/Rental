// app/profile/page.tsx (updated)
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import {
  User,
  Loader2,
  Mail,
  Calendar,
  Shield,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types/profile.types';



export default function ProfilePage() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    _id: '',
    email: '',
    role: '',
    updatedAt: '',
  });

  useEffect(() => {
    setIsClient(true);
    if (user) {
      // Initialize profile data from user context
      // Convert dates to strings if they're Date objects, or use as-is if strings
      setProfileData({
        _id: user._id || '',
        email: user.email || '',
        role: user.role || 'admin',
        updatedAt: user.updatedAt 
          ? (typeof user.updatedAt === 'string' 
            ? user.updatedAt 
            : user.updatedAt 
              ? user.updatedAt
              : '')
          : ''
      });
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString || !isClient) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString || !isClient) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return 'N/A';
    }
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-gray-500">View and manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h2>

            <div className="space-y-6">
              {/* Email Field */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Email Address
                </label>
                <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-900 font-medium">
                  {profileData.email}
                </div>

              </div>              
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}