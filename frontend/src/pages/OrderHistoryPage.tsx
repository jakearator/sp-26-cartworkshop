import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { getOrderHistoryForUser } from '../services/orderHistory';
import styles from './OrderHistoryPage.module.css';

export default function OrderHistoryPage() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <section className={styles.page}>
        <h2 className={styles.heading}>Order History</h2>
        <p className={styles.message}>Sign in to view your orders.</p>
        <Link to="/auth" className={styles.link}>
          Go to Login / Register
        </Link>
      </section>
    );
  }

  const orders = getOrderHistoryForUser(user.username);

  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>Order History</h2>

      {orders.length === 0 ? (
        <p className={styles.message} data-testid="order-history-empty">
          No orders yet.
        </p>
      ) : (
        <ul className={styles.orderList} aria-label="Order history" data-testid="order-history-list">
          {orders.map((order) => (
            <li key={order.id} className={styles.orderItem} data-testid="order-history-item">
              <div className={styles.row}>
                <span className={styles.orderId}>Order {order.id}</span>
                <span className={styles.total}>${order.total.toFixed(2)}</span>
              </div>

              <p className={styles.meta}>Placed: {new Date(order.placedAt).toLocaleString()}</p>
              <p className={styles.meta}>
                Ship to: {order.shipping.fullName}, {order.shipping.address}, {order.shipping.city},{' '}
                {order.shipping.state} {order.shipping.zipCode}
              </p>
              <p className={styles.meta}>Items: {order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
