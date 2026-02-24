// D:\B2B\app\types\order.types.ts
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  rentalDays: number;
  rentalPrice: number;
  startDate: string;
  endDate: string;
  selectedSize: string;
  selectedColor: string;
  measurements: {
    chest: string;
    waist: string;
    hip: string;
  };
  quantity: number;
  _id: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  _id: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  address: OrderAddress;
  paymentMethod: 'cod' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryDate: string;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersApiResponse {
  status: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'total' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}