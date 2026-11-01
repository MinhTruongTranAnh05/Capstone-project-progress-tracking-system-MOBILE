export interface GoogleLoginRequest { idToken: string }
export interface PasswordLoginRequest { email: string; password: string }
export interface GoogleLoginConfig { enabled: boolean; clientId: string | null }
export interface LoginResponse { accessToken: string; tokenType: string; expiresInSeconds: number; user: User }
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  avatarUrl?: string | null;
  studentCode?: string | null;
  phone?: string | null;
  skills?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  profilePrivate: boolean;
  createdAt: string;
}
// Leadership in v2.9 belongs to a group membership, never to an account role.
export type MobileUser = User;
export interface ProfileRequest { phone: string; skills: string; strengths: string; weaknesses: string; profilePrivate: boolean }
