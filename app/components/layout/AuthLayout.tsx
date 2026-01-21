// app/components/layout/AuthLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { SidebarProvider } from '@/app/context/SidebarContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only run auth check after initial load
    if (!isLoading) {
      handleAuthCheck();
    }
  }, [isLoading, isAuthenticated, pathname]);

  const handleAuthCheck = () => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/unauthorized'];
    const isPublicRoute = publicRoutes.includes(pathname);

    console.log('Auth check:', { isAuthenticated, pathname, isPublicRoute });

    if (!isAuthenticated && !isPublicRoute) {
      // Not logged in and trying to access protected route
      console.log('Redirecting to login');
      router.push('/login');
    } else if (isAuthenticated && isPublicRoute && pathname !== '/unauthorized') {
      // Logged in and trying to access auth page
      console.log('Redirecting to dashboard');
      router.push('/');
    }
    
    setIsCheckingAuth(false);
  };

  // Show loading while checking auth
  // if (isLoading || isCheckingAuth) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
  //         <p className="text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Public routes (login, register, etc.)
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/unauthorized'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If public route, render children directly
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - render dashboard layout only if authenticated
  // if (!isAuthenticated) {
  //   // This shouldn't happen due to redirect, but as a fallback
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
  //         <p className="text-gray-600">Redirecting to login...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Authenticated user - show dashboard layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}