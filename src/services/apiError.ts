import axios from 'axios';
import { ZodError } from 'zod';
export interface ApiErrorBody { timestamp?: string; status?: number; errorCode?: string; message?: string; path?: string; fieldErrors?: { field: string; message: string }[] }
export class SessionError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'SessionError'; }
}
const messages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  GOOGLE_LOGIN_REQUIRED: 'Vui lòng đăng nhập bằng tài khoản Google của trường. Tài khoản tự đăng ký cần được phê duyệt.',
  ACCOUNT_PENDING_APPROVAL: 'Tài khoản đang chờ quản trị viên phê duyệt.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ quản trị viên.',
  CAMPUS_MISMATCH: 'Cơ sở đã chọn không khớp với tài khoản. Vui lòng chọn lại cơ sở.',
  WORKSPACE_REQUIRED: 'Vui lòng sử dụng tài khoản Google Workspace của trường.',
  ACCOUNT_NOT_PROVISIONED: 'Tài khoản chưa được cấp. Vui lòng liên hệ quản trị viên.',
  REGISTRATION_REQUIRED: 'Email cá nhân cần đăng ký bằng MSSV và được phê duyệt trước.',
};
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ZodError) return Object.fromEntries(error.issues.map(issue => [issue.path.join('.'), issue.message]));
  if (axios.isAxiosError<ApiErrorBody>(error)) return Object.fromEntries((error.response?.data?.fieldErrors ?? []).map(field => [field.field, field.message]));
  return {};
}
export function getErrorMessage(error: unknown, fallback = 'Không thể thực hiện thao tác. Vui lòng thử lại.'): string {
  if (error instanceof SessionError) return error.message;
  if (error instanceof ZodError) return error.issues.map(issue => issue.message).join('\n');
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return error.code === 'ECONNABORTED' ? 'Kết nối quá thời gian chờ. Vui lòng thử lại.' : 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.';
    const body = error.response.data;
    const details = body?.fieldErrors?.map(field => field.message).join('\n');
    return details || messages[body?.errorCode ?? ''] || body?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
