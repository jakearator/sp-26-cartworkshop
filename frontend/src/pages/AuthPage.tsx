import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuthContext } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginUser, registerUser, user } = useAuthContext();
  const [mode, setMode] = useState<Mode>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        await registerUser({ username, password });
      } else {
        await loginUser({ username, password });
      }

      navigate('/');
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to sign in right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user) {
    return (
      <section className={styles.page}>
        <h2 className={styles.heading}>You are already signed in.</h2>
        <p className={styles.note} data-testid="auth-status">
          Signed in as <strong>{user.username}</strong>.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-label="Authentication">
      <h2 className={styles.heading}>Account Access</h2>
      <p className={styles.note}>Register a new account or sign in to continue.</p>

      <div className={styles.modeSwitch} role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          onClick={() => setMode('register')}
          className={`${styles.modeButton}${mode === 'register' ? ` ${styles.modeButtonActive}` : ''}`}
        >
          Register
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          onClick={() => setMode('login')}
          className={`${styles.modeButton}${mode === 'login' ? ` ${styles.modeButtonActive}` : ''}`}
        >
          Login
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          minLength={3}
          required
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          minLength={8}
          required
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          aria-label={mode === 'register' ? 'Register account' : 'Login to account'}
        >
          {isSubmitting ? 'Submitting...' : mode === 'register' ? 'Register' : 'Login'}
        </button>
      </form>
    </section>
  );
}
