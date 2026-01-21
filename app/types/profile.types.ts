// app/types/profile.types.ts
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  currency?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  passwordLastChanged: Date;
  activeSessions: {
    id: string;
    device: string;
    browser: string;
    location: string;
    ip: string;
    lastActive: Date;
    isCurrent: boolean;
  }[];
}

export interface NotificationPreferences {
  email: {
    orders: boolean;
    products: boolean;
    customers: boolean;
    marketing: boolean;
    security: boolean;
  };
  push: {
    orders: boolean;
    products: boolean;
    customers: boolean;
  };
  sms: {
    orders: boolean;
    security: boolean;
  };
}

export interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  nextBillingDate?: Date;
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank_transfer';
    lastFour?: string;
    expiryDate?: string;
    cardBrand?: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}