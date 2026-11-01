export const studentPages = [
  { name: 'index', href: '/(tabs)', path: '/', label: 'Tổng quan nhóm', icon: '📊', grouped: false },
  { name: 'members', href: '/(tabs)/members', path: '/members', label: 'Thành viên nhóm', icon: '👥', grouped: false },
  { name: 'requests', href: '/(tabs)/requests', path: '/requests', label: 'Đơn Apply & Vote', icon: '📝', grouped: false },
  { name: 'management', href: '/(tabs)/management', path: '/management', label: 'Quản lý trạng thái & Rời nhóm', icon: '🔒', grouped: true },
  { name: 'topics', href: '/(tabs)/topics', path: '/topics', label: 'Danh mục đề tài', icon: '📚', grouped: false },
  { name: 'topic-selection', href: '/(tabs)/topic-selection', path: '/topic-selection', label: 'Chọn đề tài', icon: '🎯', grouped: false },
  { name: 'progress', href: '/(tabs)/progress', path: '/progress', label: 'Tiến độ tuần', icon: '📈', grouped: false },
  { name: 'guidance', href: '/(tabs)/guidance', path: '/guidance', label: 'Lịch tư vấn & hướng dẫn đồ án', icon: '📅', grouped: false },
  { name: 'profile', href: '/(tabs)/profile', path: '/profile', label: 'Hồ sơ cá nhân', icon: '⚙️', grouped: false },
] as const;
