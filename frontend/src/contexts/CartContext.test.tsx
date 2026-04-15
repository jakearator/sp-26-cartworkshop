import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCartContext } from './CartContext';

function CartProbe() {
  const { cartItemCount, cartTotal, dispatch } = useCartContext();

  return (
    <>
      <span data-testid="count">{cartItemCount}</span>
      <span data-testid="total">{cartTotal.toFixed(2)}</span>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: 'ADD_TO_CART',
            payload: {
              id: 1,
              name: 'USB-C Hub',
              price: 19.99,
            },
          })
        }
      >
        Add
      </button>
    </>
  );
}

describe('CartContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('computes cartItemCount and cartTotal from reducer state', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0.00');

    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('39.98');
  });

  it('throws when useCartContext is used outside CartProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<CartProbe />)).toThrowError(
      'useCartContext must be used within a CartProvider'
    );

    spy.mockRestore();
  });
});
