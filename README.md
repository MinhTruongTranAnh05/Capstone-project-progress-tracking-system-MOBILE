# MatchPoint FPT Mobile

Ứng dụng Expo/React Native đồng bộ portal Sinh viên, Trưởng nhóm, Admin và Điều phối viên của FE. Quyết định hiện hành của người dùng: **giữ BE v2.9 đang chạy, theo FE mới, đầy đủ vai trò**.

## Bản đồng bộ 2026-11-05/06

- FE tham chiếu: `../Capstone-project-progress-tracking-system-FE`, commit `936fb98`.
- BE local đã đối chiếu: `../Capstone-project-progress-tracking-system-BE`, commit `079ee1b`. BE local khác hợp đồng đang triển khai; không dùng nó để thay thế API v2.9.
- API đang cấu hình: `https://cortex-bristle-ferry.ngrok-free.dev/api/v1`.
- OpenAPI công khai được chụp ngày 2026-11-05: [deployed-v29-full.json](docs/contracts/deployed-v29-full.json), 76 đường dẫn, 65 schema.
- Ma trận chức năng, các khác biệt bắt buộc do API và kết quả kiểm tra: [parity-20261105.md](docs/parity-20261105.md).

Kiểm tra tự động gần nhất: **56/56 test**, typecheck, lint và export Web/Android/iOS đạt. Android đã build/cài và quan sát được nhóm, sidebar 5 mục, popup thông báo và màn quản lý. **Còn lỗi chưa xác minh xong:** người dùng báo đăng nhập Google trên emulator lại trở về màn login; đợt kiểm tra đã dừng theo yêu cầu push Git. Không xem kết quả build/test là xác nhận đăng nhập hoặc toàn bộ nghiệp vụ đã hoàn tất.

Chỉ sửa MOBILE trong đợt này. Giữ nguyên source và thay đổi local có sẵn trong BE/FE. Các tài liệu checkpoint cũ ghi “staff chỉ xác nhận phiên” đã được thay thế bởi bản đồng bộ này.

## Chức năng

Sinh viên chưa có nhóm có workspace tạo nhóm/tìm nhóm và hồ sơ. Khi đã có nhóm, sidebar có đúng năm mục theo FE: **Tổng quan nhóm; Thành viên nhóm; Đơn ứng tuyển & Lời mời; Quản lý trạng thái & Rời nhóm; Hồ sơ cá nhân**. Đã bỏ khối menu chức năng đồ án chưa khả dụng. Chuông mở popup thông báo tại chỗ, hỗ trợ phân trang và đánh dấu đọc.

Các luồng sinh viên dùng học kỳ/môn học thật, tạo nhóm, Apply/Invite, phản hồi/thu hồi, Like tư vấn, khóa/mở khóa, mời/xóa thành viên, rời nhóm/duyệt/thu hồi/khiếu nại, chuyển Trưởng nhóm và xem hồ sơ theo quyền từ BE. Nhóm có 3–5 thành viên; Trưởng nhóm vẫn có account role STUDENT, xác minh bằng leaderId và membership của nhóm.

Admin có giám sát tổng quan, chuyên ngành, import sinh viên/điều kiện, học kỳ, tài khoản, yêu cầu rời nhóm, danh sách nhóm và hồ sơ. Có tạo/sửa chuyên ngành, học kỳ, phân công Điều phối viên, cấu hình môn học/TTL/thời hạn, preview/commit import file, sửa tài khoản/điều kiện và xuất Excel.

Điều phối viên có điều phối nhóm, khiếu nại rời nhóm, phạm vi/thời hạn, điều phối chi tiết nhóm và hồ sơ. Có tạo nhóm từ sinh viên chưa có nhóm, thêm/chuyển/xóa thành viên, gộp nhóm, chỉ định Trưởng nhóm, giải tán nhóm dưới chuẩn, kiểm tra/chốt/mở lại danh sách và xuất Excel. Học kỳ được lấy theo phân công của BE. Xác nhận và lý do cho các thao tác quan trọng được thực hiện trong giao diện.

