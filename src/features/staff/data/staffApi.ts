import api from '@/services/api';
import { sessionStore } from '@/services/sessionStore';
import { canUseStaffSession } from '@/core/auth/access';
import { SessionError } from '@/services/apiError';
import { coordinatedGroupSchema, deadlineSchema, decisionSchema, eligibilitySchema, majorSchema, moderatorSchema, reasonSchema, referenceSchema, semesterSchema, studentUpdateSchema, subjectSchema, userUpdateSchema } from '../domain/validation';
import type { ExportCheck, FinalizeCheck, GroupFilter, ImportReport, LeaveRequest, Major, Page, PageFilter, Scope, Semester, SemesterInput, Statistics, StudentFilter, StudentGroup, StudentRow, Subject, User } from '../domain/models';

const id = (value: string) => {
  if (!value.trim()) throw new Error('Thiếu định danh cho thao tác.');
  return encodeURIComponent(value.trim());
};
function requireStaff(adminOnly = false) {
  const { user } = sessionStore.getSnapshot();
  if (!canUseStaffSession(user) || (adminOnly && user?.role !== 'ADMIN')) throw new SessionError('FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này.');
}
const get = <T>(path: string, params?: object, signal?: AbortSignal, adminOnly = false) => {
  requireStaff(adminOnly);
  return api.get<T>(path, { params, signal }).then(r => r.data);
};
const post = <T>(path: string, data?: unknown, adminOnly = false) => {
  requireStaff(adminOnly);
  return api.post<T>(path, data).then(r => r.data);
};
const put = <T>(path: string, data: unknown, adminOnly = false) => {
  requireStaff(adminOnly);
  return api.put<T>(path, data).then(r => r.data);
};

