import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { groupApi } from '@/features/groups/data/groupApi';
import { recoverGroups, verifyGroup } from '@/features/groups/data/groupRecovery';
import { canRecruit, isLeader } from '@/features/groups/domain/rules';
import { storage } from '@/services/storage';
import { sessionStore } from '@/services/sessionStore';
import { SessionError } from '@/services/apiError';
import type { FormationWindow, StudentGroup } from '@/features/groups/domain/models';

interface FormationState {
  groups: StudentGroup[]; group?: StudentGroup; semester: string; window?: FormationWindow;
  isLeader: boolean; canAct: boolean; loading: boolean; refreshing: boolean; error: unknown;
  recoveryNotice: string | null; key: readonly string[];
  setSemester: (semester: string) => void; selectGroup: (groupId: string) => Promise<void>;
  rememberGroup: (groupId: string) => Promise<void>; refresh: () => Promise<void>;
}
const Context = createContext<FormationState | null>(null);
export function FormationProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<{ userId: string; groupId?: string; semester: string }>();
  const [now, setNow] = useState(Date.now());
  const key = ['formation', user?.id ?? 'anonymous'] as const;
  const recovery = useQuery({ queryKey: [...key, 'membership', user?.role], enabled: !!user,
    queryFn: ({ signal }) => {
      if (!user) throw new SessionError('SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
      const revision = sessionStore.getSnapshot().revision;
      return recoverGroups(user, {
        getKnownGroup: storage.getKnownGroup,
        setKnownGroup: async (id, groupId) => { if (sessionStore.isCurrent(revision)) await storage.setKnownGroup(id, groupId); },
      }, signal);
    }, staleTime: 0 });
  const groups = recovery.data?.groups ?? [];
  const selected = selection?.userId === user?.id ? selection : undefined;
  const group = groups.find(item => item.id === (selected?.groupId ?? recovery.data?.selectedId));
  const semester = group?.semester ?? selected?.semester ?? '';
  const window = useQuery({ queryKey: [...key, 'window', semester], enabled: !!user && !!semester,
    queryFn: ({ signal }) => groupApi.window(semester, signal), staleTime: 0 });
  const refresh = useCallback(async () => {
    if (!user) return;
    const revision = sessionStore.getSnapshot().revision;
    await refreshUser();
    if (sessionStore.isCurrent(revision)) await queryClient.invalidateQueries({ queryKey: ['formation', user.id] });
  }, [user, refreshUser, queryClient]);
  const rememberGroup = async (groupId: string) => {
    if (!user) throw new SessionError('SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
    const revision = sessionStore.getSnapshot().revision;
    const verified = await verifyGroup(groupId, user.id);
    if (!verified) throw new Error('Máy chủ chưa xác nhận bạn là thành viên đang hoạt động của nhóm.');
    if (!sessionStore.isCurrent(revision)) throw new SessionError('SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
    await storage.setKnownGroup(user.id, groupId);
    if (!sessionStore.isCurrent(revision)) return;
    setSelection({ userId: user.id, groupId, semester: verified.semester });
    await refresh();
  };
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && user) { setNow(Date.now()); void queryClient.invalidateQueries({ queryKey: ['formation', user.id] }); }
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [queryClient, user?.id]);
  return <Context.Provider value={{ groups, group, semester, window: window.data,
    isLeader: !!user && user.role === 'GROUP_LEADER' && isLeader(group, user.id),
    canAct: !recovery.isError && !window.isError && canRecruit(group, window.data, user?.eligible, now),
    loading: !!user && recovery.isPending, refreshing: recovery.isFetching || window.isFetching,
    error: recovery.error ?? window.error,
    recoveryNotice: recovery.isSuccess && !groups.length ? 'Không khôi phục được nhóm của bạn. Máy chủ không có API tra nhóm riêng cho sinh viên. Nếu bạn đã thuộc nhóm, hãy nhập ID nhóm đã được cấp để xác minh; không tạo nhóm mới khi chưa chắc chắn.' : null,
    key, refresh, rememberGroup, selectGroup: rememberGroup,
    setSemester: value => { if (user) setSelection({ userId: user.id, semester: value }); },
  }}>{children}</Context.Provider>;
}
export function useFormation() { const value = useContext(Context); if (!value) throw new Error('useFormation must be used within FormationProvider'); return value; }
