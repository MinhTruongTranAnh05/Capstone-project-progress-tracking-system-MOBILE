import type { FormationWindow, JoinRequest, StudentGroup } from './models';
export const MIN_GROUP_MEMBERS = 3;
export const MAX_GROUP_MEMBERS = 5;
export function isPending(request: JoinRequest, now = Date.now()) { return request.status === 'PENDING' && Date.parse(request.expiresAt) > now; }
export function canRecruit(group?: StudentGroup, window?: FormationWindow, eligible = false, now = Date.now()) {
  return eligible && !!window?.open && (!window.formationDeadline || Date.parse(window.formationDeadline) > now)
    && (!group || (!group.locked && ['FORMED', 'ACTIVE'].includes(group.status)));
}
export function hasRoom(group: StudentGroup, maxMembers = MAX_GROUP_MEMBERS) { return !group.full && group.memberCount < maxMembers; }
export function isMember(group: StudentGroup, userId: string) { return !!group.members?.some(m => m.userId === userId && m.status === 'ACTIVE'); }
export function isLeader(group: StudentGroup | undefined, userId: string) { return !!group?.members?.some(m => m.userId === userId && m.status === 'ACTIVE' && m.isLeader); }