export const staffApi = {
  semesters: (params?: { q?: string; moderatedByMe?: boolean; sort?: string; direction?: 'asc' | 'desc' }, signal?: AbortSignal) => get<Semester[]>('/semesters', params, signal),
  createSemester: (data: SemesterInput) => post<Semester>('/semesters', semesterSchema.parse(data), true),
  updateSemester: (code: string, data: SemesterInput) => put<Semester>(`/semesters/${id(code)}`, semesterSchema.parse(data), true),
  deleteSemester: (code: string) => { requireStaff(true); return api.delete(`/semesters/${id(code)}`); },
  assignModerator: (code: string, moderatorId: string) => put<Semester>(`/semesters/${id(code)}/moderator`, { moderatorId: moderatorId || null }, true),
  subjects: (semester: string, signal?: AbortSignal) => get<Subject[]>(`/semesters/${id(semester)}/subjects`, undefined, signal),
  updateSubject: (subjectId: string, data: { code: string; name: string; targetTerm: number; requestTtlMinutes: number }) => put<Subject>(`/subjects/${id(subjectId)}`, subjectSchema.parse(data), true),
  majors: (signal?: AbortSignal) => get<Major[]>('/majors', undefined, signal),
  createMajor: (data: { code: string; name: string }) => post<Major>('/majors', majorSchema.parse(data), true),
  updateMajor: (majorId: string, data: { code: string; name: string }) => put<Major>(`/majors/${id(majorId)}`, majorSchema.parse(data), true),
  users: (params: PageFilter & { role?: User['role'] }, signal?: AbortSignal) => get<Page<User>>('/users', params, signal, true),
  createModerator: (data: { email: string; fullName: string; password: string; phone: string }) => post<User>('/users/moderators', moderatorSchema.parse(data), true),
  updateUser: (userId: string, data: { fullName: string; email: string; phone: string; status: User['status'] }) => put<User>(`/users/${id(userId)}`, userUpdateSchema.parse(data), true),
  resetPassword: (userId: string, password: string) => {
    if (password.length < 8 || password.length > 72) throw new Error('Mật khẩu cần từ 8 đến 72 ký tự.');
    return put<void>(`/users/${id(userId)}/password`, { password }, true);
  },
  students: (semester: string, params?: StudentFilter, signal?: AbortSignal) => get<Page<StudentRow>>(`/semesters/${id(semester)}/students`, params, signal),
  updateStudent: (semesterStudentId: string, data: { fullName: string; email: string; phone: string }) => put<StudentRow>(`/semester-students/${id(semesterStudentId)}`, studentUpdateSchema.parse(data), true),
  eligibility: (enrollmentId: string, data: { eligibility: StudentRow['eligibility']; reason: string }) => put<StudentRow>(`/enrollments/${id(enrollmentId)}/eligibility`, eligibilitySchema.parse(data), true),
  importFile: (semester: string, kind: 'students' | 'eligibility', file: FormData, preview: boolean) => {
    requireStaff(true);
    return api.post<ImportReport>(`/semesters/${id(semester)}/imports/${kind}${preview ? '/preview' : ''}`, file,
      { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  groups: (semester: string, params?: GroupFilter, signal?: AbortSignal) => get<Page<StudentGroup>>(`/semesters/${id(semester)}/groups`, params, signal),
  group: (groupId: string, signal?: AbortSignal) => get<StudentGroup>(`/groups/${id(groupId)}`, undefined, signal),
  statistics: (semester: string, params?: { subjectId?: string; majorId?: string }, signal?: AbortSignal) => get<Statistics>(`/semesters/${id(semester)}/statistics`, params, signal),
  exportCheck: (semester: string) => get<ExportCheck>(`/semesters/${id(semester)}/export-check`),
  exportExcel: (semester: string, params?: { subjectId?: string; majorId?: string }) => {
    requireStaff();
    return api.get<ArrayBuffer>(`/semesters/${id(semester)}/export`, { params, responseType: 'arraybuffer' });
  },
  scopes: (semester: string, signal?: AbortSignal) => get<Scope[]>(`/semesters/${id(semester)}/scopes`, undefined, signal),
  setDeadline: (scopeId: string, deadline: string | null) => put<Scope>(`/scopes/${id(scopeId)}/deadline`, { deadline: deadline === null ? null : deadlineSchema.parse(deadline) }),
  extend: (scopeId: string, deadline: string) => post<Scope>(`/scopes/${id(scopeId)}/extend`, { deadline: deadlineSchema.parse(deadline) }),
  finalizeCheck: (scopeId: string) => get<FinalizeCheck>(`/scopes/${id(scopeId)}/finalize-check`),
  finalize: (scopeId: string) => post<Scope>(`/scopes/${id(scopeId)}/finalize`),
  reopen: (scopeId: string, reason: string) => post<Scope>(`/scopes/${id(scopeId)}/reopen`, { reason: reasonSchema.parse(reason) }),
  createGroup: (scopeId: string, data: { name: string; leaderUserId: string; memberUserIds: string[] }) => post<StudentGroup>(`/scopes/${id(scopeId)}/groups`, coordinatedGroupSchema.parse(data)),
  add: (groupId: string, userId: string) => post<StudentGroup>(`/groups/${id(groupId)}/moderation/add`, { userId: referenceSchema.parse(userId) }),
  move: (targetGroupId: string, userId: string) => post<StudentGroup>(`/groups/${id(targetGroupId)}/moderation/move`, { userId: referenceSchema.parse(userId) }),
  remove: (groupId: string, userId: string, reason: string) => post<StudentGroup>(`/groups/${id(groupId)}/moderation/remove`, { userId: referenceSchema.parse(userId), reason: reasonSchema.parse(reason) }),
  merge: (targetGroupId: string, sourceGroupId: string) => post<StudentGroup>(`/groups/${id(targetGroupId)}/moderation/merge`, { sourceGroupId: referenceSchema.parse(sourceGroupId) }),
  appointLeader: (groupId: string, userId: string) => post<StudentGroup>(`/groups/${id(groupId)}/moderation/leader`, { userId: referenceSchema.parse(userId) }),
  dissolve: (groupIds: string[], reason: string) => {
    if (!groupIds.length) throw new Error('Chưa chọn nhóm cần giải tán.');
    return post<{ dissolved: number }>('/moderation/dissolve', { groupIds: [...new Set(groupIds.map(value => referenceSchema.parse(value)))], reason: reasonSchema.parse(reason) });
  },
  complaints: (subjectId: string, scopeId?: string, signal?: AbortSignal) => get<LeaveRequest[]>(`/subjects/${id(subjectId)}/complaints`, { scopeId }, signal),
  decideLeave: (requestId: string, approve: boolean, note: string) => post<LeaveRequest>(`/leave-requests/${id(requestId)}/moderator-decision`, decisionSchema.parse({ approve, note })),
};
