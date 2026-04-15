import type { CartItem } from './cart';

export interface OrderShipping {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface OrderHistoryEntry {
  id: string;
  username: string;
  placedAt: string;
  total: number;
  items: CartItem[];
  shipping: OrderShipping;
}

export interface CreateOrderHistoryEntry {
  username: string;
  placedAt: string;
  total: number;
  items: CartItem[];
  shipping: OrderShipping;
}
