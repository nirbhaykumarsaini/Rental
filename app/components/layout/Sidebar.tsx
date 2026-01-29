'use client';

import {
  Package,
  Inbox,
  ListOrdered,
  Package2,
  Settings,
  LogOut,
  User
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
      ]
    },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white h-screen hidden md:block transition-all duration-300 sticky top-0`}>
      <div className="flex flex-col h-full">
        <div className="p-5.5 border-b border-gray-800">
          <Link href="/" className={`font-bold ${isCollapsed ? 'text-center block' : ''}`}>
            {isCollapsed ? 'B' : 'B2B'}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((section, index) => (
            <div key={index} className="mb-8">
              {section.title && !isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
                        title={isCollapsed ? item.name : ''}
                      >
                        <span className={isCollapsed ? '' : 'mr-3'}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            {item.name}
                            {item.name === 'Inbox' && (
                              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">5</span>
                            )}
                          </>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={() => console.log(`Clicked ${item.name}`)}
                        className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
                        title={isCollapsed ? item.name : ''}
                      >
                        <span className={isCollapsed ? '' : 'mr-3'}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            {item.name}
                            {item.name === 'Inbox' && (
                              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">5</span>
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className={isCollapsed ? '' : 'mr-3'}>
              <LogOut className="w-5 h-5" />
            </span>
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </div>
    </aside>
  );
}