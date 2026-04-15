export interface AuthUser {
  userId: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  userId: string;
  username: string;
  role: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}
