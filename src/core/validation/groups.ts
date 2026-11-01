import { z } from 'zod';
export const groupSchema = z.object({ semester: z.string().trim().min(1, 'Vui lòng nhập học kỳ.'), groupCode: z.string().trim().optional() });
export const messageSchema = z.string().trim().max(1000, 'Nội dung tối đa 1000 ký tự.');
export const invitationSchema = z.object({ studentCode: z.string().trim().min(1, 'Vui lòng nhập MSSV.'), message: messageSchema });
export const profileSchema = z.object({ bio: z.string().max(1000, 'Giới thiệu tối đa 1000 ký tự.'), skills: z.string().max(500, 'Kỹ năng tối đa 500 ký tự.') });
export const statusLabels: Record<string, string> = {
  PENDING: 'Đang chờ', APPROVED: 'Đã duyệt', ACCEPTED: 'Đã chấp nhận', REJECTED: 'Đã từ chối', WITHDRAWN: 'Đã thu hồi', EXPIRED: 'Hết hạn', CANCELLED: 'Đã hủy',
  FORMED: 'Đã thành lập', ACTIVE: 'Đang hoạt động', COMPLETED: 'Đã hoàn thành', FAILED: 'Không đạt', ARCHIVED: 'Đã lưu trữ', DRAFT: 'Bản nháp', SUBMITTED: 'Đã nộp',
};
export function formatDate(value?: string | null) { return value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : 'Chưa có'; }
