import api from '@/services/api';
import type { Notification, Page } from '@/types/models';

export const notificationService = {
  async getNotifications(params?: {
    unreadOnly?: boolean;
    page?: number;
    size?: number;
  }, signal?: AbortSignal): Promise<Page<Notification>> {
    const response = await api.get<Page<Notification>>('/notifications', { params, signal });
    return response.data;
  },

  async getUnreadCount(): Promise<{ unread: number }> {
    const response = await api.get<{ unread: number }>('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put<Notification>(`/notifications/${encodeURIComponent(id)}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ updated: number }> {
    const response = await api.put<{ updated: number }>('/notifications/read-all');
    return response.data;
  },

};

