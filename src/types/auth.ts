import { Campus } from '@/types/models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  campus: Campus;
}

export interface GoogleLoginConfig {
  enabled: boolean;
  clientId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  studentCode: string;
  campus: Campus;
}

export interface RegisterResponse {
  id: string;
  email: string;
  status: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  // Treat the server role as untrusted until the mobile access check succeeds.
  role: string;
  campus: Campus | null;
  department?: string;
  status: string;
  avatarUrl?: string;
  studentCode?: string;
  bio?: string;
  skills?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type MobileRole = 'STUDENT' | 'GROUP_LEADER';
export type MobileUser = Omit<User, 'role'> & { role: MobileRole };
