const labels: Record<string, { icon: string; label: string }> = {
  MEMBER_JOINED: { icon: '👋', label: 'Thành viên mới' },
  MEMBER_REMOVED: { icon: '👤', label: 'Thay đổi thành viên' },
  MEMBER_LEFT: { icon: '👤', label: 'Thay đổi thành viên' },
  LEAVE_REQUESTED: { icon: '📩', label: 'Yêu cầu rời nhóm' },
  LEAVE_DECIDED: { icon: '📋', label: 'Kết quả yêu cầu' },
  // The wire event has no structured eligibility value. Keep its exact message
  // instead of guessing eligible/ineligible from a translated sentence.
  ELIGIBILITY_CHANGED: { icon: '⚠️', label: 'Điều kiện tham gia' },
  LEADER_CHANGE_REQUESTED: { icon: '📩', label: 'Yêu cầu chuyển giao quyền Trưởng nhóm' },
  LEADER_LEAVE_REQUESTED: { icon: '📩', label: 'Trưởng nhóm xin rời nhóm' },
  LEADER_CHANGED: { icon: '👑', label: 'Thay đổi Trưởng nhóm' },
};

export function getNotificationPresentation(type: string) {
  return labels[type] ?? { icon: '🔔', label: 'Thông báo' };
}
