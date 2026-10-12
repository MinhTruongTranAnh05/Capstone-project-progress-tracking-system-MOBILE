import api from './api';
import { Topic } from '@/types/models';

export interface CreateTopicRequest {
  topicCode: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
}

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

  async createTopic(data: CreateTopicRequest): Promise<Topic> {
    const response = await api.post<Topic>('/topics', data);
    return response.data;
  },

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    const response = await api.put<Topic>(`/topics/${id}`, data);
    return response.data;
  },

  async getTopicQuestions(topicId: string): Promise<any> {
    const response = await api.get(`/topics/${topicId}/questions`);
    return response.data;
  },

  async addTopicQuestion(topicId: string, data: {
    category?: string;
    questionText: string;
    guidanceNotes?: string;
  }): Promise<any> {
    const response = await api.post(`/topics/${topicId}/questions`, data);
    return response.data;
  },
};
