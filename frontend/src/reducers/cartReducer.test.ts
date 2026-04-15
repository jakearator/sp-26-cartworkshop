import { describe, it, expect } from 'vitest';
import type { CartState } from '../types/cart';
import { cartReducer } from './cartReducer';

describe('cartReducer', () => {
  it('adds a new item with quantity 1', () => {
    const initial: CartState = { items: [], isOpen: false };

    const next = cartReducer(initial, {
      type: 'ADD_TO_CART',
      payload: { id: 42, name: 'Mechanical Keyboard', price: 129.99, imageUrl: '/kb.png' },
    });

    expect(next).toEqual({
      isOpen: false,
      items: [
        {
          productId: 42,
          productName: 'Mechanical Keyboard',
          price: 129.99,
          quantity: 1,
          imageUrl: '/kb.png',
        },
      ],
    });
    expect(initial.items).toHaveLength(0);
  });

  it('removes an item when UPDATE_QUANTITY is less than 1', () => {
    const initial: CartState = {
      isOpen: true,
      items: [
        {
          productId: 7,
          productName: 'Monitor',
          price: 199.99,
          quantity: 2,
        },
      ],
    };

    const next = cartReducer(initial, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 7, quantity: 0 },
    });

    expect(next).toEqual({
      isOpen: true,
      items: [],
    });
  });
});
