// app/types/order.types.ts
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  variantId?: string;
  sizeId?: string;
  color?: string;
  size?: string;
  sku?: string;
  image?: string;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  addressType?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | string;
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'credit-card' | 'paypal' | 'cod' | 'bank-transfer';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  expectedDeliveryDate?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  adminNotes?: string;
  subtotal?: number;
  shippingCharge?: number;
  discount?: number;
  tax?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  customerEmail?: string;
  orderNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  percentageChange?: {
    orders: number;
    revenue: number;
  };
  revenueTrend?: Array<{
    _id: string;
    dailyRevenue: number;
    orderCount: number;
  }>;
  topProducts?: Array<{
    _id: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export interface OrderResponse {
  status: boolean;
  message: string;
  data: Order;
}

export interface OrdersResponse {
  status: boolean;
  message: string;
  data: {
    orders: Order[];
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

export interface OrderStatsResponse {
  status: boolean;
  message: string;
  data: OrderStats;
}

export interface StatusUpdateRequest {
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  courierName?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}