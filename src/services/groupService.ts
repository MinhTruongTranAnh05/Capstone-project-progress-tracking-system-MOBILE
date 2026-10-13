import api from './api';
import { StudentGroup } from '@/types/models';

export interface CreateGroupRequest {
  groupCode?: string;
  semester: string;
  topicId?: string;
  supervisorId?: string;
}

export const groupService = {
  async getGroups(params?: {
    supervisorId?: string;
    topicId?: string;
    available?: boolean;
    memberId?: string;
    page?: number;
    size?: number;
  }): Promise<any> {
    const response = await api.get('/groups', { params });
    return response.data;
  },

  async getGroupById(id: string): Promise<StudentGroup> {
    const response = await api.get<StudentGroup>(`/groups/${id}`);
    return response.data;
  },

  async createGroup(data: CreateGroupRequest): Promise<StudentGroup> {
    const response = await api.post<StudentGroup>('/groups', data);
    return response.data;
  },

  async updateGroup(id: string, data: Partial<StudentGroup>): Promise<StudentGroup> {
    const response = await api.put<StudentGroup>(`/groups/${id}`, data);
    return response.data;
  },

  async getGroupMembers(groupId: string): Promise<any[]> {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  async joinGroup(groupId: string): Promise<any> {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  async addGroupMember(groupId: string, data: { userId?: string; email?: string; isLeader?: boolean }): Promise<any> {
    const response = await api.post(`/groups/${groupId}/members`, data);
    return response.data;
  },

  async removeGroupMember(groupId: string, memberId: string): Promise<any> {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },

  async applyToGroup(groupId: string, message?: string): Promise<any> {
    const response = await api.post(`/groups/${groupId}/applications`, { message });
    return response.data;
  },

  async inviteToGroup(groupId: string, data: {
    userId?: string;
    email?: string;
    identifier?: string;
    studentCode?: string;
    message?: string;
  }): Promise<any> {
    const response = await api.post(`/groups/${groupId}/invites`, data);
    return response.data;
  },

  async acceptInvite(inviteId: string): Promise<any> {
    const response = await api.post(`/invites/${inviteId}/accept`);
    return response.data;
  },

  async declineInvite(inviteId: string): Promise<any> {
    const response = await api.post(`/invites/${inviteId}/decline`);
    return response.data;
  },

  async approveApplication(applicationId: string): Promise<any> {
    const response = await api.post(`/applications/${applicationId}/approve`);
    return response.data;
  },

  async rejectApplication(applicationId: string, reason?: string): Promise<any> {
    const response = await api.post(`/applications/${applicationId}/reject`, { reason });
    return response.data;
  },

  async getMyGroups(userId: string): Promise<StudentGroup[]> {
    const response = await api.get('/groups', {
      params: { memberId: userId },
    });
    return response.data.content || response.data;
  },
};
