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
  GOOGLE_LOGIN_REQUIRED: 'Sinh viên vui lòng đăng nhập bằng Google.',
  NOT_ON_LIST: 'Email của bạn chưa có trong danh sách import của nhà trường. Vui lòng liên hệ quản trị viên.',
  STUDENT_GOOGLE_EMAIL_REQUIRED: 'Vui lòng dùng email Google trong danh sách phòng đào tạo, không dùng tài khoản @fpt.edu.vn.',
  PASSWORD_LOGIN_REQUIRED: 'Vui lòng dùng phiên bản Web để đăng nhập Quản trị / Điều phối.',
  GOOGLE_SIGN_IN_FAILED: 'Xác thực Google thất bại. Vui lòng thử lại.',
  ACCOUNT_NOT_PROVISIONED: 'Tài khoản chưa được cấp. Vui lòng liên hệ quản trị viên.',
  CAMPUS_MISMATCH: 'Cơ sở đã chọn không khớp với tài khoản. Vui lòng chọn lại cơ sở.',
  WORKSPACE_REQUIRED: 'Vui lòng sử dụng tài khoản Google Workspace của trường.',
  GOOGLE_NOT_CONFIGURED: 'Hệ thống chưa cấu hình đăng nhập Google. Vui lòng liên hệ quản trị viên.',
  GROUP_FULL: 'Nhóm đã đủ 5 thành viên. Không thể thêm thành viên.',
  GROUP_LOCKED: 'Nhóm đã khóa và không nhận đơn Apply mới.',
  TOO_MANY_APPLIES: 'Bạn đã có 3 đơn Apply đang chờ. Hãy thu hồi một đơn hoặc chờ phản hồi.',
  READ_ONLY_SEMESTER: 'Học kỳ trước chỉ được xem.',
  NOT_ELIGIBLE: 'Bạn chưa đủ điều kiện thực hiện thao tác trong môn học này.',
  REQUEST_CLOSED: 'Yêu cầu đã đóng hoặc hết hạn. Vui lòng làm mới dữ liệu.',
  DUPLICATE_REQUEST: 'Đã có yêu cầu đang chờ. Vui lòng kiểm tra danh sách yêu cầu.',
  OTHER_MAJOR: 'Chỉ được lập nhóm trong cùng chuyên ngành.',
  ALREADY_IN_GROUP: 'Sinh viên đã có nhóm trong môn học này.',
  LEADER_MUST_TRANSFER: 'Nhóm đang khóa. Hãy chuyển trưởng nhóm hoặc mở khóa trước khi rời.',
  SCOPE_NOT_OPEN: 'Đợt lập nhóm chưa mở hoặc đã hết hạn.',
  TRANSFER_PENDING: 'Đã có đề nghị chuyển trưởng nhóm đang chờ phản hồi.',
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
