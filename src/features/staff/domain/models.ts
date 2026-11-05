import type { User } from '@/types/auth';
import type { LeaveRequest, Page, ScopePhase, StudentGroup } from '@/types/models';
type Phase = ScopePhase;

export type { Page, User, LeaveRequest, StudentGroup };
export interface Major { id: string; code: string; name: string }
export interface Semester {
  code: string; name: string; startDate: string; endDate: string;
  formationOpensAt: string | null; defaultDeadline: string | null;
  moderator: { id: string; fullName: string; email: string } | null;
  studentCount: number; groupCount: number; subjectCount: number;
}
export interface SemesterInput { code: string; name: string; startDate: string; endDate: string; formationOpensAt: string; defaultDeadline: string }
export interface Scope {
  id: string; subjectId: string; subjectCode: string; subjectName: string; semesterCode: string;
  majorId: string; majorCode: string; majorName: string; phase: Phase; deadline: string | null;
  ownDeadline: boolean; openedAt: string | null; lockedAt: string | null; finalizedAt: string | null;
  previousFinalizedAt: string | null; reopenedAt: string | null; reopenReason: string | null;
  studentCount: number; groupCount: number;
}
export interface Subject {
  id: string; semesterCode: string; code: string; name: string; targetTerm: number;
  minGroupSize: number; maxGroupSize: number; requestTtlMinutes: number; minDeadlineNoticeMinutes: number; scopes: Scope[];
}
export interface StudentRow {
  enrollmentId: string; semesterStudentId: string; userId: string; studentCode: string; fullName: string;
  email: string; phone: string | null; majorCode: string; majorName: string; currentTerm: number;
  eligibility: 'UNDECIDED' | 'ELIGIBLE' | 'INELIGIBLE'; eligibilityReason: string | null;
  hasGroup: boolean; groupId: string | null; groupCode: string | null; groupName: string | null;
  leader: boolean; noGroupReason: string | null;
}
export interface Counts {
  totalStudents: number; withGroup: number; withoutGroup: number; ineligible: number;
  groupsBySize: Record<string, number>; totalGroups: number; openGroups: number; fullGroups: number;
  lockedGroups: number; finalizedGroups: number; groupsUnderMinimum: number; openComplaints: number;
  pendingApplies: number; pendingInvites: number;
}
export interface Statistics {
  semesterCode: string; subjectId: string | null; majorId: string | null; takenAt: string; total: Counts;
  scopes: { scopeId: string; subjectCode: string; majorCode: string; majorName: string; phase: Phase; deadline: string | null; finalizedAt: string | null; counts: Counts }[];
}
export interface FinalizeCheck {
  canFinalize: boolean; blockers: string[]; warnings: string[];
  groupsUnderMinimum: { id: string; code: string; name: string; size: number }[];
  openLeaveRequests: number; studentsWithoutGroup: number;
}
export interface ExportCheck {
  canExport: boolean; takenAt: string; warnings: string[];
  groupsUnderMinimum: { id: string; code: string; name: string; size: number }[];
}
export interface ImportReport {
  committed: boolean; batchId: string; newRows: number; updatedRows: number; unchangedRows: number; errorRows: number;
  errors: { row: number; key: string; reason: string }[]; newMajors: string[];
  blockedFinalized: { row: number; key: string; reason: string }[];
}
export interface PageFilter { page?: number; size?: number; q?: string; sort?: string }
export interface StudentFilter extends PageFilter { majorId?: string; hasGroup?: boolean; eligibility?: StudentRow['eligibility'] }
export interface GroupFilter extends PageFilter { majorId?: string; state?: StudentGroup['state']; maxSize?: number; finalized?: boolean }
