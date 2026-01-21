// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: User) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user on mount
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        // Convert string dates back to Date objects
        if (parsedUser.createdAt) {
          parsedUser.createdAt = new Date(parsedUser.createdAt);
        }
        if (parsedUser.lastLogin) {
          parsedUser.lastLogin = new Date(parsedUser.lastLogin);
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo credentials check
      if (email === 'demo@b2b.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email,
          firstName: 'Demo',
          lastName: 'User',
          avatar: '',
          role: 'admin',
          permissions: ['read', 'write', 'delete'],
          lastLogin: new Date(),
          createdAt: new Date(),
          isVerified: true,
        };

        // Store in localStorage
        localStorage.setItem('auth_token', 'mock_jwt_token_12345');
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('refresh_token', 'mock_refresh_token_12345');

        setUser(mockUser);
        return; // Success - AuthLayout will handle redirect
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      clearStorage();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStorage();
    router.push('/login');
  };

  const register = async (userData: User) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Registration logic here
      console.log('Registering user:', userData);

      // After successful registration, you might want to auto-login
      // For now, just redirect to login
      router.push('/login');
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

   const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser
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