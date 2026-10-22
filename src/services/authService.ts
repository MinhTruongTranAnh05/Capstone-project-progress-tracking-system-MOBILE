import api from './api';
import { GoogleLoginConfig, GoogleLoginRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/auth';
import { Campus } from '@/types/models';

export const authService = {
  async getGoogleConfig(): Promise<GoogleLoginConfig> {
    const response = await api.get<GoogleLoginConfig>('/auth/google/config', { authMode: 'public' });
    return response.data;
  },

  async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/google', data, { authMode: 'public' });
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data, { authMode: 'public' });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data, { authMode: 'public' });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async getCampuses(): Promise<Campus[]> {
    const response = await api.get<Campus[]>('/auth/campuses', { authMode: 'public' });
    return response.data;
  },

};
