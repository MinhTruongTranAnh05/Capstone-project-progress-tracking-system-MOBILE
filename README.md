# MatchPoint FPT Mobile — Team Formation v2.9

Ứng dụng Expo / React Native / TypeScript dành cho sinh viên và trưởng nhóm. Giao diện, nhãn và điều hướng tham chiếu FE v2.9; API lấy từ BE `feat/team-formation-v2.8` (commit `e0d89ec`). **BE main cũ không tương thích.**

## Chức năng

- Google login theo danh sách sinh viên đã import; không tự đăng ký hoặc chọn campus.
- Học kỳ/môn học, điều kiện, deadline và nhóm hiện tại từ `/me/semesters`, kể cả nhóm đầy/khóa.
- Tạo/tìm nhóm, tìm sinh viên theo tên/kỹ năng; xem hồ sơ theo quyền riêng tư.
- Apply/Invite/Accept/Reject/Withdraw và Like; tối đa 3 Apply đang chờ.
- Giới hạn 5 thành viên gồm trưởng nhóm; khóa/mở khóa, sửa tên/kỹ năng và quản lý thành viên.
- Rời nhóm, duyệt/thu hồi/khiếu nại; đề nghị/nhận/từ chối chuyển trưởng nhóm, có chuyển kèm rời nhóm.
- Cập nhật hồ sơ và private mode; thông báo phân trang, đánh dấu đã đọc.
- Chặn staff và role lạ; xác minh phiên qua BE, xử lý 401, xóa query cache khi đổi tài khoản và bỏ phản hồi phiên cũ.

Leader là cờ membership, không phải role tài khoản. Admin/Moderator sử dụng Web. Các module đăng ký, đề tài, tiến độ, tài liệu và lịch của bản cũ đã được gỡ theo phạm vi v2.9.

## Chạy ứng dụng

```sh
npm install
# Copy .env.example thành .env, đặt EXPO_PUBLIC_API_URL trỏ tới BE v2.9.
npm start
npm run android
npm run web
```

Base URL cần có `/api/v1`:

- Android emulator: `http://10.0.2.2:8081/api/v1`
- iOS simulator: `http://localhost:8081/api/v1`
- Thiết bị thật: `http://<IP-LAN-máy-chạy-BE>:8081/api/v1`

Thay port theo BE thực tế. Không commit `.env` hoặc credential.

Google native cần development build chứa `@react-native-google-signin/google-signin`; Expo Go không có module này. Android OAuth client phải khớp package `com.fpt.capstone.mobile` và SHA-1 của bản cài. iOS cần `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` và rebuild. Web dùng clientId từ `/auth/google/config`, hoặc override `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`; origin của Web cần nằm trong cấu hình Google OAuth. Sinh viên phải đăng nhập đúng email Google trong roster, không dùng `@fpt.edu.vn`.

## Kiểm tra

```sh
npm test
npm run typecheck
npx expo export --platform web --output-dir .expo/v29-web
npx expo export --platform android --output-dir .expo/v29-android
```

Tests dùng HTTP/storage adapter trong Node, không gửi request tới BE và không thêm mock vào app. Chưa thay thế test Google thật, quyền trên BE thật hoặc thao tác thiết bị. Hiện chưa cấu hình ESLint riêng; typecheck bật kiểm tra import/biến không dùng.

## Cấu trúc

```text
app/(auth)/             Đăng nhập Google
app/(tabs)/             Tổng quan, thành viên, đơn Apply, quản lý, hồ sơ, thông báo
app/(groups)/           Tạo nhóm và đường dẫn nhóm
src/components/         UI dùng chung, trạng thái và Google Sign-In
src/contexts/           Auth và học kỳ/môn/nhóm đang chọn
src/screens/            Màn hình chia sẻ giữa các route
src/services/           API, session, storage và xử lý lỗi
src/types/              Contract BE v2.9
src/constants/          Theme, nhãn và quy tắc nhóm
scripts/                Tests xác thực và contract/permission
```

Chi tiết phiên bản, API, quy tắc và phần chưa kiểm chứng: [V29_MIGRATION.md](docs/V29_MIGRATION.md). Các tài liệu đợt A/B chỉ được giữ làm lịch sử.

Đối chiếu từng màn với source FE, cách chuyển sidebar/cột nội dung sang điện thoại và giới hạn kiểm chứng giao diện: [WEB_UI_PARITY.md](docs/WEB_UI_PARITY.md).
