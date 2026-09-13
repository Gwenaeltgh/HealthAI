export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Compatibility aliases used across adapters
export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;
export interface ForgotPasswordResponse {
  ok: boolean;
  message?: string;
}
export interface ResetPasswordResponse {
  ok: boolean;
  message?: string;
}

// Request type aliases expected by some adapters
export type LoginRequest = LoginCredentials;
export type RegisterRequest = RegisterCredentials;