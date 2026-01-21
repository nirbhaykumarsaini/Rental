'use client';

import {
  LayoutDashboard,
  Package,
  Heart,
  Inbox,
  ListOrdered,
  Package2,
  Calendar,
  CheckSquare,
  Users,
  Table,
  FileText,
  Settings,
  LogOut,
  CreditCard,
  MessageSquare,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/app/context/SidebarContext';

export default function Sidebar() {
  const { isCollapsed } = useSidebar();

  const menuItems = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Customers', icon: <Package2 className="w-5 h-5" />, href: '/customers' },
        { name: 'Products', icon: <Package className="w-5 h-5" />, href: '/products' },
        // { name: 'Favorites', icon: <Heart className="w-5 h-5" />, href: '/favorites' },
        { name: 'Categories', icon: <Inbox className="w-5 h-5" />, href: '/categories' },
        { name: 'Order Lists', icon: <ListOrdered className="w-5 h-5" />, href: '/orders' },
      ]
    },
    // {
    //   title: 'Pages',
    //   items: [
    //     { name: 'Pricing', icon: <CreditCard className="w-5 h-5" />, href: '/pricing' },
    //     { name: 'Calendar', icon: <Calendar className="w-5 h-5" />, href: '/calendar' },
    //     { name: 'To-Do', icon: <CheckSquare className="w-5 h-5" />, href: '/todo' },
    //     { name: 'Contact', icon: <MessageSquare className="w-5 h-5" />, href: '/contact' },
    //     { name: 'Invoice', icon: <FileText className="w-5 h-5" />, href: '/invoice' },
    //     { name: 'UI Elements', icon: <LayoutDashboard className="w-5 h-5" />, href: '/ui' },
    //     { name: 'Team', icon: <Users className="w-5 h-5" />, href: '/team' },
    //     { name: 'Table', icon: <Table className="w-5 h-5" />, href: '/table' },
    //   ]
    // },
    {
      title: '',
      items: [
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings' },
        { name: 'Logout', icon: <LogOut className="w-5 h-5" />, href: '/logout' },
      ]
    }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white min-h-screen hidden md:block transition-all duration-300`}>
      <div className="p-5.5 border-b border-gray-800">
        <Link href="/" className={`font-bold ${isCollapsed ? 'text-center block' : ''}`}>
          {isCollapsed ? 'B' : 'B2B'}
        </Link>
      </div>

      <nav className="p-4">
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
    </aside>
  );
}