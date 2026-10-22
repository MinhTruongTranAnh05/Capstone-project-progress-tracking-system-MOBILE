import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const storage = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    try {
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getRememberedEmail(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('rememberedEmail');
    } catch {
      return null;
    }
  },

  async setRememberedEmail(email: string | null): Promise<void> {
    if (email) {
      await SecureStore.setItemAsync('rememberedEmail', email);
    } else {
      await SecureStore.deleteItemAsync('rememberedEmail');
    }
  },

  async clear(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeUser()]);
  },
};
