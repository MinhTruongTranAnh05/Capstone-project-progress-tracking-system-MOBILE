import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, ReactNode } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { getErrorMessage, SessionError } from '@/services/apiError';
import { sessionStore } from '@/services/sessionStore';
import { GoogleLoginRequest, LoginRequest, LoginResponse, MobileUser } from '@/types/auth';

interface AuthContextType {
  user: MobileUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionNotice: string | null;
  startupError: string | null;
  restoreSession: () => Promise<void>;
  loginWithGoogle: (data: GoogleLoginRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, sessionStore.getSnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [startupError, setStartupError] = useState<string | null>(null);
  const restoreAttempt = useRef(0);

  const restoreSession = useCallback(async () => {
    const attempt = ++restoreAttempt.current;
    const revision = sessionStore.begin();
    setIsLoading(true);
    setStartupError(null);
    try {
      const token = await sessionStore.restoreToken(revision);
      if (!token || !sessionStore.isCurrent(revision)) return;
      // Cached user data never grants access. Ask the server for current role/status.
      const user = await authService.getCurrentUser();
      await sessionStore.accept(revision, { accessToken: token, user });
    } catch (error) {
      if (!sessionStore.isCurrent(revision)) return;
      if (error instanceof SessionError) {
        await sessionStore.invalidate(revision, error.message);
      } else {
        // Retain the disk token for Retry without mounting authenticated screens offline.
        setStartupError(getErrorMessage(error, 'Không thể xác minh phiên đăng nhập. Vui lòng thử lại.'));
      }
    } finally {
      if (attempt === restoreAttempt.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let previous = sessionStore.getSnapshot();
    const unsubscribe = sessionStore.subscribe(() => {
      const next = sessionStore.getSnapshot();
      if (previous.revision !== next.revision || previous.user?.id !== next.user?.id
        || previous.user?.role !== next.user?.role) {
        void queryClient.cancelQueries();
        queryClient.clear();
      }
      previous = next;
    });
    void restoreSession();
    return unsubscribe;
  }, [queryClient, restoreSession]);

  const authenticate = useCallback(async (request: () => Promise<LoginResponse>) => {
    const revision = sessionStore.begin();
    setStartupError(null);
    try {
      const response = await request();
      await sessionStore.accept(revision, response);
    } catch (error) {
      if (sessionStore.isCurrent(revision)) {
        await sessionStore.invalidate(revision, error instanceof SessionError ? error.message : null);
      }
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback((data: GoogleLoginRequest) =>
    authenticate(() => authService.loginWithGoogle(data)), [authenticate]);

  const login = useCallback((data: LoginRequest) => authenticate(() => authService.login(data)), [authenticate]);

  const logout = useCallback(async () => {
    restoreAttempt.current += 1;
    setStartupError(null);
    setIsLoading(false);
    await sessionStore.invalidate(sessionStore.getSnapshot().revision);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = sessionStore.getSnapshot();
    if (!current.token || !current.user) return;
    try {
      const user = await authService.getCurrentUser();
      await sessionStore.accept(current.revision, { accessToken: current.token, user });
    } catch (error) {
      if (error instanceof SessionError && error.code !== 'SESSION_CHANGED') {
        await sessionStore.invalidate(current.revision, error.message);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Network failures retain a verified session; a 401 still signs out.
        void refreshUser().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        accessToken: session.token,
        isAuthenticated: !!session.token && !!session.user,
        isLoading,
        sessionNotice: session.notice,
        startupError,
        restoreSession,
        loginWithGoogle,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