Import dùng multipart file thật. Báo cáo chỉ được lưu khi máy chủ trả Excel hợp lệ; Android dùng hộp thoại chia sẻ/lưu, web tải file. Các API admin bị chặn ở client với tài khoản không có quyền; BE vẫn quyết định quyền và tính hợp lệ cuối cùng.

## Các giới hạn của BE v2.9

FE mới và BE v2.9 có vài điểm không khớp. Mobile dùng endpoint/payload thực sự được BE công bố; không giả thành công hoặc tạo dữ liệu thay thế. Ví dụ: tạo Giảng viên qua `/users/moderators`, quyết định yêu cầu qua `{approve,note}`, cập nhật điều kiện bằng enrollmentId, cập nhật thông tin sinh viên bằng semesterStudentId. Chi tiết có trong báo cáo đồng bộ.

BE chưa công bố tự đăng ký, đề tài, tiến độ tuần và lịch tư vấn. Các chức năng đó không xuất hiện trên sidebar. Thông tin tạo tài khoản giải thích việc nhà trường cấp tài khoản, không gửi tới endpoint không tồn tại.

Bố cục mobile dùng drawer/card để vừa màn hình điện thoại; chưa có xác nhận so sánh hình ảnh từng pixel với toàn bộ FE. Các thao tác ghi của Admin/Điều phối chưa được kiểm thử trên tài khoản thật trong đợt này. Kiểm tra adapter và contract không thay thế kiểm thử nghiệp vụ trên BE.

## Chạy

Expo SDK 58, React Native 0.88.1, React 19.3. Dùng Node được Expo SDK 58 hỗ trợ.

```sh
npm ci
npm start
npm run start:dev
npm run android
npm run web
```

`npm start` tạo QR **Expo Go** trên cổng 8082. Google Sign-In native cần bản development đã cài và `npm run start:dev`. Máy tính/điện thoại cần truy cập được nhau; nếu LAN bị chặn có thể chạy `npm run start:tunnel` cho Expo Go hoặc `npm run start:dev:tunnel` cho development build.

Copy `.env.example` thành `.env` khi thiết lập máy mới. API URL phải có `/api/v1`; runtime đọc env. Không lưu token hoặc mật khẩu vào source. Android package hiện tại: **com.fpt.capstone.mobile**. Giữ lại signing hiện có.

Browser và native dùng hai audience do BE cung cấp: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` và `EXPO_PUBLIC_GOOGLE_MOBILE_WEB_CLIENT_ID`. iOS đang thiếu OAuth client riêng. Development env trong eas.json đã được sửa theo API/ID hiện hành; không xác nhận thay đổi biến cloud EAS hay cấu hình Google Cloud. Chi tiết: [google-login-setup.md](docs/google-login-setup.md).

Trên emulator đang chạy, bản development được mở với Metro cổng 8083. Cần giữ Metro chạy; APK debug này không chứa bundle standalone để dùng offline.

## Kiểm tra

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`npm test` chạy test source thật với storage/HTTP adapter trong Node; không ghi vào DB. Bao gồm hợp đồng staff đối chiếu OpenAPI độc lập, phân quyền, payload, phân trang, import/export, validation và render các màn của hai portal staff.

`npm run build` xuất JS/Hermes cho Web/Android/iOS vào `.expo/alignment-build`; không phải bản cài. APK Android debug local ở `android/app/build/outputs/apk/debug/app-debug.apk`. Bản build kiểm tra emulator dùng ABI x86_64.

## Cấu trúc

- `app/`: Expo route wrappers, route guard phân tách staff/sinh viên.
- `src/features/<feature>/presentation`: màn hình/context; `domain`: models/quy tắc; `data`: API/recovery.
- `src/core/http`, `src/core/auth`, `src/core/ui`, `src/core/validation`: HTTP, phiên, UI và schema chung.
- `src/services`, `src/types`, `src/contexts`, `src/screens`: các import tương thích và services hiện có.
- `docs/contracts/`: bằng chứng OpenAPI độc lập phục vụ kiểm tra.

Các checkpoint trước 2026-11-05 trong docs là lịch sử. Dùng báo cáo đồng bộ mới để xác định phạm vi và tình trạng hiện hành.
