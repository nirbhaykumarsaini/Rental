// D:\B2B\app\types\customer.types.ts
export interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  phone?: string;
  avatar?: string;
  status: "active" | "inactive" | "blocked";
  tier?: "regular" | "premium" | "vip";
  joinDate: Date;
  lastOrderDate?: Date;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  orderFrequency?: string;
  addresses: CustomerAddress[];
  defaultAddress?: CustomerAddress | null;
  orders: {
    items: CustomerOrder[];
    pagination: OrderPagination;
  };
  stats?: OrderStats;
  notes?: CustomerNote[];
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  company?: string;
  gst?: string;
  taxExempt?: boolean;
  creditLimit?: number;
  creditUsed?: number;
  paymentTerms?: string;
  source?: string;
  lastLoginAt?: Date;
  lastIpAddress?: string;
  userAgent?: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
  whatsappOptIn?: boolean;
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp';
  preferredLanguage?: string;
  timezone?: string;
  birthday?: Date;
  anniversary?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export interface CustomerAddress {
  id: string;
  type: "home" | "work" | "other";
  street: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
  pincode?: string;
  country: string;
  isDefault: boolean;
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
  fullName?: string;
  fullAddress?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  name?: string;
  quantity: number;
  price: number;
  rentalPrice?: number;
  rentalDays?: number;
  total: number;
  image?: string;
  variantId?: string;
  sizeId?: string;
  color?: string;
  selectedColor?: string;
  size?: string;
  selectedSize?: string;
  startDate?: Date;
  endDate?: Date;
  measurements?: {
    chest: string;
    waist: string;
    hip: string;
  };
}

export interface CustomerOrder {
  id: string;
  _id?: string;
  orderNumber: string;
  totalAmount: number;
  total?: number;
  subtotal?: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  orderStatus?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: "cod" | "upi" | "card";
  itemCount: number;
  items?: OrderItem[];
  orderDate: Date;
  createdAt?: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  returnDate?: Date;
  trackingNumber?: string;
  address?: CustomerAddress;
  rentalPeriod?: number;
  remainingDays?: number;
  rentalStatus?: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface OrderStats {
  statusDistribution: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  monthlyTrend: Array<{
    _id: {
      year: number;
      month: number;
    };
    monthlySpent: number;
    orderCount: number;
  }>;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  activeRentals: number;
  upcomingRentals: number;
  completedRentals: number;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CustomerNote {
  id: string;
  content: string;
  author: string;
  authorId?: string;
  date: Date;
  type: "general" | "support" | "sales" | "followup" | "complaint" | "feedback";
  isPrivate?: boolean;
  attachments?: string[];
}

export interface CustomerFilters {
  search?: string;
  status?: "active" | "inactive" | "blocked" | "all";
  tier?: "regular" | "premium" | "vip" | "all";
  dateFrom?: string;
  dateTo?: string;
  minOrders?: number;
  maxOrders?: number;
  minSpent?: number;
  maxSpent?: number;
  hasOrders?: boolean;
  location?: string;
  source?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CustomerResponse {
  status: boolean;
  message: string;
  data: Customer;
}

export interface CustomersApiResponse {
  status: boolean;
  message: string;
  data: {
    users: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  newCustomersToday: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customersWithOrders: number;
  repeatCustomers: number;
  repeatRate: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    orderCount: number;
  }>;
  ordersByStatus: Record<string, number>;
  ordersByPaymentStatus: Record<string, number>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}