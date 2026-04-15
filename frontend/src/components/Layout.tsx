import { Link, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import { CartBadge } from "./CartBadge/CartBadge";
import { useAuthContext } from "../contexts/AuthContext";

export default function Layout() {
  const { user, logout } = useAuthContext();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌰</span>
            <h1 className={styles.title}>Buckeye Marketplace</h1>
          </Link>
          <nav className={styles.nav} aria-label="Main">
            <Link to="/" className={styles.navLink}>
              Products
            </Link>
            <Link to="/orders" className={styles.navLink}>
              Order History
            </Link>
            {user ? (
              <>
                <span className={styles.userLabel} data-testid="signed-in-user">
                  Signed in as {user.username}
                </span>
                <button type="button" onClick={logout} className={styles.logoutButton}>
                  Log out
                </button>
              </>
            ) : (
              <Link to="/auth" className={styles.navLink}>
                Login / Register
              </Link>
            )}
            <CartBadge />
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
