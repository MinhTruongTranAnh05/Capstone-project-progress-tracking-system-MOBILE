import api from './api';
import type { GroupRequest, JoinRequest, LeaderTransfer, LeaveRequest, MySemester, ProfileView, StudentGroup } from '@/types/models';

const id = (value: string) => {
  if (!value) throw new Error('Thiếu định danh cho thao tác.');
  return encodeURIComponent(value);
};
export const groupService = {
  getMySemesters: (signal?: AbortSignal) => api.get<MySemester[]>('/me/semesters', { signal }).then(r => r.data),
  getGroup: (groupId: string, signal?: AbortSignal) => api.get<StudentGroup>(`/groups/${id(groupId)}`, { signal }).then(r => r.data),
  openGroups: (subjectId: string, q: string, skill: string, signal?: AbortSignal) => api.get<StudentGroup[]>(`/subjects/${id(subjectId)}/open-groups`, { params: { q, skill }, signal }).then(r => r.data),
  candidates: (subjectId: string, q: string, skill: string, signal?: AbortSignal) => api.get<ProfileView[]>(`/subjects/${id(subjectId)}/candidates`, { params: { q, skill }, signal }).then(r => r.data),
  createGroup: (subjectId: string, data: GroupRequest) => api.post<StudentGroup>(`/subjects/${id(subjectId)}/groups`, data).then(r => r.data),
  updateGroup: (groupId: string, data: GroupRequest) => api.put<StudentGroup>(`/groups/${id(groupId)}`, data).then(r => r.data),
  lock: (groupId: string, locked: boolean) => api.post<StudentGroup>(`/groups/${id(groupId)}/${locked ? 'lock' : 'unlock'}`).then(r => r.data),
  kick: (groupId: string, userId: string) => api.delete(`/groups/${id(groupId)}/members/${id(userId)}`),
  apply: (groupId: string, message: string) => api.post<JoinRequest>(`/groups/${id(groupId)}/applications`, { message }).then(r => r.data),
  invite: (groupId: string, studentCode: string, message: string) => api.post<JoinRequest>(`/groups/${id(groupId)}/invitations`, { studentCode, message }).then(r => r.data),
  requests: (groupId: string, signal?: AbortSignal) => api.get<JoinRequest[]>(`/groups/${id(groupId)}/requests`, { signal }).then(r => r.data),
  myRequests: (subjectId: string, signal?: AbortSignal) => api.get<JoinRequest[]>(`/subjects/${id(subjectId)}/my-requests`, { signal }).then(r => r.data),
  answer: (requestId: string, action: 'accept' | 'reject' | 'withdraw', reason = '') => api.post<JoinRequest>(`/requests/${id(requestId)}/${action}`, action === 'reject' ? { reason } : undefined).then(r => r.data),
  like: (requestId: string, liked: boolean) => liked ? api.put<{ likes: number }>(`/requests/${id(requestId)}/like`) : api.delete<{ likes: number }>(`/requests/${id(requestId)}/like`),
  leave: (groupId: string, reason: string) => api.post<{ left: boolean; request: LeaveRequest | null }>(`/groups/${id(groupId)}/leave`, { reason }).then(r => r.data),
  groupLeaves: (groupId: string, signal?: AbortSignal) => api.get<LeaveRequest[]>(`/groups/${id(groupId)}/leave-requests`, { signal }).then(r => r.data),
  myLeaves: (signal?: AbortSignal) => api.get<LeaveRequest[]>('/me/leave-requests', { signal }).then(r => r.data),
  decideLeave: (requestId: string, approve: boolean, note: string) => api.post<LeaveRequest>(`/leave-requests/${id(requestId)}/leader-decision`, { approve, note }).then(r => r.data),
  withdrawLeave: (requestId: string) => api.post<LeaveRequest>(`/leave-requests/${id(requestId)}/withdraw`).then(r => r.data),
  complain: (requestId: string, reason: string) => api.post<LeaveRequest>(`/leave-requests/${id(requestId)}/complaint`, { reason }).then(r => r.data),
  transfers: (signal?: AbortSignal) => api.get<LeaderTransfer[]>('/me/leader-transfers', { signal }).then(r => r.data),
  offerTransfer: (groupId: string, toUserId: string, leaveAfter: boolean) => api.post<LeaderTransfer>(`/groups/${id(groupId)}/leader-transfers`, { toUserId, leaveAfter }).then(r => r.data),
  answerTransfer: (transferId: string, action: 'accept' | 'decline' | 'cancel') => api.post<LeaderTransfer>(`/leader-transfers/${id(transferId)}/${action}`).then(r => r.data),
};
