// app/services/cartService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface CartItem {
  _id: string;
  product: any;
  variant: {
    color: string;
    size: string;
  };
  quantity: number;
  price: number;
}

export interface CartData {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  couponCode?: string;
  discountAmount: number;
  shippingCharges: number;
  taxAmount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
}

class CartService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      return {
        status: false,
        message: errorMessage
      };
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return {
        status: false,
        message: 'Invalid response from server'
      };
    }
  }

  async getCart(userId: string): Promise<ApiResponse<CartData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      return this.handleResponse<CartData>(response);
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to fetch cart'
      };
    }
  }

  async addToCart(
    userId: string, 
    productId: string, 
    variant: { color: string; size: string }, 
    quantity: number = 1
  ): Promise<ApiResponse<CartData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, productId, variant, quantity }),
      });
      
      return this.handleResponse<CartData>(response);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to add to cart'
      };
    }
  }

  async updateCartItem(
    userId: string, 
    itemId: string, 
    quantity: number
  ): Promise<ApiResponse<CartData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, itemId, quantity }),
      });
      
      return this.handleResponse<CartData>(response);
    } catch (error) {
      console.error('Error updating cart:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to update cart'
      };
    }
  }

  async removeFromCart(
    userId: string, 
    itemId: string
  ): Promise<ApiResponse<CartData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove?userId=${userId}&itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return this.handleResponse<CartData>(response);
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to remove from cart'
      };
    }
  }

  async clearCart(userId: string): Promise<ApiResponse<CartData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      return this.handleResponse<CartData>(response);
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to clear cart'
      };
    }
  }

  async applyCoupon(
    userId: string, 
    couponCode: string
  ): Promise<ApiResponse<CartData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/apply-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, couponCode }),
      });
      
      return this.handleResponse<CartData>(response);
    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to apply coupon'
      };
    }
  }

  // Helper method to calculate item total
  calculateItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }

  // Helper method to format price
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  }
}

const cartService = new CartService();
export default cartService;