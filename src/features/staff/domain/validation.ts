import { z } from 'zod';

const required = z.string().trim().min(1, 'Vui lòng nhập đầy đủ thông tin.');
export const referenceSchema = required;
export const studentUpdateSchema = z.object({ fullName: required, email: required.email(), phone: z.string().trim().max(20) });
export const deadlineSchema = z.string().datetime({ offset: true });
export const reasonSchema = required.max(1000, 'Tối đa 1000 ký tự.');
export const majorSchema = z.object({ code: required.max(20), name: required.max(255) });
export const moderatorSchema = z.object({ email: required.email('Email không hợp lệ.'), fullName: required,
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự.').max(72), phone: z.string().trim().max(20) });
export const userUpdateSchema = z.object({ fullName: required, email: required.email(), phone: z.string().trim().max(20), status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']) });
export const eligibilitySchema = z.object({ eligibility: z.enum(['UNDECIDED', 'ELIGIBLE', 'INELIGIBLE']), reason: z.string().trim().max(500) })
  .refine(data => data.eligibility !== 'INELIGIBLE' || !!data.reason, { path: ['reason'], message: 'Vui lòng nhập lý do chưa đủ điều kiện.' });
export const decisionSchema = z.object({ approve: z.boolean(), note: z.string().trim().max(1000) })
  .refine(data => data.approve || !!data.note, { path: ['note'], message: 'Vui lòng nhập lý do từ chối.' });
export const semesterSchema = z.object({ code: required, name: required, startDate: z.string().date(), endDate: z.string().date(),
  formationOpensAt: z.string().datetime({ offset: true }), defaultDeadline: z.string().datetime({ offset: true }) })
  .refine(data => data.endDate >= data.startDate, { path: ['endDate'], message: 'Ngày kết thúc phải sau ngày bắt đầu.' })
  .refine(data => Date.parse(data.defaultDeadline) > Date.parse(data.formationOpensAt), { path: ['defaultDeadline'], message: 'Hạn lập nhóm phải sau thời gian mở.' });
export const subjectSchema = z.object({ code: required, name: required, targetTerm: z.number().int().positive(), requestTtlMinutes: z.number().int().min(1).max(20160) });
export const coordinatedGroupSchema = z.object({ name: required.max(100), leaderUserId: required, memberUserIds: z.array(required).max(4) })
  .refine(data => !data.memberUserIds.includes(data.leaderUserId) && new Set(data.memberUserIds).size === data.memberUserIds.length,
    { path: ['memberUserIds'], message: 'Mỗi sinh viên chỉ được chọn một lần.' });

export function toInstant(value: string): string {
  const date = new Date(value);
  if (!z.string().datetime({ offset: true, local: true }).safeParse(value).success || !Number.isFinite(date.getTime())) throw new Error('Thời gian không hợp lệ. Dùng YYYY-MM-DDTHH:mm.');
  return date.toISOString();
}
export function toLocalDateTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
