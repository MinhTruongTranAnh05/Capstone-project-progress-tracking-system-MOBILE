# Đợt B — Xác thực và phân quyền Mobile

## Hành vi đã triển khai

- Chỉ tài khoản `ACTIVE` có role `STUDENT` hoặc `GROUP_LEADER` được vào các route `(tabs)` và `(groups)`.
- Coordinator dùng `ADMIN`. Admin và mọi role ngoài phạm vi Mobile nhận thông báo “Vui lòng dùng phiên bản Web”; token của các tài khoản này không được lưu khi đăng nhập.
- Khi mở app, đọc token rồi gọi `GET /auth/me` để xác minh người dùng. Không dùng user cache để cấp quyền, không tin role trong dữ liệu lưu trên máy.
- Trong lúc kiểm tra phiên, chỉ hiển thị màn xác minh. Khi mất mạng hoặc máy chủ lỗi, hiển thị lỗi và nút Thử lại/Về đăng nhập; không mở màn dữ liệu nhóm.
- Khi quay lại ứng dụng từ nền, kiểm tra lại tài khoản. Lỗi mạng tạm thời không đăng xuất một phiên đã xác minh; lỗi 401 hoặc role/status không còn hợp lệ sẽ thu hồi quyền truy cập.
- `Stack.Protected` chặn truy cập trực tiếp/deep link vào các route riêng tư khi chưa đăng nhập và loại màn đăng nhập khỏi navigation của phiên hợp lệ. Đăng xuất/401 loại lịch sử route riêng tư khỏi stack.
- Request riêng tư gắn Bearer token từ phiên hiện tại; endpoint đăng ký/đăng nhập/cấu hình Google/cơ sở không gửi Bearer token.
- 401 của request mang token hiện tại xóa phiên trong bộ nhớ và storage, đồng bộ AuthContext và chuyển về đăng nhập. Nhiều 401 đồng thời chỉ thu hồi cùng phiên một lần.
- 403 chỉ từ chối thao tác, không đăng xuất. Query không retry lỗi 401/403.
- Mỗi phiên có revision: 401 đến muộn của phiên cũ không đăng xuất phiên mới; response thành công của phiên cũ bị bỏ để tránh trộn dữ liệu giữa tài khoản.
- Hủy query và xóa cache khi đổi phiên, đổi người dùng/role hoặc đăng xuất. Ghi/xóa storage được tuần tự hóa để thao tác lưu đến muộn không khôi phục phiên đã đăng xuất.
- Giữ nguyên Axios error/fieldErrors từ Backend; bổ sung helper thông báo lỗi tiếng Việt cho đăng nhập, xác minh phiên và Google.

## API và giới hạn

Chỉ dùng endpoint đã tồn tại: `/auth/login`, `/auth/google`, `/auth/me`, `/auth/register`, `/auth/google/config`, `/auth/campuses`.

Backend chưa có refresh-token hoặc logout/revoke API. Không gọi endpoint giả và không tự đăng nhập lại bằng mật khẩu đã lưu. Khi access token hết hạn và API trả 401, người dùng đăng nhập lại. Đăng xuất hiện xóa phiên phía ứng dụng.

Quyền xem đề tài/tiến độ/tài liệu của Student và API lấy nhóm hiện tại vẫn cần Backend cập nhật như [BACKEND_HANDOFF.md](BACKEND_HANDOFF.md). Đợt B không thay đổi những quy tắc đó và không bỏ qua lỗi 403.

## Cấu hình và kiểm tra tự động

Base URL lấy từ `EXPO_PUBLIC_API_URL`, gồm `/api/v1`. Ví dụ:

- Android Emulator: `http://10.0.2.2:8080/api/v1`
- iOS Simulator: `http://localhost:8080/api/v1`
- Thiết bị thật: `http://<IP-LAN-máy-chạy-BE>:8080/api/v1`

Không ghi token/mật khẩu vào log. Native lưu bằng SecureStore; bản Web dùng localStorage theo stack hiện có.

```sh
npm run typecheck
npm run test:auth
npx expo export --platform web --output-dir .expo/phase-b-web
npx expo export --platform android --output-dir .expo/phase-b-android
```

Các test auth dùng service/adapter thật với storage và HTTP adapter giả lập, không gửi request tới BE. Bao phủ quyền Student/Leader, chặn Admin/role lạ, account status, xác minh token đã lưu, lỗi mạng, 401/403, đăng nhập email/Google, response cũ, logout khi đang lưu và lỗi storage. Không thay thế kiểm thử thiết bị hoặc OAuth thật.

## Kịch bản kiểm tra thủ công trên môi trường tích hợp

Chưa chạy các kịch bản sau với tài khoản thật trong đợt này:

| Kịch bản | Kết quả mong đợi |
|---|---|
| Chưa đăng nhập, mở deep link tới nhóm/tiến độ | Về đăng nhập, màn riêng tư không được mount |
| Student ACTIVE đăng nhập email/Google | Vào Tổng quan |
| Leader ACTIVE đăng nhập email/Google | Vào Tổng quan với role Leader |
| Admin đăng nhập email/Google | Hiện “Vui lòng dùng phiên bản Web”, không vào app |
| Mở app có token hợp lệ, user cache bị sửa thành role khác | Quyền lấy từ `/auth/me` |
| Mở app có token hết hạn | Về đăng nhập và thông báo hết phiên |
| Mở app mất mạng | Hiện lỗi xác minh; Thử lại sau khi có mạng |
| Đăng xuất rồi nhấn Back hoặc mở lại deep link | Không quay lại dữ liệu riêng tư |
| Nhiều API cùng trả 401 | Một lần xóa phiên, không lặp điều hướng |
| Student gặp 403 ở API chưa được BE mở quyền | Không đăng xuất; lỗi nghiệp vụ vẫn được trả về caller |
| Chuyển tài khoản khi request cũ chưa hoàn tất | Không nhận dữ liệu hoặc 401 của tài khoản trước |
| Tài khoản bị đổi thành Admin/khóa trên BE rồi quay lại app | Thu hồi quyền truy cập sau khi kiểm tra `/auth/me` |
