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
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

// Preserve the current wire contract at this boundary until Backend renames the field.
interface ProgressReportApiResponse extends Omit<ProgressReportResponse, 'feedback'> {
  instructorFeedback?: string;
}

function normalizeReport(report: ProgressReportApiResponse): ProgressReportResponse {
  const { instructorFeedback, ...data } = report;
  return { ...data, feedback: instructorFeedback };
}

export const progressService = {
  async getProgressReports(groupId: string): Promise<any> {
    const response = await api.get<ProgressReportApiResponse[]>(`/groups/${groupId}/progress`);
    return response.data.map(normalizeReport);
  },

  async submitProgress(groupId: string, data: ProgressReportRequest): Promise<ProgressReportResponse> {
    const response = await api.post<ProgressReportApiResponse>(`/groups/${groupId}/progress`, data);
    return normalizeReport(response.data);
  },

  async updateProgress(reportId: string, data: ProgressReportRequest): Promise<ProgressReportResponse> {
    const response = await api.put<ProgressReportApiResponse>(`/progress/${reportId}`, data);
    return normalizeReport(response.data);
  },

};
