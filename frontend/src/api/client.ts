const AUTH_TOKEN_STORAGE_KEY = "authToken";

export function getAuthTokenStorageKey(): string {
  return AUTH_TOKEN_STORAGE_KEY;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "You do not have permission to perform this action.") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

function getStoredAuthToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string): void {
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures (for private mode or unavailable storage).
  }
}

function clearStoredAuthToken(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures (for private mode or unavailable storage).
  }
}

export function clearAuthToken(): void {
  clearStoredAuthToken();
}

async function buildApiError(response: Response): Promise<ApiError> {
  const fallback = `Request failed: ${response.status}`;

  try {
    const body = (await response.json()) as { detail?: string; title?: string };
    const message = body.detail ?? body.title ?? fallback;
    return new ApiError(response.status, message);
  } catch {
    return new ApiError(response.status, fallback);
  }
}

function withAuthHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  const token = getStoredAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = withAuthHeaders(init);
  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    clearStoredAuthToken();
    window.dispatchEvent(new CustomEvent("auth:required", { detail: { status: 401 } }));
    throw new UnauthorizedError();
  }

  if (response.status === 403) {
    window.dispatchEvent(new CustomEvent("auth:required", { detail: { status: 403 } }));
    throw new ForbiddenError();
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response;
}

export async function apiFetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await apiFetch(input, init);
  return (await response.json()) as T;
}
