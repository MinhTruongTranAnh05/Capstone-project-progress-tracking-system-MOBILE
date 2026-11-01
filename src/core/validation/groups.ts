import { z } from 'zod';
export const groupSchema = z.object({ name: z.string().trim().min(1, 'Vui lòng nhập tên nhóm.').max(100, 'Tên nhóm tối đa 100 ký tự.'), wantedSkills: z.string().trim().max(500, 'Kỹ năng cần tuyển tối đa 500 ký tự.') });
export const messageSchema = z.string().trim().max(1000, 'Nội dung tối đa 1000 ký tự.');
export const applicationSchema = z.object({
  skills: z.string().trim().min(1, "Bạn cần điền đầy đủ thông tin 'Thế mạnh kỹ năng, ưu điểm & nhược điểm' ở phía trên trước khi gửi đơn ứng tuyển!"),
  message: messageSchema,
}).transform(({ skills, message }) => ({ message: message || skills }));
export const invitationSchema = z.object({ studentCode: z.string().trim().toUpperCase().min(1, 'Vui lòng nhập MSSV.'), message: messageSchema });
export const profileSchema = z.object({ phone: z.string().max(20, 'Số điện thoại tối đa 20 ký tự.'), skills: z.string().max(1000, 'Kỹ năng tối đa 1000 ký tự.'), strengths: z.string().max(1000, 'Ưu điểm tối đa 1000 ký tự.'), weaknesses: z.string().max(1000, 'Nhược điểm tối đa 1000 ký tự.'), profilePrivate: z.boolean() });
