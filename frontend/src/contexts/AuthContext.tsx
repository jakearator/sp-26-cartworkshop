import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { clearStoredAuthSession, getStoredAuthUser, login, register } from '../api/auth';
import type { AuthRequest, AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loginUser: (request: AuthRequest) => Promise<void>;
  registerUser: (request: AuthRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());

  async function loginUser(request: AuthRequest): Promise<void> {
    const next = await login(request);
    setUser(next);
  }

  async function registerUser(request: AuthRequest): Promise<void> {
    const next = await register(request);
    setUser(next);
  }

  function logout(): void {
    clearStoredAuthSession();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loginUser,
      registerUser,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
