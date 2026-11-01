import { MAX_GROUP_MEMBERS } from './group';
import type { JoinRequest, MySemester, MySubject, StudentGroup } from '@/types/models';

export const PHASE_LABELS = { PREPARING: 'Đang chuẩn bị', OPEN: 'Đang mở', LOCKED: 'Đã khóa', FINALIZED: 'Đã chốt danh sách' };
export const GROUP_LABELS = { OPEN: 'Đang tuyển thành viên', FULL: 'Đủ thành viên', LOCKED: 'Đã khóa', DISSOLVED: 'Đã giải thể' };
export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Đang chờ', ACCEPTED: 'Đã chấp nhận', REJECTED: 'Đã từ chối', WITHDRAWN: 'Đã thu hồi', EXPIRED: 'Hết hạn', CANCELLED: 'Đã hủy',
  PENDING_LEADER: 'Chờ trưởng nhóm', PENDING_MODERATOR: 'Chờ điều phối viên', APPROVED: 'Đã duyệt', CLOSED: 'Đã đóng', DECLINED: 'Đã từ chối',
};
export function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : 'Chưa có';
}
export function canParticipate(semester?: MySemester, subject?: MySubject) {
  return !!semester && !!subject && !semester.readOnly && subject.eligibility !== 'INELIGIBLE';
}
export function canRecruit(semester?: MySemester, subject?: MySubject, now = Date.now()) {
  return canParticipate(semester, subject) && !!subject?.canAct && subject.phase === 'OPEN'
    && (!subject.deadline || new Date(subject.deadline).getTime() > now);
}
export function canInvite(group?: StudentGroup | null) {
  return !!group && group.state !== 'DISSOLVED' && !group.finalized && !group.full && group.size < MAX_GROUP_MEMBERS;
}
export function isPending(request: JoinRequest, now = Date.now()) {
  return request.status === 'PENDING' && new Date(request.expiresAt).getTime() > now;
}
