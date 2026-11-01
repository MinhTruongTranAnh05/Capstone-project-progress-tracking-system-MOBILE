export const storage = {
  async getKnownGroup(userId: string): Promise<string | null> { return localStorage.getItem('known-group.' + userId); },
  async setKnownGroup(userId: string, groupId: string | null): Promise<void> { if (groupId === null) localStorage.removeItem('known-group.' + userId); else localStorage.setItem('known-group.' + userId, groupId); },
  async getToken(): Promise<string | null> { return localStorage.getItem('accessToken'); },
  async setToken(token: string): Promise<void> { localStorage.setItem('accessToken', token); },
  async clear(): Promise<void> {
    ['accessToken', 'user', 'rememberedEmail'].forEach(key => localStorage.removeItem(key));
  },
};
