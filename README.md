# MatchPoint FPT Mobile

Ứng dụng sinh viên ghép nhóm đồ án, đã có sẵn và được chỉnh sửa tiếp trên nhánh `align-with-web-be`. Backend và Frontend chỉ được đọc để đối chiếu.

## Contract đang sử dụng

- Theo quyết định mới nhất của người dùng: **BE triển khai v2.9**, không phải BE `main` cũ trong workspace.
- API: `https://quick-collecting-studies-apparently.trycloudflare.com/api/v1`.
- Swagger: `https://quick-collecting-studies-apparently.trycloudflare.com/swagger-ui/index.html`.
- Bằng chứng contract đã đọc: [deployed-v29.json](docs/contracts/deployed-v29.json). Tunnel có thể thay đổi; cần xác nhận lại trước khi kiểm thử thật.
- Web tham chiếu: FE `origin/main` đang lưu cục bộ, commit `7078a14`, đọc bằng `git show`, không checkout hay chỉnh sửa FE.
- Đã đối chiếu lại bản FE vừa clone: `main`, `7078a14`; chi tiết chênh lệch và các lỗi Web không sao chép nằm trong [frontend-recheck.md](docs/frontend-recheck.md).

## Vai trò và giới hạn

- Cập nhật theo xác nhận mới nhất của người dùng: màn login có thêm Email/Mật khẩu cho `ADMIN` và `LECTURER`, gọi POST `/auth/login`. Sau đăng nhập, staff chỉ có màn xác nhận tài khoản/làm mới/đăng xuất; không mở portal quản trị hoặc các màn/API nhóm sinh viên. Quyết định này thay thế việc từ chối toàn bộ staff ở các checkpoint cũ.
- Các luồng nghiệp vụ nhóm chỉ dành cho Sinh viên và Trưởng nhóm. Cả hai có account role `STUDENT`; Trưởng nhóm xác định từ `leaderId` **và** membership `leader` của nhóm đã xác minh. Staff có phiên đăng nhập/xác nhận tài khoản riêng theo phê duyệt mới.
- Người điều phối trong BE là account `LECTURER` được gán cho học kỳ qua `moderatorId`. `ADMIN` có quyền thực hiện các tác vụ điều phối tương ứng. Không ánh xạ Người điều phối thành `COUNCIL`.
- Không có portal quản trị/điều phối trên mobile. Không có luồng đặt/hủy lịch hẹn, vai trò hoặc giao diện Instructor.
- Nhóm hợp lệ **3–5 người**, tối đa 5 bao gồm Trưởng nhóm. Quy tắc dùng constants chung và kiểm tra lại từ server.

## Chức năng hiện có

- Google sign-in cho tài khoản có trong danh sách nhà trường; xác minh trạng thái/vai trò từ phản hồi BE và kiểm tra lại `/auth/me` khi khôi phục phiên.
- Login theo mẫu ảnh: card trong mờ, logo nhỏ, tiêu đề đậm, Email/Mật khẩu có Hiện/Ẩn, nút cam và phần Google riêng. Không lưu mật khẩu. Form staff và Google cùng khóa khi một luồng đang xử lý; lỗi BE được giữ nguyên.
- Chọn học kỳ/môn học từ `/me/semesters`; xác minh membership/scope khi lấy nhóm. Known group ID lưu theo user chỉ là gợi ý chọn scope, không cấp quyền từ cache và không đoán nhóm từ danh sách tuyển.
- Tạo nhóm, tìm nhóm/sinh viên, Apply/Invite, chấp nhận/từ chối/thu hồi, Like tư vấn. Theo v2.9, chấp nhận Apply hoặc Invite qua `/requests/{id}/accept` làm sinh viên gia nhập ngay; không dùng quy trình approve → invite của BE cũ.
- Khóa/mở khóa, mời/xóa thành viên, rời nhóm/yêu cầu/thu hồi/khiếu nại, chuyển Trưởng nhóm theo quyền và phase thực tế.
- Hồ sơ phone/skills/strengths/weaknesses/profilePrivate theo BE; dữ liệu riêng tư hiển thị theo `full` từ server. Không gửi field `bio` của BE cũ.
- Thông báo phân trang, chưa đọc, đánh dấu đọc, retry và refresh. Hồ sơ/thông báo không bị chặn hiển thị chỉ vì nhóm tải lỗi.
- Bảng màu, ảnh nền và shell responsive hiện có được giữ lại; menu dùng một định nghĩa chung.
- Menu chưa có nhóm theo workspace Tạo nhóm mới/Tìm nhóm đang tuyển của Web; menu có nhóm gồm Tổng quan, Thành viên, Đơn ứng tuyển & Lời mời, Quản lý trạng thái và Hồ sơ. Lịch sử đơn vẫn truy cập được từ màn tìm nhóm.
- Tổng quan hiển thị thành viên/vị trí trống, cảnh báo khóa và bộ đếm yêu cầu thật; không gán 0 khi API lỗi. Trước khi Apply cần lưu kỹ năng; lời giới thiệu mặc định dùng kỹ năng đã lưu.

