// app/lib/utils/orderUtils.ts
import { format } from 'date-fns';

export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${format(new Date(), 'yyyyMMdd')}-${random}`;
}

export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
  };
  return statusMap[status] || status;
}

export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'paid': 'Paid',
    'failed': 'Failed',
    'refunded': 'Refunded',
  };
  return statusMap[status] || status;
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function validateOrderItems(items: any[]): boolean {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every(item => 
    item.productId && 
    item.quantity && 
    item.quantity > 0 &&
    item.price !== undefined
  );
}