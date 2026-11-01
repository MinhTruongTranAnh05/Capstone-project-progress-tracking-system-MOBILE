import type { Campus } from '@/types/auth';
export interface Page<T> { content: T[]; number: number; size: number; totalElements: number; totalPages: number; last: boolean }
export type GroupStatus = 'FORMED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';
export type RosterStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export interface GroupMember { id: string; userId: string; userFullName: string; userEmail: string; isLeader: boolean; joinedAt: string; status: 'ACTIVE' | 'REMOVED'; studentCode?: string | null }
export interface StudentGroup {
  id: string; groupCode: string; semester: string; status: GroupStatus;
  topicId?: string | null; topicTitle?: string | null; supervisorId?: string | null; supervisorName?: string | null;
  memberCount: number; full: boolean; minMembers: number; meetsMinimum: boolean;
  locked: boolean; lockedByAdmin: boolean; rosterStatus: RosterStatus; rosterNote?: string | null;
  members?: GroupMember[] | null;
}
export interface GroupRequest { semester: string; groupCode?: string }
export interface FormationWindow { semester: string; requestTtlHours: number; formationDeadline?: string | null; open: boolean; maxOpenApplications: number; minMembers: number; maxMembers: number }
export interface ProfileView { userId: string; fullName: string; email: string; campus?: Campus | null; avatarUrl?: string | null; bio?: string | null; skills?: string | null; studentCode?: string | null }
export interface JoinRequest {
  id: string; type: 'APPLY' | 'INVITE'; status: 'PENDING' | 'APPROVED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'CANCELLED';
  groupId: string; groupCode: string; message?: string | null; sourceApplicationId?: string | null;
  expiresAt: string; respondedAt?: string | null; rejectReason?: string | null; createdAt: string;
  student?: ProfileView | null; supportVotes?: number | null; opposeVotes?: number | null;
}
export type VoteType = 'SUPPORT' | 'OPPOSE';
export interface Vote { voterId: string; voterName: string; vote: VoteType; comment?: string | null; votedAt: string }
export interface LeaveRequest { id: string; groupId: string; userId: string; userFullName: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'; reason?: string | null; decidedAt?: string | null; createdAt: string; groupCode: string; userEmail: string; studentCode?: string | null; leaderRequest: boolean }
export interface Notification { id: string; type: string; message: string; groupId?: string | null; entityId?: string | null; details?: string | null; deadline?: string | null; read: boolean; readAt?: string | null; createdAt: string }
