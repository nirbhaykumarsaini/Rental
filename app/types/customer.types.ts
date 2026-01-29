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

export interface OrderHistory {
  id: string;
  orderNumber: string;
  date: Date;
  totalAmount: number;
  status: "completed" | "pending" | "cancelled" | "refunded";
  items: number;
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
  addresses: CustomerAddress[];
  defaultAddress?: CustomerAddress | null;
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