## Chức năng bị BE chặn

BE triển khai không công bố endpoint cho tự đăng ký, danh mục đề tài, chọn/đề xuất đề tài, báo cáo tiến độ tuần hoặc lịch tư vấn/hướng dẫn đồ án. Các màn tương ứng thông báo rõ chưa khả dụng, không tạo dữ liệu demo và không giả thành công.

Màn thông tin tạo tài khoản dùng cùng ảnh nền/card trắng/banner cam với Web; giải thích việc nhà trường cấp tài khoản. Không có form thu thập mật khẩu hoặc nút gửi tới endpoint không tồn tại. Register.jsx của FE tham chiếu hiện bị comment và không được route.

Theo yêu cầu giao diện mobile, khối giới thiệu màu cam được ẩn trên Android/iOS và Web màn hình nhỏ; chỉ giữ ở Web màn hình rộng. Form đăng nhập/thông tin tài khoản dùng một cột gọn trên mobile.

Chi tiết endpoint, quyền và trạng thái: [gap-report.md](docs/gap-report.md), [feature-parity-matrix.md](docs/feature-parity-matrix.md), [verification.md](docs/verification.md). Hạn lập nhóm không được dùng thay cho lịch hướng dẫn. Mọi lỗi/denial từ BE được giữ nguyên thông điệp; trạng thái chưa thử không được ghi thành 403/404 giả.

## Chạy và kiểm tra

Project dùng **Expo SDK 58**, React Native 0.88 và React 19.3, tương thích về SDK với Expo Go 58 trên iPhone. Node cần bản được SDK 58 hỗ trợ (22.13+, 24.3+ hoặc 26+; không dùng các nhánh lẻ).

```sh
npm ci
npm start
npm run web
npm run android
npm run lint
npm run typecheck
npm test
npm run build
```

Nếu Expo Go còn báo project SDK 57, dừng Metro cũ bằng `Ctrl+C`, chạy `npm start -- --clear --go`, rồi quét QR mới. iPhone và máy chạy Metro cần truy cập được nhau qua mạng LAN. Nâng SDK chỉ xử lý lỗi phiên bản; Google Sign-In native vẫn cần development build như phần dưới.

Copy `.env.example` thành `.env` nếu chưa có. `EXPO_PUBLIC_API_URL` phải chứa `/api/v1`. API base URL không hard-code trong code runtime. Bản làm việc này đã đổi riêng giá trị đó sang test tunnel đã được cung cấp; URL cũ lưu trong `.expo/api-url-before-alignment.txt` (không commit).

Google native cần development build có module Google Sign-In, không hoạt động trong Expo Go. BE trả Google Web client ID qua `/auth/google/config`; có thể cấu hình `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` và `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` theo OAuth app đã được cấp. Origin Web/native client phải được cấu hình hợp lệ; không bỏ qua lỗi OAuth hoặc đưa token vào chat/log.

`npm run build` export Web/Android/iOS vào `.expo/alignment-build`; đây là bundle JS/Hermes, **không phải APK/IPA**. Kiểm tra thiết bị/native build và đăng nhập thật là bước riêng. `npm test` dùng adapter HTTP/storage trong Node và contract đã chụp, không ghi vào DB thật.

## Cấu trúc và rollback

- `app/`: Expo route wrappers.
- `src/features/<feature>/presentation`: màn hình/context; `domain`: models/quy tắc; `data`: API/recovery.
- `src/core/http`, `src/core/auth`, `src/core/ui`, `src/core/validation`: API client, session store, UI primitives, schemas chung.
- Các path cũ trong `src/services`, `src/types`, `src/contexts`, `src/screens` và `FormationUI` là re-export mỏng giữ import tương thích; không có bản sao logic/API.
- Palette/tokens tại `src/constants/colors.ts`, quy mô nhóm tại `src/constants/group.ts`.
- Snapshot trước khi sửa: commit **`90eed1b`**. Các thay đổi từng vùng được commit riêng. Không reset hoặc ghi đè thay đổi có sẵn trong BE/FE.

## Tình trạng kiểm thử thật

Chưa có đăng nhập OAuth hoặc ghi dữ liệu BE trong đợt này. Computer Use bị dừng vì không xác định chắc chắn URL hiện tại của Chrome; không tiếp tục tự động hóa trình duyệt trong turn đó. Kiểm tra ảnh render và hành vi thực tế chưa được ký duyệt.

Chỉ dùng dữ liệu `TEST-` trên test DB được cho phép; không sửa bản ghi khác. Hai tài khoản được cung cấp cần người dùng đăng nhập Google trực tiếp. Luồng cần 3+ thành viên ghi **not tested**. Tài khoản staff không có và cũng không thuộc phạm vi mobile.
