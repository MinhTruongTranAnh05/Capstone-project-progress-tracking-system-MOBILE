# Đối chiếu giao diện Mobile với Web v2.9

Nguồn đối chiếu trực tiếp: FE `origin/main` tại `3abeae8`. Không thay đổi working tree Web hoặc BE. Bản Mobile nằm trên nhánh `refactor/mobile-team-formation-v29`.

## Các màn đã chuyển theo source Web

| Source FE | Source Mobile | Bố cục/thành phần được chuyển |
|---|---|---|
| `StudentDashboard.jsx` | `src/components/FormationUI.tsx` | Sidebar trắng, logo dấu kiểm, mã nhóm/sĩ số/chức vụ, menu theo tình trạng có nhóm, avatar/đăng xuất; header trắng, nhãn đợt lập nhóm, làm mới, chuông và badge chưa đọc; banner sĩ số xanh/amber. |
| `Overview.jsx` | `app/(tabs)/index.tsx` | Các badge học kỳ/mã nhóm/ngành, badge hợp lệ, ba ô quản lý đầu kỳ và khối lưu ý nền cam nhạt. |
| `CreateGroup.jsx` | `src/screens/CreateGroupContent.tsx` | Form thành lập nhóm, nhãn in hoa, cảnh báo, tag kỹ năng có thêm/xóa và gợi ý, cam kết, nút xác nhận; các card quy chế/đặc quyền và banner tối tìm nhóm. |
| `StudentDashboard.jsx` (chưa có nhóm) | `app/(tabs)/index.tsx` | Hai lựa chọn Tạo nhóm mới / Tìm nhóm; mặc định mở form tạo nhóm, không cần đi qua màn giới thiệu trung gian. |
| `MemberGroup.jsx` | `src/screens/MembersScreen.tsx` | Yêu cầu bàn giao Leader, header sĩ số, form mời MSSV, card mã nhóm và danh sách thành viên nền be, badge vai trò, Bổ nhiệm Leader và Xóa. |
| `StudentProfileAndApply.jsx` | `MembersScreen.tsx`, `ProfileEditor.tsx` | Thứ tự hồ sơ năng lực → lời mời → đơn Apply của tôi → tìm nhóm, bộ lọc kỹ năng và card nhóm đang tuyển với nút Apply. |
| `GroupApplications.jsx` | `app/(tabs)/requests.tsx`, `JoinRequestCard.tsx` | Form mời MSSV, lời mời đang chờ, đơn Apply chờ duyệt; thông tin sinh viên/ngày gửi/lời nhắn, duyệt xanh, từ chối đỏ và xác nhận thu hồi. |
| `GroupManagementPanel.jsx` | `app/(tabs)/management.tsx` | Tổng quan trạng thái nhóm → khóa/mở khóa → yêu cầu rời nhóm, cùng lịch sử/duyệt/chuyển vai trò theo contract v2.9. |
| `auth/Profile.jsx` | `app/(tabs)/profile.tsx` | Heading Tài khoản của tôi, avatar lớn/định danh, badge Sinh viên, card thông tin đồng bộ, các ô thông tin có icon và nhãn chỉ xem. |
| `NotificationCenter.jsx` | `app/(tabs)/notifications.tsx` | Heading/thông tin chưa đọc/Đọc tất cả, danh sách thông báo, nền cam cho mục chưa đọc và độ mờ cho mục đã đọc. |
| `auth/Login.jsx` | `app/(auth)/login.tsx`, `AuthPromoBanner.tsx` | Ảnh nền cùng blob Git với FE, overlay tối, card trắng, logo, banner gradient cam, ba khối tính năng và footer v2.9. |

Màu canvas `#FBF9F5`, chữ `#2C2825`, chữ phụ `#6B635B`, viền `#E8E2D9`, thương hiệu `#E65100`; card 24 px, ô bên trong 16 px, nút/field 12 px theo source FE. Dùng font hệ thống và tăng vùng chạm tối thiểu 44 px trên điện thoại.

## Điều chỉnh cho điện thoại và API đã xác nhận

- Sidebar cố định khi rộng từ 1000 px; điện thoại mở cùng nội dung bằng menu trượt. Gỡ bottom tabs cũ để thống nhất menu với Web.
- Các cột form/hồ sơ chuyển thành một cột trên màn hình nhỏ; học kỳ/môn học dùng bộ chọn thu gọn ở đầu trang. Thông tin thật vẫn lấy từ `/me/semesters`.
- Mã nhóm do BE cấp, không tạo input nhập mã không được BE sử dụng. Không sao chép dữ liệu demo về học kỳ, ngành, số nhóm hoặc điểm thưởng trong FE.
- Native chia sẻ mã nhóm bằng share sheet; Web sao chép vào clipboard. Mã nhóm luôn có thể chọn văn bản.
- Mobile dành cho sinh viên, giữ Google-only như phạm vi v2.9 đã duyệt; form mật khẩu dành cho staff trên Web không xuất hiện trên Mobile.
- Giữ từng field skills/strengths/weaknesses độc lập; không sao chép lỗi FE gán cùng một giá trị cho cả ba field. Hồ sơ riêng tư vẫn chỉ hiển thị tên/MSSV.
- Có thêm lịch sử yêu cầu và Like theo API thực; quyền thao tác, nhóm đầy, thời hạn và học kỳ chỉ xem vẫn được kiểm soát.

## Xác minh

- `npm test`: 23/23 thành công, gồm privacy render và các quy tắc/API v2.9.
- `npm run typecheck`: thành công.
- Export Web/Android/iOS thành công. Không tạo APK/IPA.
- Chưa kiểm chứng ảnh render và thao tác trên thiết bị: công cụ native báo `Computer Use native pipe is unavailable (os error 2)`; công cụ browser báo `The browser access host is unavailable`. Việc đối chiếu hiện dựa trên source, chưa phải xác nhận pixel-perfect.
- Chưa kiểm thử đăng nhập Google hoặc các thao tác ghi trên BE thật.
