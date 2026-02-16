'use client';

import {
  Package,
  Inbox,
  ListOrdered,
  Package2,
  Settings,
  LogOut,
  User,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/app/context/SidebarContext';
import { useAuth } from '@/app/context/AuthContext';

export default function Sidebar() {
  const { isCollapsed } = useSidebar();
  const { logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Customers', icon: <Package2 className="w-5 h-5" />, href: '/customers' },
        { name: 'Products', icon: <Package className="w-5 h-5" />, href: '/products' },
        { name: 'Categories', icon: <Inbox className="w-5 h-5" />, href: '/categories' },
        { name: 'Order Lists', icon: <ListOrdered className="w-5 h-5" />, href: '/orders' },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile', icon: <User className="w-5 h-5" />, href: '/profile' },
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings' },
        { name: 'Privacy And Policy', icon: <Settings className="w-5 h-5" />, href: '/privacy-policy' },
        { name: 'Manage Slider', icon: <Settings className="w-5 h-5" />, href: '/slider' },
        { name: "FAQ's", icon: <Settings className="w-5 h-5" />, href: '/faq' },
      ]
    },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#1E1E2F] text-white h-screen hidden md:block transition-all duration-300 sticky top-0 shadow-2xl`}>
      <div className="flex flex-col h-full p-4">
        {/* Logo Card */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-4 mb-6 shadow-lg">
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="font-bold text-white text-lg">B</span>
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-white text-lg block">B2B</span>
                <span className="text-xs text-white/70">Dashboard</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {menuItems.map((section, index) => (
            <div key={index} className="mb-6">
              {section.title && !isCollapsed && (
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-bold rounded-xl transition-all duration-200
                        bg-[#2A2A3C] hover:bg-[#2A2A3C] border-l-4 border-transparent hover:border-orange-500 hover:shadow-lg hover:scale-[1.02]`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <span className={`${isCollapsed ? '' : 'mr-3'} text-orange-400`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-gray-200">
                          {item.name}
                        </span>
                      )}
                      {!isCollapsed && item.name === 'Inbox' && (
                        <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">5</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-bold rounded-xl transition-all duration-200
              bg-[#2A2A3C] hover:bg-[#2A2A3C] border-l-4 border-transparent hover:border-red-500 hover:shadow-lg hover:scale-[1.02] text-gray-300 hover:text-white`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className={`${isCollapsed ? '' : 'mr-3'} text-red-400`}>
              <LogOut className="w-5 h-5" />
            </span>
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </div>
    </aside>
  );
}