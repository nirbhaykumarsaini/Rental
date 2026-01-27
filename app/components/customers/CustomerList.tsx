// app/components/customers/CustomerList.tsx
'use client';

import { useState } from 'react';
import { Customer } from '@/app/types/customer.types';
import { 
  Eye, 
  Mail, 
  Phone, 
  MoreVertical, 
  Star,
  Clock,
  UserX,
  CheckCircle,
  MessageSquare,
  Users
} from 'lucide-react';

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    customerId: 'CUST-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    tier: 'vip',
    joinDate: new Date('2023-03-15'),
    lastOrderDate: new Date('2024-01-10'),
    totalOrders: 24,
    totalSpent: 12580.50,
    addresses: [],
    tags: ['frequent-buyer', 'tech-enthusiast'],
  },
  {
    id: '2',
    customerId: 'CUST-002',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.j@email.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    tier: 'premium',
    joinDate: new Date('2023-06-22'),
    lastOrderDate: new Date('2024-01-12'),
    totalOrders: 12,
    totalSpent: 5240.75,
    addresses: [],
    tags: ['newsletter-subscriber'],
  },
  {
    id: '3',
    customerId: 'CUST-003',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'm.brown@email.com',
    status: 'active',
    tier: 'regular',
    joinDate: new Date('2024-01-05'),
    lastOrderDate: new Date('2024-01-15'),
    totalOrders: 3,
    totalSpent: 890.25,
    addresses: [],
  },
  {
    id: '4',
    customerId: 'CUST-004',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.w@email.com',
    phone: '+1 (555) 345-6789',
    status: 'inactive',
    tier: 'regular',
    joinDate: new Date('2023-08-10'),
    lastOrderDate: new Date('2023-11-30'),
    totalOrders: 5,
    totalSpent: 1200.00,
    addresses: [],
    tags: ['abandoned-cart'],
  },
  {
    id: '5',
    customerId: 'CUST-005',
    firstName: 'David',
    lastName: 'Lee',
    email: 'd.lee@email.com',
    phone: '+1 (555) 456-7890',
    status: 'active',
    tier: 'vip',
    joinDate: new Date('2022-11-30'),
    lastOrderDate: new Date('2024-01-14'),
    totalOrders: 42,
    totalSpent: 28950.80,
    addresses: [],
    tags: ['wholesale', 'business-customer'],
  },
  {
    id: '6',
    customerId: 'CUST-006',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'j.davis@email.com',
    status: 'blocked',
    tier: 'regular',
    joinDate: new Date('2023-09-18'),
    lastOrderDate: new Date('2023-12-05'),
    totalOrders: 2,
    totalSpent: 450.00,
    addresses: [],
  },
  {
    id: '7',
    customerId: 'CUST-007',
    firstName: 'Robert',
    lastName: 'Miller',
    email: 'rob.m@email.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    tier: 'premium',
    joinDate: new Date('2023-12-01'),
    lastOrderDate: new Date('2024-01-13'),
    totalOrders: 8,
    totalSpent: 3250.40,
    addresses: [],
    tags: ['early-adopter'],
  },
  {
    id: '8',
    customerId: 'CUST-008',
    firstName: 'Lisa',
    lastName: 'Taylor',
    email: 'lisa.t@email.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    tier: 'regular',
    joinDate: new Date('2024-01-02'),
    lastOrderDate: new Date('2024-01-16'),
    totalOrders: 1,
    totalSpent: 149.99,
    addresses: [],
  },
];

interface CustomerListProps {
  onViewCustomer: (customer: Customer) => void;
}

export function CustomerList({ onViewCustomer }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getTierColor = (tier: Customer['tier']) => {
    switch (tier) {
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'regular': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'inactive': return <Clock className="w-3 h-3" />;
      case 'blocked': return <UserX className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getTierIcon = (tier: Customer['tier']) => {
    switch (tier) {
      case 'vip': return <Star className="w-3 h-3" />;
      case 'premium': return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (selectedTier !== 'all' && customer.tier !== selectedTier) return false;
    if (selectedStatus !== 'all' && customer.status !== selectedStatus) return false;
    return true;
  });

  const tierOptions = [
    { value: 'all', label: 'All Tiers', count: customers.length },
    { value: 'vip', label: 'VIP', count: customers.filter(c => c.tier === 'vip').length },
    { value: 'premium', label: 'Premium', count: customers.filter(c => c.tier === 'premium').length },
    { value: 'regular', label: 'Regular', count: customers.filter(c => c.tier === 'regular').length },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', count: customers.length },
    { value: 'active', label: 'Active', count: customers.filter(c => c.status === 'active').length },
    { value: 'inactive', label: 'Inactive', count: customers.filter(c => c.status === 'inactive').length },
    { value: 'blocked', label: 'Blocked', count: customers.filter(c => c.status === 'blocked').length },
  ];

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Header with Filters */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500">
                  {filteredCustomers.length} customers found
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Tier:</span>
                <div className="flex flex-wrap gap-2">
                  {tierOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedTier(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                        selectedTier === option.value
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                      <span className="ml-2 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                        selectedStatus === option.value
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                      <span className="ml-2 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      {customer.phone && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                      {getTierIcon(customer.tier)}
                      <span className="ml-1.5">
                        {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      <span className="mr-1.5">{getStatusIcon(customer.status)}</span>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{customer.totalOrders}</div>
                  <div className="text-xs text-gray-500">orders</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${(customer.totalSpent / customer.totalOrders).toFixed(2)} avg.
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.lastOrderDate ? (
                      <>
                        {new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        <div className="text-xs text-gray-500">
                          {new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                            year: 'numeric'
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">No orders yet</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="py-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {selectedTier !== 'all' || selectedStatus !== 'all'
              ? 'Try changing your filters to see more customers.'
              : 'No customers have been added yet.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredCustomers.length}</span> of{' '}
              <span className="font-medium">{filteredCustomers.length}</span> customers
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}