import api from './api';
import { Topic } from '@/types/models';

export const topicService = {
  async getTopics(params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<any> {
    const response = await api.get('/topics', { params });
    return response.data;
  },

  async getTopicById(id: string): Promise<Topic> {
    const response = await api.get<Topic>(`/topics/${id}`);
    return response.data;
  },

};
