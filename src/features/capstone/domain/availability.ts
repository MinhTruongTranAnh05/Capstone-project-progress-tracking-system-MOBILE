// Explicit contract audit, not a fallback API implementation. No unsupported request is issued.
export const unavailableFeatures = {
  topics: { title: 'Danh mục đề tài', description: 'Danh mục đề tài chưa được hệ thống cung cấp cho tài khoản sinh viên.', },
  selection: { title: 'Chọn đề tài', description: 'Hệ thống chưa mở chức năng chọn hoặc gửi đề xuất đề tài cho nhóm.', },
  progress: { title: 'Tiến độ tuần', description: 'Hệ thống chưa mở chức năng gửi và xem báo cáo tiến độ tuần.', },
  guidance: { title: 'Lịch tư vấn & hướng dẫn đồ án', description: 'Lịch tư vấn và hướng dẫn đồ án chưa được hệ thống cung cấp. Hạn lập nhóm không phải lịch hướng dẫn.', },
} as const;
