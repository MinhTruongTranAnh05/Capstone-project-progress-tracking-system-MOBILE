export type Role = 'STUDENT' | 'GROUP_LEADER' | 'ADMIN';

export type Campus = 'HA_NOI' | 'HO_CHI_MINH' | 'DA_NANG' | 'CAN_THO' | 'QUY_NHON';

export type GroupStatus = 'ARCHIVED' | 'FORMED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface GroupMember {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  isLeader: boolean;
  joinedAt: string;
  status: string;
  studentCode?: string;
}

export interface StudentGroup {
  id: string;
  groupCode: string;
  topicId?: string;
  topicTitle?: string;
  supervisorId?: string;
  supervisorName?: string;
  semester: string;
  status: GroupStatus;
  memberCount: number;
  full: boolean;
  minMembers: number;
  meetsMinimum: boolean;
  locked: boolean;
  lockedByAdmin: boolean;
  members?: GroupMember[];
}

export interface Topic {
  id: string;
  topicCode?: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  groupId?: string;
  entityId?: string;
  details?: string;
  deadline?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}
