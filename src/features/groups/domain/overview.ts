import type { JoinRequest, LeaveRequest } from './models';
import { isPending } from './rules';

export function getGroupOverviewCounts(groupId: string, requests: JoinRequest[], leaves: LeaveRequest[], now = Date.now()) {
  return {
    applications: requests.filter(request => request.groupId === groupId && request.type === 'APPLY' && isPending(request, now)).length,
    leaves: leaves.filter(request => request.groupId === groupId && ['PENDING_LEADER', 'PENDING_MODERATOR'].includes(request.status)).length,
  };
}
