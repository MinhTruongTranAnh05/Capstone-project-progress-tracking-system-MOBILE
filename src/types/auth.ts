import { Campus, Role } from '@/types/models';

export interface LoginRequest {
  email: string;
  password: string;
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
  studentCode?: string;
  campus: Campus;
  role?: Role;
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
  role: Role;
  campus: Campus;
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
