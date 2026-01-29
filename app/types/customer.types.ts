// app/types/customer.types.ts
export interface CustomerAddress {
  id: string;
  type: "home" | "work" | "other";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  fullName?: string;
  fullAddress?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  variantId?: string;
  sizeId?: string;
  color?: string;
  size?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  itemCount: number;
  orderDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  trackingNumber?: string;
  items: OrderItem[];
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
  date: Date;
  type: "general" | "support" | "sales" | "followup";
}

export interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  status: "active" | "inactive" | "blocked";
  tier: "regular" | "premium" | "vip";
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
  isProfileComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
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