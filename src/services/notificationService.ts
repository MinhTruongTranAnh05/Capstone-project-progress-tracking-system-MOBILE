import api from './api';
import { storage } from './storage';
import { config } from '@/constants/config';

export const notificationService = {
  async getNotifications(params?: {
    unreadOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<any> {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async getUnreadCount(): Promise<{ unread: number }> {
    const response = await api.get<{ unread: number }>('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string): Promise<any> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<any> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  async getSseUrl(): Promise<string> {
    const token = await storage.getToken();
    const apiUrl = config.API_URL;
    return `${apiUrl}/notifications/stream?access_token=${token}`;
  },
};

