// app/components/layout/Header.tsx
'use client';

import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  Zap,
  Award
} from 'lucide-react';
import { useSidebar } from '@/app/context/SidebarContext';
import { useAuth } from '@/app/context/AuthContext';

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-[#1E1E2F] border-b border-[#2A2A3C] px-8 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#2A2A3C] rounded-xl transition-all duration-200 group"
        >
          <Menu className="w-5 h-5 text-gray-400 group-hover:text-orange-400" />
        </button>
      </div>

      <div className="flex items-center space-x-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2.5 bg-[#2A2A3C] border-0 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-80"
          />
        </div>

        <button className="p-2 hover:bg-[#2A2A3C] rounded-xl relative group transition-all duration-200">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-orange-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-[#2A2A3C] rounded-xl group transition-all duration-200">
          <Award className="w-5 h-5 text-gray-400 group-hover:text-orange-400" />
        </button>

        <div className="flex items-center space-x-3 group relative">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <span className="text-white text-sm font-bold uppercase">
              {user?.role?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white capitalize">{user?.role || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors cursor-pointer" />
          
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#2A2A3C] rounded-xl shadow-2xl border border-[#3A3A4C] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-4 py-3 border-b border-[#3A3A4C]">
              <p className="text-sm font-medium text-white capitalize">{user?.role || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
            </div>
            
            <a
              href="/profile"
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#3A3A4C] transition-colors"
            >
              <User className="w-4 h-4 mr-3 text-orange-400" />
              My Profile
            </a>
            
            <a
              href="/settings"
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#3A3A4C] transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-orange-400" />
              Account Settings
            </a>
            
            <div className="border-t border-[#3A3A4C] mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}