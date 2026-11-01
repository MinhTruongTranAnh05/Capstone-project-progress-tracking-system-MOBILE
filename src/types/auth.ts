import type { campuses } from '@/core/validation/auth';
export type Campus = typeof campuses[number];
export type Role = 'ADMIN' | 'INSTRUCTOR' | 'COUNCIL' | 'GROUP_LEADER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
export interface GoogleLoginRequest { idToken: string; campus: Campus }
export interface GoogleLoginConfig { enabled: boolean; clientId?: string | null }
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest extends LoginRequest { fullName: string; studentCode: string; campus: Campus }
export interface RegisterResponse { id: string; email: string; status: UserStatus; message: string }
export interface LoginResponse { accessToken: string; tokenType: string; expiresInSeconds: number; user: User }
export interface User {
  id: string; email: string; fullName: string; role: Role; status: UserStatus;
  avatarUrl?: string | null; studentCode?: string | null; campus?: Campus | null;
  eligible: boolean; ineligibleReason?: string | null; bio?: string | null; skills?: string | null;
  selfRegistered: boolean; rejectionReason?: string | null; importedAt?: string | null; createdAt: string;
}
export type MobileUser = Omit<User, 'role'> & { role: 'STUDENT' | 'GROUP_LEADER' };
export interface ProfileRequest { bio: string; skills: string }
