import api from './api';
import type { Campus, GoogleLoginConfig, GoogleLoginRequest, LoginRequest, LoginResponse, ProfileRequest, RegisterRequest, RegisterResponse, User } from '@/types/auth';
export const authService = {
  getCampuses: () => api.get<Campus[]>('/auth/campuses', { authMode: 'public' }).then(r => r.data),
  getGoogleConfig: () => api.get<GoogleLoginConfig>('/auth/google/config', { authMode: 'public' }).then(r => r.data),
  loginWithGoogle: (data: GoogleLoginRequest) => api.post<LoginResponse>('/auth/google', data, { authMode: 'public' }).then(r => r.data),
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data, { authMode: 'public' }).then(r => r.data),
  register: (data: RegisterRequest) => api.post<RegisterResponse>('/auth/register', data, { authMode: 'public' }).then(r => r.data),
  getCurrentUser: () => api.get<User>('/auth/me').then(r => r.data),
  updateProfile: (data: ProfileRequest) => api.put<User>('/me/profile', data).then(r => r.data),
};
