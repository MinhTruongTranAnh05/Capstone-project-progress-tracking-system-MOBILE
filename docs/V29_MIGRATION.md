# Mobile — Team Formation v2.9

## Phiên bản tham chiếu và phạm vi

- Người dùng xác nhận chuyển sang v2.9 ngày 30/10/2026; yêu cầu hình thức bám Web vẫn có hiệu lực.
- FE: `origin/main`, commit `3abeae8`. Working tree FE cũ không bị thay đổi.
- BE: `origin/feat/team-formation-v2.8`, commit `e0d89ec`. Tên branch giữ v2.8 nhưng mã/tài liệu đã nâng lên v2.9. BE main `079ee1b` vẫn là API cũ và **không tương thích** client mới.
- Nhánh Mobile: `refactor/mobile-team-formation-v29`, kế thừa main `aec62fe` (đợt A/B đã merge và push).
- Chỉ sửa mã Mobile. Không merge/sửa Backend/Web và không sửa `.env` của người dùng.

## Thay đổi so với kế hoạch cũ

| Hạng mục | Bản v2.9 |
|---|---|
| Đăng ký tài khoản | Bỏ màn/API. Sinh viên phải có email trong danh sách import |
| Đăng nhập sinh viên | Google với JSON `{idToken}`, bỏ campus và form mật khẩu |
| Leader | Không còn global role `GROUP_LEADER`. Xác định bằng leaderId và membership `leader` của nhóm đang chọn |
| Admin/Moderator | Không vào Mobile, thông báo dùng Web. Không suy diễn Moderator thành global Admin trong contract mới; BE dùng account `LECTURER` và phân công theo học kỳ |
| Đề tài/tiến độ/tài liệu/lịch | Gỡ vì FE/BE v2.9 đã bỏ, không tạo placeholder gọi endpoint cũ |
| Nhận diện nhóm | `/me/semesters` → nhóm thuộc môn học/scope → `/groups/{id}`; không chọn nhóm đầu danh sách tuyển, không dùng cache groupId |
| Apply | Leader chấp nhận làm sinh viên vào nhóm ngay. Không còn bước Leader approve thành một Invite mới |
| Invite | `/groups/{id}/invitations`; người nhận chấp nhận qua `/requests/{id}/accept` |
| Quy mô | 3–5, tối đa 5 gồm trưởng nhóm; dữ liệu và thông báo dùng constants chung |

## Điều hướng và giao diện

- Màu cam `#E65100`, nền `#FBF9F5`, chữ `#2C2825`, viền `#E8E2D9`; card trắng, bo góc, nhãn và thứ tự theo StudentDashboard FE.
- Đăng nhập có ảnh nền hiện có, logo/tên MatchPoint FPT, card trắng và banner cam. Tablet/Web rộng dùng hai cột, điện thoại xếp dọc. Chỉ hiển thị luồng Google phục vụ sinh viên; staff được chỉ dẫn dùng Web.
- Menu theo StudentDashboard Web: Tổng quan nhóm → Thành viên nhóm → Đơn Apply & Vote → Quản lý trạng thái & Rời nhóm → Hồ sơ cá nhân; khi chưa có nhóm hiện Tạo nhóm / Hồ sơ. Sidebar cố định trên màn rộng, menu trượt trên điện thoại. Thông báo truy cập qua chuông header. Đối chiếu chi tiết: [WEB_UI_PARITY.md](WEB_UI_PARITY.md).
- Học kỳ và môn học lấy từ BE, chọn theo scopeId; học kỳ cũ chỉ xem. Không hardcode học kỳ, chuyên ngành, trạng thái nhóm hoặc số thành viên.
- Màn nhóm có danh sách/chi tiết, tìm tên/kỹ năng, hồ sơ theo privacy, gửi Apply/lời mời và trạng thái xử lý.
- Quản lý có sửa tên/kỹ năng, khóa/mở khóa, xóa thành viên, rời nhóm, lịch sử/duyệt/thu hồi/khiếu nại và chuyển trưởng nhóm.
- Hồ sơ có điện thoại, kỹ năng, điểm mạnh/yếu, private mode theo contract BE. Cấm sửa nếu học kỳ hiện tại có môn INELIGIBLE hoặc FINALIZED.
- Loading, empty, lỗi/retry và kéo làm mới dùng component chung. Thông báo phân trang có Tải thêm. Các API list nhóm/requests/candidates hiện trả mảng nên không tự bịa phân trang.

## API sử dụng

Tiền tố `/api/v1`. Contract đối chiếu trực tiếp Controller/DTO/Service trong branch BE nói trên.

