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




// new DATA




// export interface OrderItem {
//   productId: string;
//   productName: string;
//   productSlug: string;
//   variantId?: string;
//   sizeId?: string;
//   color?: string;
//   size?: string;
//   sku?: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
//   image?: string;
// }

// export interface ShippingAddress {
//   first_name: string;
//   last_name: string;
//   address: string;
//   city: string;
//   state: string;
//   pin_code: string;
//   phone_number: string;
//   country: string;
//   address_type?: string;
// }

// export enum OrderStatus {
//   PENDING = 'pending',
//   CONFIRMED = 'confirmed',
//   PROCESSING = 'processing',
//   SHIPPED = 'shipped',
//   DELIVERED = 'delivered',
//   CANCELLED = 'cancelled',
//   REFUNDED = 'refunded'
// }

// export enum PaymentMethod {
//   COD = 'cod'
// }

// export enum PaymentStatus {
//   PENDING = 'pending',
//   PAID = 'paid',
//   FAILED = 'failed',
//   REFUNDED = 'refunded'
// }

// export interface Order {
//   _id: string;
//   userId: string;
//   orderNumber: string;
//   items: OrderItem[];
//   shippingAddress: ShippingAddress;
//   billingAddress?: ShippingAddress;
//   subtotal: number;
//   shippingCharge: number;
//   discount?: number;
//   tax?: number;
//   totalAmount: number;
//   paymentMethod: PaymentMethod;
//   paymentStatus: PaymentStatus;
//   orderStatus: OrderStatus;
//   notes?: string;
//   expectedDeliveryDate?: Date;
//   deliveredAt?: Date;
//   cancelledAt?: Date;
//   cancelledReason?: string;
//   trackingNumber?: string;
//   courierName?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   itemCount?: number;
//   formattedOrderNumber?: string;
// }

// export interface CreateOrderRequest {
//   addressId: string;
//   shippingCharge?: number;
//   discount?: number;
//   tax?: number;
//   notes?: string;
//   useBillingAddress?: boolean;
//   billingAddressId?: string;
// }

// export interface CancelOrderRequest {
//   action: 'cancel';
//   reason?: string;
// }

// export interface OrderStats {
//   totalOrders: number;
//   totalAmount: number;
//   pendingOrders: number;
//   completedOrders: number;
//   cancelledOrders: number;
// }

// export interface PaginatedOrders {
//   orders: Order[];
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalOrders: number;
//     hasNextPage: boolean;
//     hasPreviousPage: boolean;
//   };
// }