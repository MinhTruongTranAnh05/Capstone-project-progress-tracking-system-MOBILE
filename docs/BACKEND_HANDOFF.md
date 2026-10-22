# Các điểm cần Backend cập nhật cho Mobile

Phạm vi Mobile: Student (`STUDENT`) và Leader (`GROUP_LEADER`). Coordinator tương ứng `ADMIN`, sử dụng Web. Chưa sửa Backend/Web.

## Contract đã xác nhận

- Nhóm tối thiểu 3, tối đa 5 thành viên đang hoạt động, kể cả trưởng nhóm.
- Tự đăng ký chỉ tạo Student; nhận trạng thái `PENDING_APPROVAL`, không nhận token.
- Xin vào nhóm dùng Apply → Leader duyệt thành Invite → sinh viên Accept.
- Leader mời bằng `/groups/{id}/invites`; `/groups/{id}/members` chỉ dành cho Admin.

## Các yêu cầu cần BE cung cấp contract chính thức

1. Cho Student đọc đề tài, tiến độ, tài liệu, milestone và tổng quan nhóm của mình. `SecurityConfig` hiện loại Student khỏi các route này.
2. Cung cấp cách xác định nhóm hiện tại theo người đăng nhập và học kỳ. `GET /groups` của Student chỉ trả nhóm đang tuyển; query `memberId` không được hỗ trợ; `UserResponse` không có `groupId`.
3. Chốt API chọn đề tài có sẵn cho Leader: endpoint/method/body/response, điều kiện chọn, trạng thái, quyền theo nhóm và lỗi xung đột. Hiện `PUT /groups/{id}` chỉ dành cho Admin; không có enum nhóm `PENDING`.
4. Cung cấp contract riêng cho “Lịch tư vấn & hướng dẫn đồ án”, không sử dụng luồng lịch hẹn giảng viên cũ: danh sách/chi tiết, phân trang, quyền Student/Leader, người tạo/sửa và trạng thái.
5. Xác nhận quy trình duyệt đề tài sau khi loại bỏ role giảng viên: luồng proposal hiện tại vẫn cần supervisor và bước duyệt trung gian.
6. Xác nhận có bổ sung refresh token hay không. Hiện chỉ có access token; Mobile sẽ yêu cầu đăng nhập lại khi hết phiên.
7. Chốt tên thay thế cho field phản hồi `instructorFeedback` nếu BE loại bỏ khái niệm giảng viên. Mobile hiện đọc field này duy nhất ở adapter tiến độ, đổi thành `feedback` cho UI.
8. Xác nhận nguồn học kỳ đang mở, mã học kỳ chuẩn và thời hạn lập nhóm; không có API liệt kê học kỳ đang mở được tìm thấy trong lần khảo sát.

Chưa giả định endpoint mới. Chọn đề tài trực tiếp đang được vô hiệu hóa và thông báo chờ cập nhật hệ thống. Màn lịch hẹn cũ, service, hook và liên kết đã được gỡ; màn lịch tư vấn mới sẽ triển khai sau khi có contract.

## Đợt A: kiểm tra và giới hạn

- Gỡ đăng ký/hiển thị role giảng viên, enum slot cũ, API thao tác chỉ dành cho staff và endpoint `/groups/{id}/join` không tồn tại.
- Gỡ lịch tuần mẫu và số thành viên mẫu ở Tổng quan.
- Dùng chung `MIN_GROUP_MEMBERS = 3`, `MAX_GROUP_MEMBERS = 5`; đổi thêm trực tiếp thành gửi lời mời.
- Các phần xác thực/route guard, xác định nhóm, error state, form đăng ký hoàn chỉnh và luồng nhóm đầy đủ tiếp tục ở các đợt B–F. Việc gửi Apply/Invite chưa thay thế toàn bộ luồng quản lý lời mời.

## Cập nhật đợt B

Đã triển khai xác thực, route guard và xử lý hết phiên trong Mobile; xem [PHASE_B_AUTH.md](PHASE_B_AUTH.md). Chưa có API refresh/revoke từ BE nên đăng xuất ở phía ứng dụng và yêu cầu đăng nhập lại khi nhận 401. Các yêu cầu API phía trên vẫn còn hiệu lực.
