import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { CartState, CartAction } from '../types/cart';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

interface CartContextType {
  state: CartState;
  dispatch: (action: CartAction) => void;
  cartItemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Compute cart item count (sum of all quantities)
  const cartItemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  // Compute cart total (sum of price × quantity for each item)
  const cartTotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value: CartContextType = {
    state,
    dispatch,
    cartItemCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextType {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
