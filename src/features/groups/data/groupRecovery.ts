import { groupApi } from './groupApi';
import { SessionError } from '@/services/apiError';
import type { MySemester } from '../domain/models';

export function selectScope(semesters: MySemester[], requestedScope?: string, knownGroupId?: string | null) {
  const rows = semesters.flatMap(semester => semester.subjects.map(subject => ({ semester, subject })));
  return rows.find(row => row.subject.scopeId === requestedScope)
    ?? rows.find(row => !!knownGroupId && row.subject.group?.id === knownGroupId)
    ?? rows[0];
}

export async function loadVerifiedGroup(groupId: string, userId: string, scopeId: string, signal?: AbortSignal) {
  const group = await groupApi.getGroup(groupId, signal);
  if (group.scopeId !== scopeId || !group.members.some(member => member.userId === userId)) {
    throw new SessionError('GROUP_MEMBERSHIP_MISSING', 'Không xác minh được tư cách thành viên của bạn trong nhóm đã lưu. Vui lòng làm mới hoặc liên hệ người điều phối.');
  }
  return group;
}
