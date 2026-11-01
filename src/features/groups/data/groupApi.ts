import api from '@/services/api';
import type { FormationWindow, GroupMember, GroupRequest, JoinRequest, LeaveRequest, Page, StudentGroup, Vote, VoteType } from '../domain/models';
const id = (value: string) => { if (!value.trim()) throw new Error('Thiếu định danh cho thao tác.'); return encodeURIComponent(value); };
export const groupApi = {
  list: (page = 0, available = false, signal?: AbortSignal) => api.get<Page<StudentGroup>>('/groups', { params: { page, size: 20, available }, signal }).then(r => r.data),
  get: (groupId: string, signal?: AbortSignal) => api.get<StudentGroup>(`/groups/${id(groupId)}`, { signal }).then(r => r.data),
  window: (semester: string, signal?: AbortSignal) => api.get<FormationWindow>('/me/formation-window', { params: { semester }, signal }).then(r => r.data),
  create: (data: GroupRequest) => api.post<StudentGroup>('/groups', data).then(r => r.data),
  lock: (groupId: string, locked: boolean) => api.post<StudentGroup>(`/groups/${id(groupId)}/${locked ? 'lock' : 'unlock'}`).then(r => r.data),
  kick: (groupId: string, memberId: string) => api.delete(`/groups/${id(groupId)}/members/${id(memberId)}`),
  apply: (groupId: string, message: string) => api.post<JoinRequest>(`/groups/${id(groupId)}/applications`, { message }).then(r => r.data),
  invite: (groupId: string, studentCode: string, message: string) => api.post<JoinRequest>(`/groups/${id(groupId)}/invites`, { studentCode, message }).then(r => r.data),
  applications: (groupId: string, signal?: AbortSignal) => api.get<JoinRequest[]>(`/groups/${id(groupId)}/applications`, { signal }).then(r => r.data),
  invitations: (groupId: string, signal?: AbortSignal) => api.get<JoinRequest[]>(`/groups/${id(groupId)}/invites`, { signal }).then(r => r.data),
  myApplications: (signal?: AbortSignal) => api.get<JoinRequest[]>('/me/applications', { signal }).then(r => r.data),
  myInvitations: (signal?: AbortSignal) => api.get<JoinRequest[]>('/me/invites', { signal }).then(r => r.data),
  approveApplication: (requestId: string) => api.post<JoinRequest>(`/applications/${id(requestId)}/approve`).then(r => r.data),
  rejectApplication: (requestId: string, reason: string) => api.post<JoinRequest>(`/applications/${id(requestId)}/reject`, { reason }).then(r => r.data),
  withdrawApplication: (requestId: string) => api.post<JoinRequest>(`/applications/${id(requestId)}/withdraw`).then(r => r.data),
  acceptInvitation: (requestId: string) => api.post<GroupMember>(`/invites/${id(requestId)}/accept`).then(r => r.data),
  declineInvitation: (requestId: string) => api.post<JoinRequest>(`/invites/${id(requestId)}/decline`).then(r => r.data),
  revokeInvitation: (requestId: string) => api.post<JoinRequest>(`/invites/${id(requestId)}/revoke`).then(r => r.data),
  vote: (requestId: string, vote: VoteType, comment: string) => api.post<Vote>(`/applications/${id(requestId)}/votes`, { vote, comment }).then(r => r.data),
  votes: (requestId: string, signal?: AbortSignal) => api.get<Vote[]>(`/applications/${id(requestId)}/votes`, { signal }).then(r => r.data),
  requestLeave: (groupId: string, reason: string) => api.post<LeaveRequest>(`/groups/${id(groupId)}/leave-requests`, { reason }).then(r => r.data),
  leaves: (groupId: string, signal?: AbortSignal) => api.get<LeaveRequest[]>(`/groups/${id(groupId)}/leave-requests`, { signal }).then(r => r.data),
  decideLeave: (requestId: string, approve: boolean) => api.post<LeaveRequest>(`/leave-requests/${id(requestId)}/${approve ? 'approve' : 'reject'}`).then(r => r.data),
  withdrawLeave: (requestId: string) => api.post<LeaveRequest>(`/leave-requests/${id(requestId)}/withdraw`).then(r => r.data),
};
