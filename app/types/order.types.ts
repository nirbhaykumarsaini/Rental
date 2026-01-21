// app/types/order.types.ts
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod: 'credit-card' | 'paypal' | 'bank-transfer' | 'cash-on-delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  notes?: string;
  trackingNumber?: string;
}