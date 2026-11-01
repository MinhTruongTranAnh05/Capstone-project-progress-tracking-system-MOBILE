import axios from 'axios';
import { ZodError } from 'zod';
export interface ApiErrorBody { timestamp?: string; status?: number; errorCode?: string; message?: string; path?: string; fieldErrors?: { field: string; message: string }[] }
export class SessionError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'SessionError'; }
}
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
    return body?.message ? (details ? body.message + '\n' + details : body.message) : details || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