| Module | Endpoint |
|---|---|
| Auth | POST `/auth/google`; GET `/auth/google/config`, `/auth/me` |
| Hồ sơ | PUT `/me/profile` `{phone,skills,strengths,weaknesses,profilePrivate}` |
| Học kỳ của tôi | GET `/me/semesters` |
| Tìm nhóm/sinh viên | GET `/subjects/{subjectId}/open-groups`, `/subjects/{subjectId}/candidates`, query `q`, `skill` |
| Nhóm | POST `/subjects/{subjectId}/groups`, GET/PUT `/groups/{groupId}`, POST `/groups/{groupId}/lock` hoặc `/unlock`, DELETE `/groups/{groupId}/members/{userId}` |
| Apply/Invite | POST `/groups/{groupId}/applications`, `/groups/{groupId}/invitations`; GET `/groups/{groupId}/requests`, `/subjects/{subjectId}/my-requests`; POST `/requests/{id}/accept`, `/reject`, `/withdraw`; PUT/DELETE `/requests/{id}/like` |
| Rời nhóm | POST `/groups/{groupId}/leave`; GET `/groups/{groupId}/leave-requests`, `/me/leave-requests`; POST `/leave-requests/{id}/leader-decision`, `/withdraw`, `/complaint` |
| Chuyển Leader | POST `/groups/{groupId}/leader-transfers`; GET `/me/leader-transfers`; POST `/leader-transfers/{id}/accept`, `/decline`, `/cancel` |
| Thông báo | GET `/notifications`, `/notifications/unread-count`; PUT `/notifications/{id}/read`, `/notifications/read-all` |

Nhóm tạo/sửa chỉ gửi `{name,wantedSkills}`. Invite gửi `{studentCode,message}`; xóa thành viên dùng userId, không dùng membershipId. Không có API giả hoặc dữ liệu fallback giả. Request lỗi vẫn hiện lỗi, không chuyển thành danh sách rỗng.

## Quyền và trạng thái

- Mỗi account Mobile phải là STUDENT ACTIVE; token cũ có role GROUP_LEADER phải đăng nhập Google lại. Trưởng nhóm không lấy từ user.role.
- Tạo/apply/invite/like/lock/kick cần học kỳ mới, không INELIGIBLE, phase OPEN, chưa qua deadline và `canAct` từ server. INELIGIBLE và kỳ cũ chỉ xem.
- Không gửi Apply tới nhóm khóa/đầy; tối đa 3 Apply đang chờ. Invitation không giữ chỗ và cần kiểm tra lại sức chứa trên server.
- Request PENDING nhưng đã qua expiresAt bị vô hiệu hóa; lịch/nhãn dùng giờ Việt Nam.
- Chuyển Leader được phép sau FINALIZED theo BE; chuyển kèm rời nhóm chỉ khi còn mở. Leader nhóm khóa phải mở khóa hoặc chuyển vai trò trước khi rời.
- Hồ sơ full=false chỉ render tên/MSSV, kể cả khi đối tượng có các field khác. Không tự suy đoán email/điện thoại từ MSSV.
- Giữ cơ chế B: xác minh `/auth/me`, protected routes, xử lý 401, xóa query cache khi đổi phiên, loại response cũ. Không refresh/revoke token giả.
- Chỉ persist access token; hồ sơ cá nhân ở bộ nhớ và luôn đọc lại từ BE. Khi đăng xuất, xóa cả user/rememberedEmail cache của client cũ.

## Cách chạy và xác minh

1. Cấu hình `EXPO_PUBLIC_API_URL` trong `.env` trỏ **BE v2.9** và có `/api/v1`. Ví dụ Android emulator `http://10.0.2.2:8081/api/v1`, thiết bị thật `http://<LAN-IP>:8081/api/v1`; thay port theo nơi chạy BE.
2. Google Web OAuth client phải khớp BE; native cần development build theo hướng dẫn cài Google Sign-In. Không nhập Google token/mật khẩu vào log hoặc test fixtures.
3. Chạy `npm start`, `npm run android` hoặc `npm run web`.
4. Kiểm tra `npm test` và `npm run typecheck`; export bundle bằng `npx expo export --platform web` và `--platform android`.

Tests dùng in-memory disk/HTTP adapter và rule fixtures; không có mock trong app đang chạy. Bao phủ xác thực/race, role từ chối, scope/eligibility/deadline, nhóm đầy, yêu cầu hết hạn và payload các thao tác chính. Không thay thế tích hợp BE/OAuth thật.

## Kết quả kiểm tra bản chuyển đổi

- `npm test`: 23/23 test thành công, gồm kiểm tra privacy khi render hồ sơ.
- `npm run typecheck`: thành công.
- `git diff --check`: thành công.
- `npx expo export --platform all --output-dir .expo/v29-final`: xuất thành công bundle Web, Android và iOS. Đây là bundle JavaScript/Hermes, chưa phải APK/IPA.

## Các phần chưa được kiểm chứng

- Chưa đăng nhập Google bằng tài khoản roster thật, chưa test ghi dữ liệu trên BE thật; không có thông tin xác nhận môi trường đang chạy dùng branch BE v2.9.
- Không tạo APK/IPA. Export JS/Hermes thành công không thay thế native build/cài app.
- Công cụ native Computer Use và browser host đều không kết nối được trong phiên này; chưa xác nhận ảnh/chạm/keyboard/scroll trên thiết bị. Cần kiểm tra điện thoại 360–430 px, tablet và màn hình rộng.
- Cần kiểm tra với hai tài khoản thật: tạo nhóm → Apply/Invite → chấp nhận → đủ 5 → thử thành viên thứ 6; khóa/hết hạn/chốt → rời/chuyển Leader; private profile và học kỳ cũ.
- Một số file/nhãn ở FE mới vẫn có fallback hoặc API cũ; Mobile ưu tiên contract BE đã xác nhận, không sao chép lỗi đó.
