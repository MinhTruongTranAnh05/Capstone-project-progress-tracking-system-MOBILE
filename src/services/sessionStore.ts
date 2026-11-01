import type { LoginResponse, MobileUser, User } from '../types/auth';
import { SessionError } from './apiError';
import { storage } from './storage';

export interface SessionStorage {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clear(): Promise<void>;
}

export interface SessionSnapshot {
  revision: number;
  token: string | null;
  user: MobileUser | null;
  notice: string | null;
}

export function requireMobileUser(user: User): asserts user is MobileUser {
  if (!user || typeof user.id !== 'string' || !user.id || typeof user.email !== 'string'
    || typeof user.fullName !== 'string') {
    throw new SessionError('INVALID_SESSION', 'Thông tin phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
  }
  if (user.role !== 'STUDENT') {
    throw new SessionError('WEB_ONLY', 'Vui lòng dùng phiên bản Web');
  }
  if (user.status !== 'ACTIVE') {
    throw new SessionError('ACCOUNT_INACTIVE', 'Tài khoản chưa hoạt động. Vui lòng liên hệ quản trị viên.');
  }
}

// Serialize disk mutations so a delayed save cannot resurrect a logged-out session.
export class SessionStore {
  private snapshot: SessionSnapshot = { revision: 0, token: null, user: null, notice: null };
  private listeners = new Set<() => void>();
  private writes: Promise<void> = Promise.resolve();

  constructor(private readonly disk: SessionStorage) {}

  getSnapshot = (): SessionSnapshot => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private publish(next: SessionSnapshot) {
    this.snapshot = next;
    this.listeners.forEach((listener) => listener());
  }

  private enqueue(operation: () => Promise<void>) {
    const pending = this.writes.then(operation);
    this.writes = pending.catch(() => undefined);
    return pending;
  }

  begin(): number {
    const revision = this.snapshot.revision + 1;
    this.publish({ revision, token: null, user: null, notice: null });
    return revision;
  }

  isCurrent(revision: number) { return this.snapshot.revision === revision; }

  async restoreToken(revision: number): Promise<string | null> {
    await this.writes;
    const token = await this.disk.getToken();
    if (!this.isCurrent(revision)) return null;
    this.publish({ ...this.snapshot, token });
    return token;
  }

  async accept(revision: number, session: Pick<LoginResponse, 'accessToken' | 'user'>): Promise<void> {
    if (!this.isCurrent(revision)) throw new SessionError('SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
    requireMobileUser(session.user);
    if (typeof session.accessToken !== 'string' || !session.accessToken.trim()) {
      throw new SessionError('INVALID_SESSION', 'Thông tin phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    }
    try {
      await this.enqueue(async () => {
        if (!this.isCurrent(revision)) return;
        await this.disk.setToken(session.accessToken);
      });
    } catch {
      await this.invalidate(revision, 'Không thể lưu phiên đăng nhập. Vui lòng thử lại.');
      throw new SessionError('SESSION_STORAGE', 'Không thể lưu phiên đăng nhập. Vui lòng thử lại.');
    }
    if (!this.isCurrent(revision)) throw new SessionError('SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
    this.publish({ revision, token: session.accessToken, user: session.user, notice: null });
  }

  async invalidate(revision: number, notice: string | null = null): Promise<void> {
    if (!this.isCurrent(revision)) return;
    this.publish({ revision: revision + 1, token: null, user: null, notice });
    try {
      await this.enqueue(() => this.disk.clear());
    } catch {
      if (this.isCurrent(revision + 1)) {
        this.publish({ ...this.snapshot, notice: 'Không thể xóa phiên đã lưu. Vui lòng thử đăng xuất lại.' });
      }
    }
  }
}

export const sessionStore = new SessionStore(storage);
