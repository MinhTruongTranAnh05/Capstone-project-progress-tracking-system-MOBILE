import api from '@/services/api';
import { GoogleLoginConfig, GoogleLoginRequest, PasswordLoginRequest, LoginResponse, User, ProfileRequest } from '@/types/auth';
import { passwordLoginSchema } from '@/core/validation/auth';

export const authService = {
  async loginWithPassword(data: PasswordLoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', passwordLoginSchema.parse(data), { authMode: 'public' });
    return response.data;
  },

  async getGoogleConfig(): Promise<GoogleLoginConfig> {
    const response = await api.get<GoogleLoginConfig>('/auth/google/config', { authMode: 'public' });
    return response.data;
  },

  async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/google', data, { authMode: 'public' });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: ProfileRequest): Promise<User> {
    const response = await api.put<User>('/me/profile', data);
    return response.data;
  },

};
