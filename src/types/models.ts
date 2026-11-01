export type ScopePhase = 'PREPARING' | 'OPEN' | 'LOCKED' | 'FINALIZED';
export type GroupState = 'OPEN' | 'FULL' | 'LOCKED' | 'DISSOLVED';
export interface ProfileView {
  userId: string; fullName: string; studentCode: string | null; full: boolean;
  email: string | null; phone: string | null; skills: string | null; strengths: string | null; weaknesses: string | null;
}
export interface GroupSummary { id: string; code: string; name: string; size: number; state: GroupState; leader: boolean; finalized: boolean; finalizedAt: string | null }
export interface MySubject {
  subjectId: string; code: string; name: string; scopeId: string; phase: ScopePhase;
  deadline: string | null; canAct: boolean; eligibility: 'UNDECIDED' | 'ELIGIBLE' | 'INELIGIBLE';
  eligibilityReason: string | null; noGroupReason: string | null; group: GroupSummary | null;
}
export interface MySemester {
  semesterCode: string; semesterName: string; majorCode: string; majorName: string;
  currentTerm: number; readOnly: boolean; subjects: MySubject[];
}
export interface GroupMember { userId: string; fullName: string; studentCode: string | null; leader: boolean; joinedAt: string; profile: ProfileView }
export interface StudentGroup {
  id: string; code: string; name: string; wantedSkills: string | null; scopeId: string; subjectId: string;
  subjectCode: string; semesterCode: string; majorCode: string; majorName: string; scopePhase: ScopePhase;
  size: number; minSize: number; maxSize: number; state: GroupState; full: boolean; locked: boolean;
  finalized: boolean; finalizedAt: string | null; dissolvedReason: string | null; dissolvedAt: string | null;
  leaderId: string | null; leaderName: string | null; members: GroupMember[]; createdAt: string;
}
export interface GroupRequest { name: string; wantedSkills: string }
export interface JoinRequest {
  id: string; type: 'APPLY' | 'INVITE'; status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'CANCELLED';
  groupId: string; groupCode: string; groupName: string; student: ProfileView; message: string | null;
  rejectReason: string | null; cancelReason: string | null; createdBy: string; createdAt: string;
  expiresAt: string; respondedAt: string | null; likes: number | null; likedByMe: boolean | null;
}
export interface LeaveRequest {
  id: string; groupId: string; groupCode: string; groupName: string; userId: string; fullName: string; studentCode: string;
  status: 'PENDING_LEADER' | 'PENDING_MODERATOR' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CLOSED';
  complaint: boolean; reason: string | null; leaderNote: string | null; leaderDecidedAt: string | null;
  decisionNote: string | null; decidedAt: string | null; createdAt: string;
}
export interface LeaderTransfer {
  id: string; groupId: string; groupCode: string; groupName: string; fromUserId: string; fromName: string;
  toUserId: string; toName: string; leaveAfter: boolean; afterFinalize: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'; createdAt: string; respondedAt: string | null;
}
export interface Notification { id: string; type: string; message: string; groupId: string | null; entityId: string | null; details: string | null; deadline: string | null; read: boolean; readAt: string | null; createdAt: string }
export interface Page<T> { content: T[]; totalPages: number; totalElements: number; number: number; last: boolean }
