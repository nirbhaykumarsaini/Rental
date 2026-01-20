// components/Sidebar.tsx
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

export default function Sidebar() {
  const menuItems = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Products', icon: <Package className="w-5 h-5" />, href: '/products' },
        { name: 'Add Product', icon: <Plus className="w-5 h-5" />, href: '/products/add' },
        { name: 'Favorites', icon: <Heart className="w-5 h-5" />, href: '/favorites' },
        { name: 'Inbox', icon: <Inbox className="w-5 h-5" />, href: '/inbox' },
        { name: 'Order Lists', icon: <ListOrdered className="w-5 h-5" />, href: '/orders' },
        { name: 'Product Stock', icon: <Package2 className="w-5 h-5" />, href: '/stock' },
      ]
    },
    {
      title: 'Pages',
      items: [
        { name: 'Pricing', icon: <CreditCard className="w-5 h-5" />, href: '/pricing' },
        { name: 'Calendar', icon: <Calendar className="w-5 h-5" />, href: '/calendar' },
        { name: 'To-Do', icon: <CheckSquare className="w-5 h-5" />, href: '/todo' },
        { name: 'Contact', icon: <MessageSquare className="w-5 h-5" />, href: '/contact' },
        { name: 'Invoice', icon: <FileText className="w-5 h-5" />, href: '/invoice' },
        { name: 'UI Elements', icon: <LayoutDashboard className="w-5 h-5" />, href: '/ui' },
        { name: 'Team', icon: <Users className="w-5 h-5" />, href: '/team' },
        { name: 'Table', icon: <Table className="w-5 h-5" />, href: '/table' },
      ]
    },
    {
      title: '',
      items: [
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings' },
        { name: 'Logout', icon: <LogOut className="w-5 h-5" />, href: '/logout' },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen hidden md:block">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="text-xl font-bold">B2B</Link>
      </div>
      
      <nav className="p-4">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-8">
            {section.title && (
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
                      className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="mr-3">
                        {item.icon}
                      </span>
                      {item.name}
                      {item.name === 'Inbox' && (
                        <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">5</span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => console.log(`Clicked ${item.name}`)}
                      className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="mr-3">
                        {item.icon}
                      </span>
                      {item.name}
                      {item.name === 'Inbox' && (
                        <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">5</span>
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