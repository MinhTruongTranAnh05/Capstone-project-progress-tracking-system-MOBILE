export const storage = {
  async getToken(): Promise<string | null> { return localStorage.getItem('accessToken'); },
  async setToken(token: string): Promise<void> { localStorage.setItem('accessToken', token); },
  async clear(): Promise<void> {
    ['accessToken', 'user', 'rememberedEmail'].forEach(key => localStorage.removeItem(key));
  },
};
