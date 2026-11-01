# Recheck against the newly cloned Frontend — 2026-11-01

Frontend working tree: `main`, `7078a14` (previous checkout was `11fb91e`). The cached `7078a14` reference had already informed the earlier retarget, but this pass checks the actual cloned source and fixes remaining differences. FE's existing package-lock modification and BE's existing application.yml modification are untouched. All implementation edits are in mobile on `align-with-web-be`.

Scope remains Student and verified group Leader. The additional Admin major-management pages in this FE are outside mobile scope. Coordinator remains deployed `LECTURER` with semester assignment, not a new mobile role.

## Contract recheck

The approved test tunnel returned HTTP 200 for `/v3/api-docs`: 76 paths. All advertised path/method combinations and the eight stored mobile-facing schemas match [deployed-v29.json](contracts/deployed-v29.json). No authenticated request or test write was made. Endpoint absence is contract evidence, not a claimed live 403/404.

Student formation remains subject/scope based, with immediate membership on accepted Apply/Invite and advisory Likes. The group's leave list is permitted for members (own requests), Leader and Moderator (all). The overview counts only the records returned to the current user.

## Differences corrected in mobile

| Area | Current Web | Previous mobile | Change |
|---|---|---|---|
| No-group navigation | Create workspace with create/discover tabs; personal profile | Full group menu also visible; local tab state could disagree with navigation | Membership-aware main menu; create/discover selection in route params; request history remains reachable from discover |
| Group menu wording | Đơn ứng tuyển & Lời mời; Trưởng nhóm | Đơn Apply & Vote; mixed Nhóm trưởng/Trưởng nhóm | Labels and role wording aligned |
| Group overview | Member tiles, vacant positions up to 5, locked warning, request and leave shortcuts | Compact summary without these sections | Added the corresponding sections using verified group data, with current semester/major instead of invented fallbacks |
| Overview counters | Web attempts request/leave counts | Absent | Uses unexpired APPLY/PENDING and actual PENDING_LEADER/PENDING_MODERATOR leave states; error/retry replaces false zero |
| Invitations | Trim and uppercase MSSV before sending | Normalization differed by caller | Shared invitation schema performs normalization for every caller |
| Application validation | Requires skills; sends skills as introduction | Could send an empty introduction without profile skills | Requires saved skills; uses them by default; retains existing compatible optional custom message. Only message is sent to BE |
| Notification UI | Event-specific icons/labels, unread total and mark-read controls | Generic title and hidden unread-counter errors | Shared event labels, exact server message, explicit counter loading/error, disabled mark-all at confirmed zero, actual deadline when provided |
| Login/account/profile identity | Light background overlay, MatchPoint FPT, Đồ án wording | Dark overlay and remaining Capstone copy | Same photo (SHA256 matches FE), light overlay, translucent card, banner/profile wording; existing palette, shell and native Google auth retained |

Required topic catalog/selection, weekly progress and guidance entries remain visible in a separate **Chức năng đồ án · Chưa khả dụng** section. They are not presented as working APIs. Registration remains an account-provisioning explanation because active FE has no registration route and deployed BE has no self-registration endpoint.

## Source defects and historical material excluded from mobile behavior

- FE service still contains legacy direct join, votes and submit-roster helpers outside the selected BE contract. Mobile keeps real request acceptance and Like APIs.
- CreateGroup submits groupCode and reads broad semester lists; deployed student GroupRequest exposes only name/wantedSkills. Mobile retains the server-generated group code and authorized `/me/semesters` scopes.
- Web's leave handler reports immediate departure and deletes its group hint even when BE returns a pending request. Mobile waits for the actual BE result and membership refetch.
- Web uses PENDING for leave counts; deployed leave states are PENDING_LEADER/PENDING_MODERATOR. Mobile uses those states.
- Web unread-counter fallback does not read deployed `{unread}` directly; mobile retains that correct mapping.
- Web has fixed Spring 2027/Software Engineering fallbacks and derives eligibility from message text. Mobile uses server semester/major and a neutral eligibility-event title, retaining the exact message.
- FE integration checklist still mentions Instructor booking and document flows that are not active pages or deployed APIs. These do not override the lecturer's explicit booking removal or justify fake screens.
- Password login remains a staff path on this deployment. The mobile login stays student Google-only; no Admin/Coordinator portal is added.

## Verification and limits

The final lint/type/test/export results are recorded in [verification.md](verification.md). Regression coverage checks expired/cross-group overview counters, deployed leave statuses and the application-profile requirement; the invitation request test now starts with a lower-case padded MSSV.

This is source/contract and automated repository verification. Physical-device rendering, interactive Google login and authenticated BE flows are still not tested. No mocked runtime group, profile, notification or capstone records were added. SDK 58 compatibility and existing session/race/401 protections remain in place.
