// app/settings/page.tsx (fixed)
'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Bell,
  CreditCard,
  Lock,
  Key,
  Smartphone,
  Globe,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { SecuritySettings, NotificationPreferences, BillingInfo } from '../types/profile.types';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Security Settings
  const [securityData, setSecurityData] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    passwordLastChanged: new Date('2024-01-01'),
    activeSessions: [
      {
        id: '1',
        device: 'MacBook Pro',
        browser: 'Chrome 120',
        location: 'New York, USA',
        ip: '192.168.1.100',
        lastActive: new Date('2024-01-23T14:30:00'),
        isCurrent: true,
      },
      {
        id: '2',
        device: 'iPhone 14',
        browser: 'Safari 17',
        location: 'New York, USA',
        ip: '192.168.1.101',
        lastActive: new Date('2024-01-22T10:15:00'),
        isCurrent: false,
      },
      {
        id: '3',
        device: 'Windows PC',
        browser: 'Firefox 121',
        location: 'Chicago, USA',
        ip: '192.168.1.200',
        lastActive: new Date('2024-01-20T09:45:00'),
        isCurrent: false,
      },
    ],
  });

  // Notification Preferences
  const [notificationData, setNotificationData] = useState<NotificationPreferences>({
    email: {
      orders: true,
      products: true,
      customers: true,
      marketing: false,
      security: true,
    },
    push: {
      orders: true,
      products: false,
      customers: true,
    },
    sms: {
      orders: false,
      security: true,
    },
  });

  // Billing Info
  const [billingData, setBillingData] = useState<BillingInfo>({
    plan: 'pro',
    status: 'active',
    nextBillingDate: new Date('2024-02-01'),
    paymentMethod: {
      type: 'card',
      lastFour: '4242',
      expiryDate: '12/25',
      cardBrand: 'visa',
    },
    billingAddress: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  });

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      alert('Password updated successfully!');
    } catch (error) {
      alert('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (category: keyof NotificationPreferences, key: string) => {
    setNotificationData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-500">Manage your account security, notifications, and billing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Security Tab */}
          {activeTab === 'password' && (
            <div className="space-y-8">
              {/* Change Password */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              {/* Email Notifications */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(notificationData.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive email notifications for {key.toLowerCase()} activities
                        </p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationToggle('email', key)}
                          className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                          } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${value ? 'before:translate-x-6' : ''
                          }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(notificationData.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive push notifications for {key.toLowerCase()} activities
                        </p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationToggle('push', key)}
                          className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                          } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${value ? 'before:translate-x-6' : ''
                          }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(notificationData.sms).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive SMS notifications for {key.toLowerCase()} activities
                        </p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationToggle('sms', key)}
                          className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                          } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${value ? 'before:translate-x-6' : ''
                          }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Login Notifications</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Receive email notifications for new logins
                </p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={securityData.loginNotifications}
                  onChange={() => setSecurityData(prev => ({
                    ...prev,
                    loginNotifications: !prev.loginNotifications
                  }))}
                  className="opacity-0 w-0 h-0"
                />
                <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${securityData.loginNotifications ? 'bg-green-500' : 'bg-gray-300'
                  } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${securityData.loginNotifications ? 'before:translate-x-6' : ''
                  }`}></span>
              </div>
            </div>
          </div>
            </div>
          )}

          

        </div>
      </div>
    </div>
  );
}