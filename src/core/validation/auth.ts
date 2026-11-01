import { z } from 'zod';

export const campuses = ['HA_NOI', 'HO_CHI_MINH', 'DA_NANG', 'CAN_THO', 'QUY_NHON'] as const;
export const campusLabels = { HA_NOI: 'Hà Nội', HO_CHI_MINH: 'TP. Hồ Chí Minh', DA_NANG: 'Đà Nẵng', CAN_THO: 'Cần Thơ', QUY_NHON: 'Quy Nhơn' };
export const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ! Vui lòng nhập đúng dạng email.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});
export const registrationSchema = loginSchema.extend({
  email: z.string().trim().email('Email không hợp lệ! Vui lòng nhập đúng dạng email.').max(255),
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên.').max(255),
  password: z.string().min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự!').max(100, 'Mật khẩu tối đa 100 ký tự.'),
  studentCode: z.string().trim().regex(/^[A-Za-z]{2}\d{5,6}$/, 'MSSV phải có dạng SE160368.').transform(value => value.toUpperCase()),
  campus: z.enum(campuses),
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'Vui lòng đồng ý với Điều khoản sử dụng!' }) }),
}).refine(value => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'Mật khẩu xác nhận không khớp!' });
