import { User } from '@/types/auth';

// SecureStore is native-only. Keep the same session API for the Expo web app.
export const storage = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('accessToken');
  },
  async setToken(token: string): Promise<void> {
    localStorage.setItem('accessToken', token);
  },
  async removeToken(): Promise<void> {
    localStorage.removeItem('accessToken');
  },
  async getUser(): Promise<User | null> {
    try {
      const value = localStorage.getItem('user');
      return value ? JSON.parse(value) : null;
    } catch { return null; }
  },
  async setUser(user: User): Promise<void> {
    localStorage.setItem('user', JSON.stringify(user));
  },
  async removeUser(): Promise<void> {
    localStorage.removeItem('user');
  },
  async getRememberedEmail(): Promise<string | null> {
    try { return localStorage.getItem('rememberedEmail'); } catch { return null; }
  },
  async setRememberedEmail(email: string | null): Promise<void> {
    if (email) localStorage.setItem('rememberedEmail', email);
    else localStorage.removeItem('rememberedEmail');
  },
  async clear(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};
