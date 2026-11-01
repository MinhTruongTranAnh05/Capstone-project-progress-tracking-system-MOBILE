import axios from 'axios';
import type { MobileUser } from '@/types/auth';
import { groupApi } from './groupApi';
import { isMember } from '../domain/rules';
import type { StudentGroup } from '../domain/models';
export interface GroupMemory { getKnownGroup(userId: string): Promise<string | null>; setKnownGroup(userId: string, groupId: string | null): Promise<void> }
export async function verifyGroup(groupId: string, userId: string, signal?: AbortSignal) {
  const group = await groupApi.get(groupId, signal);
  return isMember(group, userId) ? group : undefined;
}
export async function recoverGroups(user: MobileUser, memory: GroupMemory, signal?: AbortSignal): Promise<{ groups: StudentGroup[]; selectedId?: string }> {
  const knownId = await memory.getKnownGroup(user.id);
  const groups = new Map<string, StudentGroup>();
  const verify = async (groupId: string) => {
    try { const group = await verifyGroup(groupId, user.id, signal); if (group) groups.set(group.id, group); }
    catch (error) { if (!axios.isAxiosError(error) || ![403, 404].includes(error.response?.status ?? 0)) throw error; }
  };
  if (knownId) {
    await verify(knownId);
    if (!groups.has(knownId)) await memory.setKnownGroup(user.id, null);
  }
  if (user.role === 'GROUP_LEADER') {
    let page = 0;
    while (true) {
      const result = await groupApi.list(page, false, signal);
      for (const summary of result.content) if (!groups.has(summary.id)) await verify(summary.id);
      if (result.last) break;
      page++;
    }
  } else {
    const invitations = await groupApi.myInvitations(signal);
    const ids = new Set(invitations.filter(r => r.status === 'ACCEPTED').map(r => r.groupId));
    for (const groupId of ids) if (!groups.has(groupId)) await verify(groupId);
  }
  const selectedId = knownId && groups.has(knownId) ? knownId : groups.size === 1 ? [...groups.keys()][0] : undefined;
  if (selectedId) await memory.setKnownGroup(user.id, selectedId);
  return { groups: [...groups.values()], selectedId };
}
