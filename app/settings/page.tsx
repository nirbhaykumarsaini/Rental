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
  const [activeTab, setActiveTab] = useState('security');
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

  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSecurityData(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled,
      }));
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

  const terminateSession = (sessionId: string) => {
    if (confirm('Are you sure you want to terminate this session?')) {
      setSecurityData(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session.id !== sessionId),
      }));
    }
  };

  const terminateAllSessions = () => {
    if (confirm('Are you sure you want to terminate all other sessions?')) {
      setSecurityData(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session.isCurrent),
      }));
    }
  };

  // Format date consistently to avoid hydration errors
  const formatDate = (date: Date) => {
    if (!isClient) return '';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format for consistency
    });
  };

  const formatShortDate = (date: Date) => {
    if (!isClient) return '';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'billing'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </button>
              
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Preferences</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Two-Factor Authentication */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={securityData.twoFactorEnabled}
                      onChange={handleToggleTwoFactor}
                      disabled={isLoading}
                      className="opacity-0 w-0 h-0"
                    />
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      securityData.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                    } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${
                      securityData.twoFactorEnabled ? 'before:translate-x-6' : ''
                    }`}></span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Why enable 2FA?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage devices that are logged into your account
                    </p>
                  </div>
                  <button
                    onClick={terminateAllSessions}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Terminate All Other Sessions
                  </button>
                </div>

                <div className="space-y-4">
                  {securityData.activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          session.isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Smartphone className={`w-5 h-5 ${
                            session.isCurrent ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{session.device}</h4>
                            {session.isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {session.browser} • {session.location} • Last active:{' '}
                            {isClient ? formatDate(session.lastActive) : 'Loading...'}
                          </p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Notifications */}
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
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      securityData.loginNotifications ? 'bg-green-500' : 'bg-gray-300'
                    } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${
                      securityData.loginNotifications ? 'before:translate-x-6' : ''
                    }`}></span>
                  </div>
                </div>
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
                        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                          value ? 'bg-green-500' : 'bg-gray-300'
                        } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${
                          value ? 'before:translate-x-6' : ''
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
                        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                          value ? 'bg-green-500' : 'bg-gray-300'
                        } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${
                          value ? 'before:translate-x-6' : ''
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
                        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                          value ? 'bg-green-500' : 'bg-gray-300'
                        } before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform ${
                          value ? 'before:translate-x-6' : ''
                        }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-8">
              {/* Current Plan */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`border rounded-xl p-6 ${
                    billingData.plan === 'free' 
                      ? 'border-blue-300 bg-blue-50' 
                      : billingData.plan === 'pro'
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Free</h3>
                      {billingData.plan === 'free' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">$0<span className="text-sm text-gray-500">/month</span></div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Up to 100 products
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Basic analytics
                      </li>
                      <li className="flex items-center">
                        <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                        Advanced reporting
                      </li>
                    </ul>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                      {billingData.plan === 'free' ? 'Current Plan' : 'Downgrade'}
                    </button>
                  </div>

                  <div className={`border rounded-xl p-6 ${
                    billingData.plan === 'pro' 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Pro</h3>
                      {billingData.plan === 'pro' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">$29<span className="text-sm text-gray-500">/month</span></div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Unlimited products
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Priority support
                      </li>
                    </ul>
                    <button className={`w-full px-4 py-2 font-medium rounded-lg ${
                      billingData.plan === 'pro'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'border border-purple-300 text-purple-700 hover:bg-purple-50'
                    }`}>
                      {billingData.plan === 'pro' ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>

                  <div className={`border rounded-xl p-6 ${
                    billingData.plan === 'enterprise' 
                      ? 'border-gray-800 bg-gray-50' 
                      : 'border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Enterprise</h3>
                      {billingData.plan === 'enterprise' && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">Custom</div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Everything in Pro
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Custom integrations
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Dedicated account manager
                      </li>
                    </ul>
                    <button className="w-full px-4 py-2 border border-gray-800 text-gray-900 font-medium rounded-lg hover:bg-gray-50">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        **** **** **** {billingData.paymentMethod.lastFour}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Expires {billingData.paymentMethod.expiryDate}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">
                    Update
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing History</h2>
                <div className="space-y-4">
                  {[
                    { id: 'INV-001', date: new Date('2024-01-15'), amount: '$29.00', status: 'Paid' },
                    { id: 'INV-002', date: new Date('2023-12-15'), amount: '$29.00', status: 'Paid' },
                    { id: 'INV-003', date: new Date('2023-11-15'), amount: '$29.00', status: 'Paid' },
                  ].map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{invoice.id}</h4>
                        <p className="text-sm text-gray-500">
                          {isClient ? formatShortDate(invoice.date) : 'Loading...'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span className="font-medium text-gray-900">{invoice.amount}</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {invoice.status}
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              {/* Data & Privacy */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Data & Privacy</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Export</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Request a copy of your personal data
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">
                      Request Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Delete Account</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-xl shadow border border-red-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Logout from all devices</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        This will log you out from all devices including this one
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">
                      Logout All
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="font-medium text-red-700">Deactivate Account</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Temporarily deactivate your account
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 text-sm">
                      Deactivate
                    </button>
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