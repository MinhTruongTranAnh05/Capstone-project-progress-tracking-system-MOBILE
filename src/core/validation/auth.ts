import { z } from 'zod';

export const passwordLoginSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Vui lòng nhập email hợp lệ.'),
  // Login preserves the password exactly, including intentional spaces.
  password: z.string().refine(value => value.trim().length > 0, 'Vui lòng nhập mật khẩu.'),
});
