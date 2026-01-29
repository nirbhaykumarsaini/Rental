// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user and token on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('admin_user');
      const storedToken = localStorage.getItem('admin_token');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    setUser(null);
    setAuthToken(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setUser(null);
    setAuthToken(null);
    
    try {
      const response = await fetch('/api/v1/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.status && data.data) {
        const { token, user: userData } = data.data;
        
        // Store user and token
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        setUser(userData);
        setAuthToken(token);
        
        // Return success - AuthLayout will handle redirect
        return;
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (error: any) {
      clearStorage();
      throw new Error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStorage();
    router.push('/login');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  };

  // Add a method to get the token for API calls
  const getAuthToken = () => {
    return authToken || localStorage.getItem('admin_token');
  };

  // Add a method to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      clearStorage();
      router.push('/login');
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!authToken,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}