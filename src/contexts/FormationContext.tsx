import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { groupService } from '@/services/groupService';
import { canParticipate, canRecruit } from '@/constants/formation';
import type { MySemester, MySubject, StudentGroup } from '@/types/models';

interface FormationState {
  semesters: MySemester[];
  semester?: MySemester;
  subject?: MySubject;
  group?: StudentGroup;
  isLeader: boolean;
  canAct: boolean;
  canParticipate: boolean;
  loading: boolean;
  refreshing: boolean;
  error: unknown;
  selectScope: (scopeId: string) => void;
  refresh: () => Promise<void>;
  key: readonly string[];
}
const Context = createContext<FormationState | null>(null);

export function FormationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<{ userId: string; scopeId: string } | null>(null);
  const [now, setNow] = useState(Date.now());
  const key = ['formation', user?.id ?? 'anonymous'] as const;
  const semesters = useQuery({ queryKey: [...key, 'semesters'], queryFn: ({ signal }) => groupService.getMySemesters(signal), enabled: !!user });
  const rows = (semesters.data ?? []).flatMap(semester => semester.subjects.map(subject => ({ semester, subject })));
  const selected = rows.find(row => selection?.userId === user?.id && row.subject.scopeId === selection?.scopeId) ?? rows[0];
  const groupId = selected?.subject.group?.id;
  const group = useQuery({ queryKey: [...key, 'group', groupId], queryFn: ({ signal }) => groupService.getGroup(groupId!, signal), enabled: !!user && !!groupId });
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: key }); };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && user) {
        setNow(Date.now());
        void queryClient.invalidateQueries({ queryKey: ['formation', user.id] });
      }
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [queryClient, user]);

  const currentGroup = groupId && group.data?.id === groupId ? group.data : undefined;
  const isLeader = !!user && !!currentGroup && currentGroup.leaderId === user.id
    && currentGroup.members.some(member => member.userId === user.id && member.leader);
  return <Context.Provider value={{
    semesters: semesters.data ?? [], semester: selected?.semester, subject: selected?.subject, group: currentGroup,
    isLeader, canAct: canRecruit(selected?.semester, selected?.subject, now),
    canParticipate: canParticipate(selected?.semester, selected?.subject),
    loading: semesters.isPending || (!!groupId && group.isPending),
    refreshing: semesters.isFetching || (!!groupId && group.isFetching),
    error: semesters.error ?? (groupId ? group.error : null),
    selectScope: scopeId => { if (user) setSelection({ userId: user.id, scopeId }); }, refresh, key,
  }}>{children}</Context.Provider>;
}
export function useFormation() {
  const value = useContext(Context);
  if (!value) throw new Error('useFormation must be used within FormationProvider');
  return value;
}
