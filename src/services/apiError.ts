import axios from 'axios';

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  errorCode?: string;
  message?: string;
  path?: string;
  fieldErrors?: { field: string; message: string }[];
}

export class SessionError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'SessionError';
  }
}

const messages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ quản trị viên.',
  ACCOUNT_PENDING_APPROVAL: 'Tài khoản đang chờ quản trị viên phê duyệt.',
  GOOGLE_LOGIN_REQUIRED: 'Vui lòng đăng nhập bằng tài khoản Google của trường.',
  REGISTRATION_REQUIRED: 'Vui lòng đăng ký với MSSV và chờ quản trị viên duyệt trước khi đăng nhập.',
  ACCOUNT_NOT_PROVISIONED: 'Tài khoản chưa được cấp. Vui lòng liên hệ quản trị viên.',
  CAMPUS_MISMATCH: 'Cơ sở đã chọn không khớp với tài khoản. Vui lòng chọn lại cơ sở.',
  WORKSPACE_REQUIRED: 'Vui lòng sử dụng tài khoản Google Workspace của trường.',
  GOOGLE_NOT_CONFIGURED: 'Hệ thống chưa cấu hình đăng nhập Google. Vui lòng liên hệ quản trị viên.',
};

export function getErrorMessage(error: unknown, fallback = 'Không thể thực hiện thao tác. Vui lòng thử lại.'): string {
  if (error instanceof SessionError) return error.message;
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'Kết nối quá thời gian chờ. Vui lòng thử lại.'
        : 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.';
    }
    const data = error.response.data;
    return messages[data?.errorCode ?? ''] || data?.message || fallback;
  }
  return fallback;
}
