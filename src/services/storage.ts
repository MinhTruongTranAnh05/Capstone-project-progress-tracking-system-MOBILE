import * as SecureStore from 'expo-secure-store';
import { config } from '@/constants/config';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getUser(): Promise<any | null> {
    try {
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
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
    await this.removeToken();
    await this.removeUser();
  },
};
