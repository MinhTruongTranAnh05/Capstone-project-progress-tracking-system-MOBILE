import api from './api';

export interface DocumentItem {
  id: string;
  title: string;
  url?: string;
  fileUrl?: string;
  fileType?: string;
  milestoneId?: string;
  status?: string;
  version?: number;
  submittedAt?: string;
  createdAt?: string;
}

export interface SubmitDocumentRequest {
  title: string;
  url: string;
  milestoneId?: string;
}

export const documentService = {
  async getGroupDocuments(groupId: string): Promise<any> {
    const response = await api.get(`/groups/${groupId}/documents`);
    return response.data;
  },

  async submitDocumentLink(groupId: string, data: SubmitDocumentRequest): Promise<any> {
    const response = await api.post(`/groups/${groupId}/documents`, data);
    return response.data;
  },

  async downloadDocumentFile(documentId: string): Promise<any> {
    const response = await api.get(`/documents/${documentId}/file`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
