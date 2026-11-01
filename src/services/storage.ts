import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
export const storage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  async clear(): Promise<void> {
    // Also erase cache keys from the previous client version. Profiles stay in memory only.
    await Promise.all([TOKEN_KEY, 'user', 'rememberedEmail'].map(key => SecureStore.deleteItemAsync(key)));
  },
};
