import type { User } from '@/types/auth';
export const adminPages = [
  { key: 'monitoring', label: 'Giám sát tổng quan', icon: '📊', section: 'Điều hành chung' },
  { key: 'majors', label: 'Chuyên ngành', icon: '🏛️', section: 'Quản lý học kỳ & sinh viên' },
  { key: 'eligibility', label: 'Import Sinh viên & Điều kiện', icon: '📂' },
  { key: 'semesters', label: 'Quản lý học kỳ', icon: '🗓️' },
  { key: 'accounts', label: 'Tài khoản', icon: '👤' },
  { key: 'leader-leave', label: 'Yêu cầu rời nhóm', icon: '🙋' },
  { key: 'groups', label: 'Danh sách nhóm', icon: '👥' },
  { key: 'profile', label: 'Hồ sơ cá nhân', icon: '⚙️', section: 'Cá nhân' },
] as const;
export const moderatorPages = [
  { key: 'groups', label: 'Điều phối & Nhóm', icon: '👥', section: 'Điều phối & Nhóm' },
  { key: 'leave-requests', label: 'Khiếu nại rời nhóm', icon: '📨' },
  { key: 'scopes', label: 'Phạm vi & Thời hạn ngành', icon: '🗓️' },
  { key: 'group-control', label: 'Điều phối chi tiết nhóm', icon: '🔧' },
  { key: 'profile', label: 'Hồ sơ cá nhân', icon: '⚙️', section: 'Cá nhân' },
] as const;
export type StaffSection = (typeof adminPages | typeof moderatorPages)[number]['key'];
export function getStaffNavigation(role: User['role']) { return role === 'ADMIN' ? adminPages : role === 'LECTURER' ? moderatorPages : []; }
export function getStaffSection(role: User['role'], requested?: string): StaffSection | null {
  const pages = getStaffNavigation(role);
  return pages.find(page => page.key === requested)?.key ?? pages[0]?.key ?? null;
}
