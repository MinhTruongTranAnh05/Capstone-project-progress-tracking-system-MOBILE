import api from './api';
import { storage } from './storage';
import { GoogleLoginConfig, GoogleLoginRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/auth';
import { Campus } from '@/types/models';

export const authService = {
  async getGoogleConfig(): Promise<GoogleLoginConfig> {
    const response = await api.get<GoogleLoginConfig>('/auth/google/config');
    return response.data;
  },

  async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/google', data);
    await storage.setToken(response.data.accessToken);
    await storage.setUser(response.data.user);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    await storage.setToken(response.data.accessToken);
    await storage.setUser(response.data.user);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async getCampuses(): Promise<Campus[]> {
    const response = await api.get<Campus[]>('/auth/campuses');
    return response.data;
  },

  async logout(): Promise<void> {
    await storage.clear();
  },
};
