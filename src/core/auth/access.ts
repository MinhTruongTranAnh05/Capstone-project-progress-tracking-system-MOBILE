import type { User } from '@/types/auth';
import { SessionError } from '@/services/apiError';

type SessionUser = Pick<User, 'role' | 'status'> | null | undefined;

export function canUseStudentFeatures(user: SessionUser) {
  return user?.status === 'ACTIVE' && user.role === 'STUDENT';
}

export function canUseStaffSession(user: SessionUser) {
  return user?.status === 'ACTIVE' && (user.role === 'ADMIN' || user.role === 'LECTURER');
}

export function getSessionDestination(user: SessionUser) {
  if (canUseStudentFeatures(user)) return '/(tabs)' as const;
  if (canUseStaffSession(user)) return '/staff' as const;
  return '/(auth)/login' as const;
}

export function requireLoginMethod(user: User, method: 'google' | 'password') {
  if (method === 'password' && user.role === 'STUDENT') {
    throw new SessionError('GOOGLE_LOGIN_REQUIRED', 'Students must sign in with Google');
  }
  if (method === 'google' && user.role !== 'STUDENT') {
    throw new SessionError('PASSWORD_LOGIN_REQUIRED', 'Admin and Moderator use email and password');
  }
}
