import axios, { AxiosError } from 'axios';
import { config } from '@/constants/config';
import { SessionError } from './apiError';
import { sessionStore } from './sessionStore';

declare module 'axios' {
  interface AxiosRequestConfig {
    authMode?: 'public';
    sessionRevision?: number;
  }
}

const api = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (request) => {
    const session = sessionStore.getSnapshot();
    if (request.authMode === 'public') {
      request.headers.delete('Authorization');
      request.sessionRevision = undefined;
    } else if (session.token) {
      request.headers.Authorization = `Bearer ${session.token}`;
      request.sessionRevision = session.revision;
    } else {
      request.headers.delete('Authorization');
      request.sessionRevision = undefined;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const revision = response.config.sessionRevision;
    if (revision !== undefined && !sessionStore.isCurrent(revision)) {
      throw new SessionError('SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
    }
    return response;
  },
  async (error: AxiosError) => {
    const revision = error.config?.sessionRevision;
    if (error.response?.status === 401 && revision !== undefined) {
      await sessionStore.invalidate(revision, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    return Promise.reject(error);
  }
);

export default api;
