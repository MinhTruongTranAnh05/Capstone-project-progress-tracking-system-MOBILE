import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { groupApi } from '../data/groupApi';
import { loadVerifiedGroup, selectScope } from '../data/groupRecovery';
import { canParticipate, canRecruit } from '../domain/rules';
import { sessionStore } from '@/services/sessionStore';
import { storage } from '@/services/storage';
import { SessionError } from '@/services/apiError';
import { canUseStudentFeatures } from '@/core/auth/access';
import type { MySemester, MySubject, StudentGroup } from '../domain/models';

interface FormationState {
  semesters: MySemester[]; semester?: MySemester; subject?: MySubject; group?: StudentGroup;
  isLeader: boolean; canAct: boolean; canParticipate: boolean;
  loading: boolean; refreshing: boolean; error: unknown; recoveryNotice: string | null;
  selectScope: (scopeId: string) => void; refresh: () => Promise<void>; key: readonly string[];
}
const Context = createContext<FormationState | null>(null);
export function FormationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = canUseStudentFeatures(user) ? user?.id : undefined;
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<{ userId: string; scopeId: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const key = ['formation', userId ?? 'anonymous'] as const;
  const known = useQuery({ queryKey: [...key, 'knownGroup'], queryFn: () => storage.getKnownGroup(userId!), enabled: !!userId, staleTime: 0 });
  const semesters = useQuery({ queryKey: [...key, 'semesters'], queryFn: ({ signal }) => groupApi.getMySemesters(signal), enabled: !!userId, staleTime: 0 });
  const selected = selectScope(semesters.data ?? [], selection?.userId === userId ? selection?.scopeId : undefined, known.data);
  const groupId = selected?.subject.group?.id;
  const scopeId = selected?.subject.scopeId;
  const group = useQuery({ queryKey: [...key, 'group', scopeId, groupId], enabled: !!userId && !!scopeId && !!groupId && !known.isPending,
    queryFn: async ({ signal }) => {
      const revision = sessionStore.getSnapshot().revision;
      try {
        const result = await loadVerifiedGroup(groupId!, userId!, scopeId!, signal);
        if (sessionStore.isCurrent(revision) && !signal.aborted) await storage.setKnownGroup(userId!, result.id);
        return result;
      } catch (error) {
        const notMember = error instanceof SessionError && error.code === 'GROUP_MEMBERSHIP_MISSING';
        const forbidden = isAxiosError(error) && [403, 404].includes(error.response?.status ?? 0);
        if ((notMember || forbidden) && sessionStore.isCurrent(revision) && !signal.aborted && known.data === groupId) await storage.setKnownGroup(userId!, null);
        throw error;
      }
    }, staleTime: 0 });
  const refresh = useCallback(async () => { if (userId) await queryClient.invalidateQueries({ queryKey: ['formation', userId] }); }, [userId, queryClient]);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && userId) { setNow(Date.now()); void queryClient.invalidateQueries({ queryKey: ['formation', userId] }); }
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [queryClient, userId]);
  const currentGroup = !group.isError && group.data?.id === groupId && group.data?.scopeId === scopeId ? group.data : undefined;
  const isLeader = !!userId && !!currentGroup && currentGroup.leaderId === userId && currentGroup.members.some(member => member.userId === userId && member.leader);
  return <Context.Provider value={{ semesters: semesters.data ?? [], semester: selected?.semester, subject: selected?.subject, group: currentGroup,
    isLeader, canAct: !semesters.isError && !group.isError && canRecruit(selected?.semester, selected?.subject, now),
    canParticipate: canParticipate(selected?.semester, selected?.subject),
    loading: !!userId && (known.isPending || semesters.isPending || (!!groupId && group.isPending)),
    refreshing: known.isFetching || semesters.isFetching || (!!groupId && group.isFetching),
    error: known.error ?? semesters.error ?? (groupId ? group.error : null),
    recoveryNotice: semesters.isSuccess && (!selected || (known.data && !selected.subject.group)) ? 'Không khôi phục được nhóm đã lưu trong phạm vi học kỳ/môn học hiện tại. Hãy chọn đúng môn học hoặc liên hệ người điều phối; ứng dụng không tự đoán nhóm của bạn.' : null,
    selectScope: id => { if (userId) setSelection({ userId, scopeId: id }); }, refresh, key,
  }}>{children}</Context.Provider>;
}
export function useFormation() { const value = useContext(Context); if (!value) throw new Error('useFormation must be used within FormationProvider'); return value; }
