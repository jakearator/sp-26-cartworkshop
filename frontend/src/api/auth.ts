import { apiFetchJson, setStoredAuthToken, clearAuthToken } from './client';
import type { AuthRequest, AuthResponse, AuthUser } from '../types/auth';

const AUTH_USER_STORAGE_KEY = 'authUser';

function toUser(response: AuthResponse): AuthUser {
  return {
    userId: response.userId,
    username: response.username,
    role: response.role,
  };
}

export async function register(request: AuthRequest): Promise<AuthUser> {
  const response = await apiFetchJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  setStoredAuthToken(response.token);
  storeAuthUser(toUser(response));
  return toUser(response);
}

export async function login(request: AuthRequest): Promise<AuthUser> {
  const response = await apiFetchJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  setStoredAuthToken(response.token);
  storeAuthUser(toUser(response));
  return toUser(response);
}

export function storeAuthUser(user: AuthUser): void {
  try {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage failures.
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthUser>;

    if (!parsed.userId || !parsed.username || !parsed.role) {
      return null;
    }

    return {
      userId: parsed.userId,
      username: parsed.username,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export function clearStoredAuthSession(): void {
  clearAuthToken();

  try {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
