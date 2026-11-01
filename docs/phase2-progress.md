# Phase 2 progress — 2026-11-01

## Latest login screenshot approval

The user explicitly approved the Admin/Coordinator email/password form. Mobile now calls the deployed public `/auth/login`, accepts active ADMIN/LECTURER sessions, and routes staff to a separate account-confirmation/refresh/logout screen. Student group routes and automatic group queries stay STUDENT-only. Login is restyled to the screenshot's compact translucent card, inputs, password visibility toggle, orange action, Google separator and footer; the mobile introduction panel stays removed. Existing auth race/storage/401 tests remain, with role/method and password-request coverage added: 35 tests, lint, strict types and three-platform exports pass. Real account/device validation is not claimed. See [login-layout.md](login-layout.md).

## Newly cloned Frontend recheck

Rechecked actual FE `main` at `7078a14` and the approved deployed OpenAPI (HTTP 200, still 76 paths; audited mobile schemas unchanged). Mobile now matches the membership-aware menu, create/discover workspace, request wording, overview roster/lock warning/shortcuts and login/profile wording. Request counters use actual deployed states and retain errors; applications require saved skills with a default introduction; invitation normalization is shared. Notification labels and unread-counter error states are aligned. Existing request history and compatible optional custom messages remain accessible.

Final repository checks for this pass: zero-warning lint, strict types, 30 tests and Web/Android/iOS exports pass. No login, authenticated request or write was performed. Required capstone features remain blocked by absent BE APIs; the unavailable entries are kept separately. See [frontend-recheck.md](frontend-recheck.md) and [verification.md](verification.md). No BE/FE source modifications.

## Current status after lecturer review and explicit retarget

The user selected **the deployed v2.9 BE**. The earlier deployment-mismatch pause below is historical and resolved by that decision. The checked-out BE remains untouched and is no longer the implementation contract.

- `208e025`: revised gap report/parity matrix before code changes, including exact Coordinator mapping and absent required features.
- `52b84fc`: deployed Google/profile contract, Web-styled account-access UI, exact server errors; unsupported campus/password/register writes removed from mobile runtime. Earlier work remains in rollback history.
- `7c8c19f`: canonical v2.9 API/models/rules, fresh membership/scope verification and user-scoped known-group hints; existing compatible workflows preserved.
- `af9e06f`: common menu/route definitions, independent profile/notification rendering, truthful unavailable states for lecturer-requested features.
- `aafd31f`: separates core UI/HTTP/session code from feature presentation/domain/data, retains thin old import paths and centralizes validation. State-reset and compiler-lint errors are fixed without disabling the compiler rules.
- `52f1f52`: adds Expo-compatible lint/export scripts and removes unused dependencies.

**Before Phase 3 live checks:** self-registration, topic catalog, topic selection/proposals, weekly progress and advisory/guidance schedule are **blocked by BE** (no advertised endpoint/matching controller). Booking and staff portals are excluded. Four unavailable-state screens do not represent fake feature completion. Coordinator is LECTURER assigned to a semester, with ADMIN fallback; COUNCIL is absent in deployment. Max group size stays 5.

Latest checks: 28 tests and typecheck pass; ESLint permits zero warnings; Web/Android/iOS exports pass. Exports are not APK/IPA builds. Real OAuth/read/write and visual/device QA remain not tested. Computer Use stopped because Chrome's current URL could not be determined confidently enough to enforce policy. No further browser control or live writes were attempted. See [verification.md](verification.md), [feature-parity-matrix.md](feature-parity-matrix.md) and the current section of [gap-report.md](gap-report.md).

---

## Historical checkpoints before retarget

Scope: STUDENT/GROUP_LEADER only. Backend and Frontend remain read-only. Instructor booking/appointments are excluded following the user's latest instruction. No Instructor/Admin portals or BE-only backlog will be built.

## Completed checkpoints

- `90eed1b`: rollback snapshot of the complete supplied mobile working tree and Phase 1 report, on `align-with-web-be`.
- `1eb1b01`: campus-aware Google request, approved registration/password paths, STUDENT/GROUP_LEADER acceptance, bio/skills profile payload, field errors and shared auth validation. Existing revision/race/storage/401 protections retained. Typecheck and 17 auth tests passed.
- `06540c2`: canonical checked-out-BE group DTO/API/rules, per-user group ID persistence and membership recovery. Tests cover lost membership, offline retry without clearing the hint, accepted-invite recovery, paginated leader groups and no guessed selection. All 24 auth/group tests and typecheck passed.

The new group context is prepared in `src/features/groups/presentation/GroupContext.tsx` but **not wired to existing v2.9 screens yet**. The existing provider was retained so this checkpoint still type-checks. Group workflow UI, capstone flows, final structure/UI cleanup and Phase 3 remain unfinished.

## Deployment mismatch — clarification required

Read-only GET succeeded with HTTP 200 at:

`https://quick-collecting-studies-apparently.trycloudflare.com/v3/api-docs`

The supplied deployment advertises **Team Formation API (Website ghép nhóm)**. Its OpenAPI contract is incompatible with the approved checked-out BE target:

| Contract | Checked-out BE `079ee1b` | Supplied deployment |
|---|---|---|
| Google request | idToken + required campus | idToken only |
| Campus / registration endpoints | `/auth/campuses`, `/auth/register` | Neither advertised |
| Account roles | ADMIN, INSTRUCTOR, COUNCIL, GROUP_LEADER, STUDENT | ADMIN, LECTURER, STUDENT; no GROUP_LEADER account role |
| Group context | `/groups` and group/semester data | `/me/semesters` and subject/scope data |
| Create group | POST `/groups` with semester | POST `/subjects/{subjectId}/groups` with name/wantedSkills |
| Accept application | Approve application creates invite; student accepts invite | `/requests/{requestId}/accept` joins immediately |
| Profile | bio/skills | phone/skills/strengths/weaknesses/profilePrivate |
| Progress/documents/topic catalog | Implemented in checked-out BE | No corresponding paths advertised |

The deployment is reachable; it is not a tunnel outage. No auth attempt, Google sign-in, credential collection or test-data write was performed. No denial/error response has been inferred from absent paths; absence above refers to OpenAPI inspection.

Pending user decision: keep the checked-out-BE target and obtain a matching test deployment, or retarget mobile to the deployed v2.9 contract and revise the approved scope first. Existing code changes are checkpointed; no endpoint fallback or compatibility workaround will be invented.

When a matching target is confirmed, use only authorized disposable records prefixed `TEST-`. User will complete Google login interactively. Flows requiring 3+ signed-in members will be marked not tested. Never request Google tokens in chat or use unowned sample-student inboxes.
