import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { canUseStaffSession } from '@/core/auth/access';
import { staffApi } from '../data/staffApi';
import type { Semester } from '../domain/models';

interface StaffState { admin: boolean; key: readonly string[]; semester: string; semesters: Semester[]; loading: boolean; error: unknown; selectSemester: (code: string) => void; refresh: () => void }
const Context = createContext<StaffState | null>(null);
export function StaffProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const admin = user?.role === 'ADMIN';
  const [selected, setSelected] = useState('');
  const key = ['staff', user?.id ?? 'anonymous'] as const;
  const semesters = useQuery({ queryKey: [...key, 'semesters', admin], queryFn: ({ signal }) => staffApi.semesters({ moderatedByMe: !admin }, signal), enabled: canUseStaffSession(user) });
  const list = semesters.data ?? [];
  const semester = list.some(s => s.code === selected) ? selected : list[0]?.code ?? '';
  return <Context.Provider value={{ admin, key, semester, semesters: list, loading: semesters.isPending, error: semesters.error,
    selectSemester: setSelected, refresh: () => { void semesters.refetch(); } }}>{children}</Context.Provider>;
}
export function useStaff() { const value = useContext(Context); if (!value) throw new Error('StaffProvider is required.'); return value; }
