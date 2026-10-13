import api from './api';
import { Slot } from '@/types/models';

export interface CreateSlotRequest {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  locationType: string;
  meetingUrl?: string;
}

export interface BookSlotRequest {
  groupId?: string;
  notes?: string;
}

export const scheduleService = {
  async getSlots(params?: {
    instructorId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<any> {
    const response = await api.get('/slots', { params: { page: 0, size: 20, ...params } });
    return response.data;
  },

  async getSlotById(id: string): Promise<Slot> {
    const response = await api.get<Slot>(`/slots/${id}`);
    return response.data;
  },

  async createSlot(data: CreateSlotRequest): Promise<Slot> {
    const response = await api.post<Slot>('/slots', data);
    return response.data;
  },

  async bookSlot(slotId: string, data?: BookSlotRequest): Promise<any> {
    const response = await api.post(`/slots/${slotId}/book`, data || {});
    return response.data;
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    const response = await api.delete(`/bookings/${bookingId}`, { data: { reason } });
    return response.data;
  },
};
