import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckoutForm,
  type PlacedOrderDetails,
} from '../components/CheckoutForm/CheckoutForm';
import { useAuthContext } from '../contexts/AuthContext';
import { useCartContext } from '../contexts/CartContext';
import { saveOrderHistoryEntry } from '../services/orderHistory';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { state, dispatch, cartTotal } = useCartContext();
  const { user } = useAuthContext();
  const { items } = state;
  const [orderPlaced, setOrderPlaced] = useState(false);

  function handleOrderPlaced(details: PlacedOrderDetails) {
    if (user) {
      saveOrderHistoryEntry({
        username: user.username,
        placedAt: new Date().toISOString(),
        total: cartTotal,
        items,
        shipping: details.shipping,
      });
    }

    setOrderPlaced(true);
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className={styles.empty}>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className={styles.browseLink}>
          ← Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your Cart</h1>

      {items.length > 0 && (
        <>
          <ul className={styles.itemList} aria-label="Cart items">
            {items.map((item) => (
              <li key={item.productId} className={styles.item}>
                <span className={styles.name}>{item.productName}</span>

                <span className={styles.price}>${item.price.toFixed(2)}</span>

                <div className={styles.quantitySelector} role="group" aria-label={`Quantity for ${item.productName}`}>
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.productName}`}
                    disabled={item.quantity === 1}
                    className={styles.qtyButton}
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: {
                          productId: item.productId,
                          quantity: Math.max(1, item.quantity - 1),
                        },
                      })
                    }
                  >
                    −
                  </button>

                  <span className={styles.qtyValue} aria-live="polite">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.productName}`}
                    className={styles.qtyButton}
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: {
                          productId: item.productId,
                          quantity: Math.min(99, item.quantity + 1),
                        },
                      })
                    }
                  >
                    +
                  </button>
                </div>

                <span className={styles.lineTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  type="button"
                  aria-label={`Remove ${item.productName} from cart`}
                  className={styles.removeButton}
                  onClick={() =>
                    dispatch({
                      type: 'REMOVE_FROM_CART',
                      payload: { productId: item.productId },
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.summary}>
            <p className={styles.total}>
              Total: <strong>${cartTotal.toFixed(2)}</strong>
            </p>
          </div>
        </>
      )}

      <CheckoutForm items={items} onOrderPlaced={handleOrderPlaced} />
    </div>
  );
}
