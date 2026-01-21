'use client';

import {
  Search,
  Bell,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useSidebar } from '@/app/context/SidebarContext';

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div>
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search here..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </header>
  );
}