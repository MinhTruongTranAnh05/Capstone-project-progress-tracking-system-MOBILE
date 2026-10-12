import api from './api';

export interface ProgressTaskRequest {
  title: string;
  description?: string;
  status?: string;
}

export interface ProgressReportRequest {
  weekNumber: number;
  progressPercentage: number;
  summary?: string;
  blockers?: string;
  nextWeekPlan?: string;
  tasks?: ProgressTaskRequest[];
}

export interface ProgressReportResponse {
  id: string;
  groupId: string;
  weekNumber: number;
  progressPercentage: number;
  summary?: string;
  blockers?: string;
  nextWeekPlan?: string;
  tasks?: any[];
  totalTasks: number;
  doneTasks: number;
  submittedById: string;
  submittedByName: string;
  instructorFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const progressService = {
  async getProgressReports(groupId: string): Promise<any> {
    const response = await api.get(`/groups/${groupId}/progress`);
    return response.data;
  },

  async submitProgress(groupId: string, data: ProgressReportRequest): Promise<ProgressReportResponse> {
    const response = await api.post<ProgressReportResponse>(`/groups/${groupId}/progress`, data);
    return response.data;
  },

  async updateProgress(reportId: string, data: ProgressReportRequest): Promise<ProgressReportResponse> {
    const response = await api.put<ProgressReportResponse>(`/progress/${reportId}`, data);
    return response.data;
  },

  async giveFeedback(reportId: string, feedback: string): Promise<ProgressReportResponse> {
    const response = await api.put<ProgressReportResponse>(`/progress/${reportId}/feedback`, { feedback });
    return response.data;
  },
};
