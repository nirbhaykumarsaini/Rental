// app/types/customer.types.ts
export interface CustomerAddress {
  id: string;
  type: "shipping" | "billing" | "both";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
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
  phone?: string;
  avatar?: string;
  status: "active" | "inactive" | "blocked";
  tier: "regular" | "premium" | "vip";
  joinDate: Date;
  lastOrderDate?: Date;
  totalOrders: number;
  totalSpent: number;
  addresses: CustomerAddress[];
  notes?: CustomerNote[];
  preferences?: {
    newsletter: boolean;
    marketing: boolean;
    smsNotifications: boolean;
  };
  tags?: string[];
}
