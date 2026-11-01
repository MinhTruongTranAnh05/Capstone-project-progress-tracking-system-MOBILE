# Mobile parity gap report — current target: deployed v2.9

## Lecturer review and retarget decision — 2026-11-01

**This section supersedes the historical Phase 1 target and removal list below.** The user explicitly chose the deployed v2.9 BE after the deployment mismatch was identified. Existing commits/snapshot are retained; incompatible checked-out-BE adapters will not remain in active mobile flows. BE and FE repositories stay read-only.

Current API target: `https://quick-collecting-studies-apparently.trycloudflare.com/api/v1`. Public `/v3/api-docs` rechecked successfully with HTTP 200 on 2026-11-01: **Team Formation API**, 76 paths. Matching source reference is locally cached BE `origin/feat/team-formation-v2.8` (`e0d89ec`), read via `git show`; web design reference is locally cached FE `origin/main` (`7078a14`), also read without checkout. The old checked-out BE/FE are historical comparison sources, not the implementation contract now.

Mobile serves Student and Leader only. The deployed account role is **STUDENT** for both; Leader is verified using group membership and leaderId. Staff accounts are refused. **Người điều phối = LECTURER assigned through semester.moderatorId**, with ADMIN as an authorized fallback. COUNCIL is not a deployed role. Evidence: deployed UserResponse.role enum (ADMIN/LECTURER/STUDENT), cached `semester/Access.java:isModerator`, `user/Role.java`, `team/ModerationController.java`. No Instructor UI, role aliases, booking logic or staff portals will be added. LECTURER is retained only as a wire value for the coordinator account, not relabeled Instructor.

### Required-feature permission re-audit

All paths are relative to `/api/v1`. “Absent” means not advertised by the deployed OpenAPI and no controller in its matching cached source; **it is not an observed authenticated 403/404**. No signed-in account or test write has been used for this re-audit.

| Area | Web behavior | Mobile current / required change | Difference / exact permission evidence | Severity (High/Med/Low) | Fix / status |
|---|---|---|---|---|---|
| Expo Go on iPhone | Web does not depend on Expo Go | User's Expo Go 58 rejected project SDK 57 | Runtime SDK mismatch prevents opening the app before login | High | Upgraded mobile to SDK 58; Doctor 20/20, lint/types/28 tests/exports and iOS manifest pass. Physical device rendering still not tested; see sdk-58-upgrade.md |
| Topic catalog | Latest active web has no catalog page/API; older checkout used GET `/topics` | Lecturer requires catalog | Deployed GET `/topics`, `/topics/{id}` absent for Student and Leader | High | **blocked by BE**: no catalog endpoint. Keep honest availability messaging; no demo topics |
| Topic selection / proposal | Latest web has no topic write; older checkout attempted PUT group topicId | Lecturer requires selection | Deployed PUT `/groups/{groupId}` accepts name/wantedSkills only; POST `/groups/{groupId}/topic-proposals` and topic selection endpoints absent | High | **blocked by BE** for both roles. Do not smuggle topicId into group update or use old approval APIs |
| Weekly progress | Latest web has no progress page/API; older checkout used wrong field names | Lecturer requires report/history | Deployed GET/POST `/groups/{groupId}/progress`, PUT `/progress/{id}` absent for both roles | High | **blocked by BE**: no report/task storage endpoints. No fabricated report or local-only success |
| Advisory/guidance schedule | Latest web has no such schedule; older checkout had appointment slots | Lecturer requires advisory view, explicitly excludes bookings | No guidance/advisory timetable endpoint in deployment or matching source. Subjects/scopes expose formation deadlines, not guidance appointments | High | **blocked by BE** for both roles. Do not reinterpret deadlines as timetable or call slot/booking routes |
| Link documents | Older checkout offered group link submissions; latest active web has no document flow | Earlier approved scope included leader-capable documents | No deployed document submission/list controller for either role | High | **blocked by BE**: retain absence explicitly; no fake uploads/submissions |
| Appointments with Instructor | Present only in older web checkout | Excluded by lecturer | Slots/bookings are absent from deployment and out of approved scope | High | Remove all mobile appointment/Instructor UI and logic; no create/cancel/book controls |
| Registration | Latest FE Register.jsx is commented out and `/register` is not routed | Existing newly added working form targets old BE | Deployed POST `/auth/register` and GET `/auth/campuses` absent; students are provisioned by roster import | High | Redesign account-access page with existing web background/white card/orange banner; clearly explain school provisioning. **Account creation blocked by BE**; no collection/submission of credentials |
| Auth | Latest web uses Google for students | Previous commit added campus/password | Deployed POST `/auth/google` requires only idToken. `/auth/login` is a staff path; Leader is not global role | High | Retain Google/native/session improvements, remove campus/registration/password calls from student runtime and reject staff |
| Formation and group recovery | Latest web uses `/me/semesters` then group detail | Existing v2.9 screens largely match | Keep subject/scope APIs; remove old-BE two-stage approve/vote/member-ID assumptions. Verify membership on every restored group and persist user-scoped known ID only as a hint | High | Continue v2.9 implementation; fail closed on mismatched membership, never select a recruiting group as own |
| Apply/invite/vote | Latest web approves or accepts via requests | Previous old-BE adapters require approve→invite→accept and SUPPORT/OPPOSE | Deployed POST `/requests/{id}/accept` immediately joins on accepted Apply or Invite; advisory voting uses PUT/DELETE Like | High | Follow deployed behavior; preserve confirmations, capacity/expiry and privacy guards. The old two-stage requirement is superseded by actual target |
| Profile | Latest web uses strengths/weaknesses/skills/phone/private | Previous commit uses bio/skills | Deployed ProfileRequest has phone≤20, skills/strengths/weaknesses≤1000, profilePrivate; **bio not exposed** | High | Restore compatible profile editor and validation; preserve field errors/privacy rules and independent skills fields |
| Size/navigation | Latest web has formation menus and 3–5 members | Keep existing responsive shell/palette | Never use 6; centralize size/labels. Required unavailable features must remain visibly unavailable rather than pretending parity | Med | Align menu order/labels, allow profile/notifications despite group load failure, preserve mobile touch targets |

The older checked-out BE's topic/proposal/progress endpoints **cannot be used against this deployment**. For historical reference only: its SecurityConfig blocks STUDENT reads outside its formation paths; GROUP_LEADER can browse topics and own-group reports and submit proposals, but proposals require a supervisor (`The group needs a supervisor before it can submit topics for pre-review`). Its PUT group assignment is ADMIN-only. These are source-derived restrictions, not live denial responses. This contract also contains the obsolete Instructor workflow, so it is not a safe replacement for the selected deployment.

Current scope excludes staff portals, Instructor/booking, reviews, defense and reports. Four required capstone features plus account creation are recorded as **blocked by BE** until the BE team exposes them. The parity matrix records implementation and runtime verification separately. No unsupported flow will be labeled complete.

Implementation update: deployed auth/profile and group contracts are wired; the existing shell/palette remains, navigation has one definition, and the account-access page shares the Web-style background/card/banner. Known IDs are per user and never grant access without fresh membership/scope verification. No Instructor/booking code remains in active `src`/`app`. The four requested unavailable features have explanatory states only, not fake forms or records. Validation, session/401/race and privacy checks remain active. Static verification and untested/blocked real flows are detailed in [verification.md](verification.md).

---

# Historical Phase 1 audit — checked-out BE target (superseded)

Audit date: 2026-11-01 (Asia/Saigon). **Application code unchanged. Phase 2 has not started.**

The gap table contains **51 findings: 32 High, 15 Med, 4 Low**. Core source-level parity currently fails on login payload, role acceptance, group context and formation contracts. Runtime checks remain **not run**.

## Baseline and decision

The user confirmed during this audit: **target the checked-out BE and web as the single source of truth; preserve compatible mobile features; present proposed removals/reworks and wait for confirmation before changing code.** This confirms the comparison baseline, not permission to implement Phase 2.

`/mobile` in the request maps to the existing `Capstone-project-progress-tracking-system-MOBILE` repository. No replacement mobile repository is proposed.

| Repository | Audited version | Existing working-tree changes observed before this audit |
|---|---|---|
| BE | `main`, `079ee1b` | `src/main/resources/application.yml` modified |
| Web | `main`, `11fb91e` | `package-lock.json` modified |
| Mobile | `refactor/mobile-team-formation-v29`, HEAD `aec62fe`, plus current working tree | Extensive existing modifications, deletions and untracked formation screens/components/tests |

The mobile migration notes reference BE `origin/feat/team-formation-v2.8` at `e0d89ec` and FE `3abeae8`. Those are **different contracts** from the checked-out applications. The locally cached FE `origin/main` is newer again (`7078a14`); no fetch, checkout, pull, merge or source modification was performed. Existing notes are historical evidence, not proof of current parity. See [migration notes][M-migration].

Findings below are from source inspection. Endpoint absence means no matching controller was found in the audited BE; security may return 403 before an unmatched route reaches a 404. No live behavior, OAuth login, screenshots, build, lint or tests were executed in Phase 1. Existing documentation's previous test/export results were not rerun or adopted as current verification.

Severity: **High** blocks a core flow, sends/reads the wrong contract, misrepresents membership/permissions, or risks losing data; **Med** causes incomplete behavior, inconsistent validation/state handling, or maintainability problems; **Low** is visual/copy polish or a minor cleanup. Findings marked “reference conflict” require an explicit BE-compatible resolution rather than copying the web defect.

## Route and screen coverage

The web has six explicit URL routes. Dashboard sections are component state, not separate URL routes. Source-only components are separated below so an unreachable prototype is not presented as a working web feature.

| Web route or section | Actual web implementation | Existing mobile counterpart | Coverage |
|---|---|---|---|
| `/` | Public Home: product explanation, role cards, login/register links | Root redirects to login/dashboard | Public introduction absent; Low |
| `/login` | Email/password, reveal password, remember email, role redirect | `(auth)/login`, Google-only | Different auth behavior; High |
| `/register` | Student/teacher choice, full name, MSSV, department, email, password/confirmation, terms | Registration route deleted in existing working tree | Missing; reference payload also conflicts with BE; High |
| `/student-dashboard`: no group | CreateGroup switches between create and join/search-by-code | Overview embeds CreateGroupContent or MembersBody; `(groups)/create` retained | Layout reusable; contract incompatible; High |
| Student overview | Topic/title, semester, supervisor, approval state, topic change form | `(tabs)/index`: formation size/scope summary | Topic/supervisor/approval absent; High |
| Student members | Member list, code copy, add/remove controls | `(tabs)/members` → MembersScreen | Reusable screen, wrong DTO/member identifier and invite API; High |
| Student schedule | Month calendar, available slots, booking/cancel, pre-meeting questions | None | Missing; High |
| Student progress | Weekly report creation/history | Existing progress screen/service deleted | Missing; High |
| Student documents | Submit link/list documents | Existing documents screen/service deleted | Missing; High |
| Student settings | Read-only Profile | `(tabs)/profile` plus ProfileEditor | Identity reusable; extra editor fields conflict with BE; High |
| `/lecturer/dashboard`: slots/groups/questions | Create/list/filter slots; supervised groups; question reply controls | None; role denied before session acceptance | Missing role portal; High |
| Instructor evaluation | InstructorEvaluation: local demo groups, qualitative scores, delayed success alert; no API persistence | None | Prototype, not a verified write flow; Med |
| Instructor schedule/stats | Heading/description placeholders | None | Placeholders, not completed features; Low |
| Instructor settings | Read-only Profile | Student profile only | Missing role presentation; Med |
| `/admin/dashboard` | Overview counts; group topic approval/supervisor assignment; user list/filter/create/edit handlers; topic list/filter/create handler; own profile edit | None; role denied | Missing role portal; High. Some modal state/handlers lack rendered forms |
| Source-only web components | JoinGroup, TopicManagement, TopicQuestions, MeetingManagement, NotificationCenter, InstructorScheduleManagement; MainLayout is also not wired | Notifications exists; meetings/topics absent | No import/render path from active routes found for these components. TopicManagement and evaluation contain demo behavior |
| Mobile-only formation sections | No active web equivalent for Apply/Vote, management, leave or transfer inboxes | `(tabs)/requests`, `(tabs)/management`, shared request/transfer controls | Preserve compatible intent using actual BE; remove unsupported controls only after approval |

Evidence: [web routes][W-routes], [student dashboard][W-student], [instructor dashboard][W-instructor], [admin dashboard][W-admin], [mobile navigation][M-root], [mobile shell][M-ui].

## Gap table

### Auth, authorization and session behavior

| Area | Web behavior | Mobile current | Difference | Severity (High/Med/Low) | Fix |
|---|---|---|---|---|---|
| A01 — Login methods | Password form calls POST `/auth/login`; Google is not wired in this checkout | Google-only; no password method or form | Approved self-registered students cannot use their password flow. BE password login for other accounts depends on `password-login-enabled`, default false | High | Rework existing login to support BE-permitted methods, retain native Google integration, expose backend failures honestly. [W-login][B-auth][M-auth] |
| A02 — Google request | Web has no campus/Google form | Sends only `{idToken}` | BE GoogleLoginRequest requires non-null `campus`; normal mobile request fails validation | High | Load `/auth/campuses`, require selection, send `{idToken,campus}`, preserve campus mismatch handling. [B-google][M-google] |
| A03 — Google instructions | Web advertises school email/password | Explicitly tells students to use personal imported Google email and never `@fpt.edu.vn`; says self-registration does not exist | BE permits provisioned school Workspace users, and approved self-registered personal-email students. Current copy excludes supported accounts | High | Replace v2.9-only instructions with actual auth/approval requirements; keep existing error/retry UI. [B-auth][M-google] |
| A04 — Account roles | Student route accepts STUDENT/GROUP_LEADER; staff have portals | `MobileUser` is STUDENT-only; `requireMobileUser` rejects all other roles | Valid leaders, instructors and admins are locked out; mobile cannot reach web role parity | High | Define BE role enum, permit supported roles, route to role-specific screens and guard each action. Do not translate LECTURER/TEACHER/REVIEWER aliases into BE roles. COUNCIL has no web route in this checkout: track separately. [W-routes][B-role][M-session] |
| A05 — Leadership changes | Web recognizes global role and membership `isLeader` | Assumes leadership never changes global role; computes from nonexistent `leaderId`/member `leader` | BE elevates creator to GROUP_LEADER. On foreground `/auth/me` refresh mobile rejects that account; action responses do not refresh identity | High | Model global role plus active membership separately; revalidate `/auth/me` after promotion/demotion; preserve revision/cache protections. [B-group-service][M-session][M-formation] |
| A06 — Registration and approval | `/register` validates terms, email, password length and confirmation; sends role/department but no campus | Registration removed | BE accepts student-only registration with MSSV and campus and returns PENDING_APPROVAL without token. Literal web copy/payload is incompatible | High | Restore student registration using BE DTO, web-compatible labels/validations where valid, campus picker and pending/rejected states. Never expose teacher self-registration as a working BE feature. [W-register][B-register] |
| A07 — Token storage/logout/401 | localStorage accessToken/user/role; dashboards clear localStorage; no response interceptor | SecureStore native/localStorage web; verifies `/auth/me`; serialized storage; authenticated 401 clears session/cache; stale responses rejected | Mobile already has stronger working session controls. Neither app has token refresh/revocation endpoints | Low | Preserve these controls. Logout remains local; expired JWT requires sign-in. Do not invent refresh/logout APIs. Refresh expiry config alone is not an implemented refresh contract. [W-api][M-api][M-session][M-auth-context][B-auth-controller] |
| A08 — Route vs data permissions | Web uses stored role and sometimes exposes actions BE refuses | Protected routes only test authenticated state after STUDENT-only acceptance | Enabling staff accounts alone would mount student formation provider/screens; no per-role data/action policy | High | Apply controller and SecurityConfig restrictions at navigation, query and action levels; retain server ownership checks. STUDENT is denied many capstone endpoints by the filter even where controller GET has no annotation. [B-security][M-root] |

### API and model contracts

| Area | Web behavior | Mobile current | Difference | Severity (High/Med/Low) | Fix |
|---|---|---|---|---|---|
| D01 — Root group context | Web tries cached group ID, then `user.groupId`, then scans `/groups` and details | All authenticated pages depend on GET `/me/semesters`, subjects and scope selection | BE has no `/me/semesters` or subject/scope model; formation shell fails before screen content | High | Replace FormationContext's data source with BE-backed group/semester context, preserve shared shell. Handle membership recovery limitation described below; never pick the first recruiting group as “mine”. [M-formation][B-groups] |
| D02 — Group response | Web uses groupCode, semester, status, topic/supervisor and members | Expects code/name/size/state/scopeId/subjectId/major/finalized/leaderId and nested member.profile | BE StudentGroupResponse does not provide these v2.9 fields. Wrong labels/counts/permissions; member.profile may be undefined | High | Use exact response DTOs and explicit view-model mappings; retain `memberCount`, `minMembers`, `meetsMinimum`, `lockedByAdmin`, `rosterStatus`, `rosterNote`, topic/supervisor fields. [B-group-dtos][M-models] |
| D03 — Find groups | Web GET `/groups`, local search group code/topic/category, details per result | `/subjects/{id}/open-groups?q&skill`; tries public group detail | No subject endpoint or skill filter. BE `/groups/{id}` denies nonmember student/leader; web detail probing also fails | High | Use paginated `/groups?available=true` summaries; search only available supported fields with explicit pagination limits. Do not fetch private roster details for applicants. [W-create][B-groups][B-group-service][M-group] |
| D04 — Candidate directory | No working student-directory view | GET `/subjects/{id}/candidates?q&skill` and invite candidate cards | No endpoint. `/users` is ADMIN-only, so it is not a student-directory substitute | High | Remove unsupported directory/filter controls from live navigation after approval; preserve invitation-by-identifier form through real invite API. [M-members][B-users] |
| D05 — Create group | POST `/groups` with semester, groupCode, optional topic/supervisor | POST `/subjects/{id}/groups` with `{name,wantedSkills}` | Wrong route and body; mandatory semester absent. Topic/supervisor selection in web is also rejected for student creators | High | Rework existing form to semester plus optional code; restrict assignments to Admin. Refresh group and identity after success. Remove unsupported name/recruitment-skills fields from live writes. [W-create][B-groups][B-group-service][M-create] |
| D06 — Update group | Web attempts topic/status changes via PUT `/groups/{id}` | Leader edits `{name,wantedSkills}` using that URL | BE PUT is ADMIN-only and accepts topicId/supervisorId/status/leaderUserId; current payload has no supported editable fields | High | Keep display; move supported update actions to Admin role UI. Preserve separate leader lock/invite/remove/request workflows. [W-overview][B-groups][M-management] |
| D07 — Request lists | No active web inbox | `/groups/{id}/requests`, `/subjects/{id}/my-requests` | Both absent. BE has separate group applications/invites and `/me/applications`, `/me/invites`, returning arrays | High | Combine real list results in a domain view model, preserving type, ownership and sourceApplicationId. [B-join][M-group] |
| D08 — Send invitation | Web leader add form directly calls POST `/groups/{id}/members` | POST `/groups/{id}/invitations` | Mobile route absent; web direct add is ADMIN-only. BE leader path is `/groups/{id}/invites` with identifier fields/message | High | Keep invitation form and target real endpoint; membership begins at student acceptance. [B-join][W-members][M-invite] |
| D09 — Request decisions | Web direct joining/addition bypasses application workflow | POST `/requests/{id}/accept`, `/reject`, `/withdraw` for both types | Generic routes absent; invitation accept returns GroupMemberResponse, not JoinRequest | High | Split apply approve/reject/withdraw from invite accept/decline/revoke; refetch correct lists and membership. Exact map below. [B-join][M-request] |
| D10 — Advisory voting | No active web voting UI | PUT/DELETE `/requests/{id}/like`, likes/likedByMe | No Like API. BE uses POST/GET `/applications/{id}/votes`, SUPPORT/OPPOSE and optional comment | High | Rework existing voting control to actual vote contract/tallies; do not turn Like into an unsupported delete or boolean vote. [B-join][B-group-dtos] |
| D11 — Remove member ID | Web passes membership `id` where available | DELETE `/groups/{id}/members/{userId}` | BE resolves GroupMember by membership ID, not account ID | High | Retain membership `id` in mobile DTO and send it. Keep confirmation and refresh. [B-group-service][M-members] |
| D12 — Leave requests | No active web student leave UI; BE exposes request/decision workflow | Immediate `/groups/{id}/leave`, `/me/leave-requests`, `/leader-decision`, `/complaint` | Most routes absent; response and state model incompatible, even though group leave list and withdraw routes exist | High | Keep management screen, replace with `/groups/{id}/leave-requests` and `/approve` or `/reject`; show real pending state and leader/Admin decision. Remove immediate-leave and complaint promises. [B-join][B-leave][M-management] |
| D13 — Leader transfers | No active web voluntary-transfer workflow | Transfer inbox, offer/accept/decline/cancel, `leaveAfter` | All leader-transfer routes absent. BE replacement is Admin-only `/groups/{id}/leader` or group update | High | Remove unsupported voluntary-transfer controls after approval. Preserve leader replacement intent in Admin UI and leader leave request requiring Admin decision. [B-groups][B-leave][M-transfer] |
| D14 — User/profile DTO | Web identity read-only, Admin edits through `/users/{id}` | `/me/profile` editor sends phone/skills/strengths/weaknesses/profilePrivate; User omits campus/eligible/bio/approval fields | BE profile request supports only bio (1000) and skills (500). Extra fields do not persist; missing bio is interpreted as null and clears existing bio | High | Rework editor to bio/skills, preserve existing values; model BE identity/eligibility/approval fields. Do not promise unsupported privacy toggle or contact fields. [B-profile][B-user-dtos][M-profile] |
| D15 — Request profile nullability | Web has no active request-profile renderer | `JoinRequest.student` is required; RequestCard dereferences it; expects full/privacy and extra fields | BE may omit student entirely on closed applications; no full flag; exposes bio/skills according to request visibility, plus supportVotes/opposeVotes | High | Make response fields optional/null-aware and render a hidden/unavailable profile state. Never synthesize private fields or infer full access from membership alone. [B-group-dtos][B-join-service][M-request][M-ui] |
| D16 — Pagination | Most web lists take content from first Spring Page; slots default page 0/size 10 | Notification Page/infinite query correct; group/request lists assumed arrays | BE groups/topics/users/slots/questions/documents/evaluations/requirements return Page; request lists and milestones return arrays | Med | Reuse typed Page adapter and endpoint-specific list types; add pagination when restoring screens; do not copy web's first-page-only membership search. [W-services][B-groups][B-slots][M-models] |
| D17 — Notifications | Source-only NotificationCenter expects count/countRes, while BE returns `{unread}` | Correct notification routes, `{unread}`, paginated content and read actions | Mobile data mapping already matches BE. Authenticated content is still blocked by global formation error; copy targets formation only | Med | Preserve service/pagination/unread polling, make notification/profile pages independent of group-context failure, align wording. No SSE parity requirement: web does not subscribe. [B-notifications][M-notifications][M-ui] |
| D18 — Errors | Web generally displays response.message or local fallback; some failures become empty arrays/success alerts | Error body typed, code translations override server text; fieldErrors never rendered | Required campus/field validation collapses to “Validation failed”; NOT_ELIGIBLE translation hides server reason; several v2.9 codes aren't emitted by this BE | Med | Preserve transport/session handling, add field-level error mapping, retain useful server detail, centralize approved copy; never translate failed writes into success. [B-error][M-errors] |

### Missing features and business rules

| Area | Web behavior | Mobile current | Difference | Severity (High/Med/Low) | Fix |
|---|---|---|---|---|---|
| F01 — Topic/supervisor overview | Active student overview displays title/supervisor/approval, with topic-change form | Formation summary only; old topics route/service deleted | Missing relevant fields and screen behavior; web update sends invalid PENDING and is not authorized for students | High | Add BE-backed overview fields in existing overview; use Admin-only assignment or actual proposal flow if separately approved; do not reproduce failed student PUT. [W-overview][B-groups][B-overview] |
| F02 — Schedule/booking/questions | Active ScheduleGroup calendar, slot booking/cancel, question posting | No screen/service/model | Entire read/write flow absent | High | Add mobile layout around slots/book/cancel and topic question endpoints with actual role guards. Preserve 24h notice, one booking per Vietnam calendar day, one unfinished confirmed booking, and BE 2h cancellation cutoff; require cancellation reason. Web says 12h and passes blank reason: reference conflict. [W-schedule][B-booking] |
| F03 — Weekly progress | Active form/history uses percentage and supervisorFeedback | Removed screen/service | Missing flow; web fields differ from progressPercentage and instructorFeedback, and submits invented completedTasks/pendingTasks | High | Restore BE-compatible weekly progress in small changes; enforce leader-only writes, weeks 1–15, percentage 0–100, real tasks/assignees. Do not copy web's invented percentage increments. [W-progress][B-progress] |
| F04 — Documents | Active link submission/list uses url | Removed screen/service | Missing flow; BE JSON requires fileUrl, returns version/status/fileUrl; sourceType FILE needs authenticated download | High | Restore link/list using DTO; leader-only submission, own-group read permissions; preserve versioning and milestone/session associations. File upload is BE-supported but not an active working web form: track separately. [W-documents][B-artifact] |
| F05 — Instructor portal | Slots/groups/question replies, settings; evaluation demo | Rejected account; no portal | Missing real reads/writes and role-specific navigation | High | Add real slot/supervised-group screens using INSTRUCTOR; preserve BE supervisor restrictions. Question-answer PUT is absent and fake success in web must not be reproduced. Evaluation prototype needs actual numeric BE contract before being called complete. [W-instructor][B-slots][B-question][B-evaluation] |
| F06 — Admin portal | Counts, group approval/assignment, user/topic handlers/list filters, own profile | Rejected account; no portal | Missing actions and access | High | Add authorized Admin screens incrementally, matching supported web wording and BE create/update DTOs. User update requires status; topic creation starts DRAFT even if web sends PUBLISHED. [W-admin][B-users][B-topic] |
| F07 — Apply state transitions | Active web instead tries direct join; BE approve sends an invitation | Mobile confirmation says approval immediately adds student | Approve ≠ joined. Missing APPROVED state and subsequent invitation acceptance | High | Model APPLY PENDING → APPROVED plus linked INVITE; only invite ACCEPTED creates member; retain three-open-apply cap, expiration and server capacity checks. [B-join][B-join-service][M-request] |
| F08 — Group size and membership scope | Web labels/filtering use 4–6 or max 6 | Mobile uses 3–5, one group per subject, repeated literal counts | BE is 3–5 and one active group per semester. Mobile capacity is already right; subject-scoped uniqueness is wrong | Med | Retain 3–5 using one constant/server limits; change uniqueness wording/rules to semester. Do not change max to 6 to imitate web. [W-members][W-create][B-group-service][M-rules] |
| F09 — Eligibility/deadline/locking | Web largely ignores eligibility/deadline and Admin lock origin | Mobile scope phases, canAct, FINALIZED/readOnly drive permissions; `canInvite` does not itself reject locked | These scope properties do not exist here. BE user.eligible and `/me/formation-window?semester=...` govern formation; Admin lock cannot be undone by Leader | High | Replace scope checks with actual account/window/group rules; honor lockedByAdmin and rosterStatus. Keep deadline-aware disabling and server authority. [B-groups][B-join][B-group-service][M-rules] |
| F10 — Leave workflow | No active web leave UI; BE members request Leader approval, Leaders require Admin approval | Optional reason for everyone; immediate leave and automatic successor wording; phase gates may prevent leader request | Leader reason is mandatory; no immediate leave endpoint; leader request may be filed even when roster locked/window closed | High | Rework existing leave card and decisions; keep withdrawal; show pending authority correctly. Successor selected/promoted after Admin approval, not a mobile transfer toggle. [B-leave][M-management] |
| F11 — Rosters | No active web roster submission/review UI | Lock/finalized displayed as roster completion; no submit/review | BE locking and roster approval are separate. Roster DRAFT/SUBMITTED/APPROVED/REJECTED and notes omitted | Med | Show distinct states. Track submit/review as BE-only feature gap, requiring scope decision before adding screens beyond active web parity. [B-groups][B-group-service] |
| F12 — Evaluation and calculation | Web evaluation demo has four qualitative criteria and warning checkbox | No evaluation UI | BE uses three scores 0–100 and total = topicFit×0.4 + productQuality×0.4 + communication×0.2; warning flags separate | Med | If implementing active demo intent, use real DTO and display server total; separate warnings, do not invent a qualitative-to-numeric mapping. [W-evaluation][B-evaluation] |
| F13 — Additional backend workflows | No active web pages for proposals/rounds, requirements/minutes, review/defense scheduling/results, eligibility import, registrations, roster reports, report export | No corresponding screens | BE-supported features are not automatically working web features | Med | Record as BE-only backlog. Do not claim web parity implies all of these are already implemented, or fabricate placeholder writes. [B-proposal][B-review][B-defense][B-report] |

### Validation, presentation, state handling and code quality

| Area | Web behavior | Mobile current | Difference | Severity (High/Med/Low) | Fix |
|---|---|---|---|---|---|
| Q01 — Shared validation | HTML required/email/url/number plus page-local handlers; register has explicit Vietnamese messages | Page-local trim/maxLength/disable conditions; Zod and react-hook-form installed but unused in active source | No shared schemas; invite MSSV nonblank only; profile skills allows 1000 instead of BE 500; registration absent | Med | Add shared BE-shaped schemas, retain exact valid web messages listed below; field error display for every relevant input. Do not add teacher roles/department to register DTO. [W-register][M-profile][M-invite] |
| Q02 — Enums/nullability | Web uses raw statuses and unsupported aliases/PENDING | User role/status are strings; scope/group/leave unions target v2.9; many nullable fields typed as always present | Type-check cannot catch wrong server contract; BE globally omits null fields | High | Define exact BE enums and optional DTO fields; keep unknown-value display fallback without treating unknown as an authorized state. Canonical list below. [M-types][M-models][B-role][B-group-dtos] |
| Q03 — Brand and copy | Active brand is “Lịch Đồ Án”, student heading/menus refer to capstone tracking | “MatchPoint FPT”, “Quản Lý Sinh Viên”, version v2.9, Moderator/subject/major-specific text | Different identity and product promise | Med | Reuse orange/check identity and existing background; update app display name, shell, login/banner and role/menu labels to selected web baseline. Retain BE-correct 3–5 wording where web is stale. [W-login][W-student][M-ui][M-login] |
| Q04 — Color/layout tokens | Orange #E65100, hover #D84315; canvas #FBF9F5; text #2C2825/#6B635B; border #E8E2D9; rounded white cards | Core colors already match; colors.ts defines spacing/radius/shadows, but most new screens use inline literal values | No color redesign needed; spacing/typography/shadow sources duplicated | Low | Preserve palette and readable mobile text; centralize typography/spacing/radius/shadow tokens and use shared buttons/fields/cards. Platform font-sans/system font is acceptable; no custom web font asset found. [M-theme][M-ui] |
| Q05 — Logo/assets/icons | Web check inside outlined rounded square, emojis/inline SVG; FPT background | Matching background file hash; plain check logo, emojis mixed with Ionicons; icon generator creates flat orange PNGs | Background already shared. Logo construction differs; launcher assets require visual verification | Low | Reuse one code-native brand mark and icon policy, retain accessible 44px targets. Inspect actual launcher/splash assets before replacing; generator alone is not proof of current pixels. [M-ui][M-icon] |
| Q06 — Navigation | Student menu: Tổng quan, Thành viên, Lịch hẹn, Tiến độ, Tài liệu, settings; instructor/Admin sections differ | Formation menu only; hidden bottom tabs, responsive sidebar/drawer | Mobile omits active capstone sections; no role menu; path metadata duplicated in tabs and shell; `icon` entries in tabs unused | Med | Keep working drawer/mobile layout, introduce role-aware menu definitions and routes, reuse them for labels/guards. [W-student][M-tabs][M-ui] |
| Q07 — Loading/empty/error isolation | Web has loading/empty text but often hides failures | Shared states/retry/pull-to-refresh work; FormationPage blocks all children on formation error | Notifications and profile cannot render independently when nonexistent context API fails. Some transfer/read-count states are silent | Med | Preserve shared states, isolate context-dependent sections and surface local errors; represent no membership, hidden profile and exhausted page explicitly. [M-ui][M-notifications][M-transfer] |
| Q08 — Offline/freshness | No explicit offline policy | Network/timeout copy, startup retry; verified in-memory session survives transient failures; no connectivity state; header count polls, notification list does not poll | Offline/loading are not clearly distinguished; stale notification/authorization-sensitive data can remain displayed until refresh | Med | Add explicit offline/stale/retry behavior and app-resume invalidation where needed; keep existing session safety. Do not queue writes unless a real reconciliation design is approved. [M-auth-context][M-ui] |
| Q09 — Source structure/duplication | Web organized by pages/services with inline business/UI rules | app routes, screens, contexts, components and services mixed; FormationUI holds shell, primitives, data queries, mutations, privacy renderer | Shared component exists but coupled to formation; counts, request fields/labels and transfer actions repeated | Med | Refactor incrementally into feature presentation/domain/data plus core client/theme/UI; retain route wrappers and working components; consolidate duplicated logic. [M-ui][M-management][M-members] |
| Q10 — any/logs/mocks/URLs/dead code | Web has console logs, demo topic/evaluation data, fake success and hardcoded fallbacks | No explicit `any`, console calls or runtime mock datasets found in active `src`/`app`; API URL from required EXPO_PUBLIC_API_URL | Do not report absent issues as existing mobile bugs. Dev icon script has console.log; tests use fixtures. Unused form/query-string dependencies, MIN_GROUP_MEMBERS and tab metadata need cleanup | Low | Preserve environment configuration and legitimate test fixtures. Remove only verified unused code/dependencies after usage/build checks; do not copy web demo records or hardcoded semester/user/group fallbacks. [M-config][M-package][M-tests] |
| Q11 — Checks and test truth | Web has lint/build scripts | Mobile has strict typecheck/tests, no lint or build script; existing tests explicitly assert v2.9 routes/no campus and reject GROUP_LEADER | Prior passing tests validate the wrong baseline; lint/warnings/native build are unverified | Med | Retain race/401/storage tests; replace incompatible contract tests, add parity contract cases. Configure lint/typecheck and explicit Expo export/native-build checks in Phase 3; report bundles separately from APK/IPA. [M-package][M-tests][M-auth-tests] |
| Q12 — Documentation | Checked-out source differs from newer remote revisions | README/V29_MIGRATION/WEB_UI_PARITY describe alternate baseline and previous exports | Existing docs cannot serve as parity matrix for this target | Med | After implementation update README and feature-parity-matrix.md, retain useful historical notes clearly labeled. No Phase 3 docs/status claims yet. [M-migration] |

## Exact endpoint reconciliation for existing mobile calls

All paths below are relative to `/api/v1`. No BE/FE changes are proposed.

| Existing mobile call | Checked-out BE contract | Proposed disposition |
|---|---|---|
| GET `/auth/google/config`; GET `/auth/me` | Same routes; me has different User DTO | Keep, update DTO |
| POST `/auth/google` `{idToken}` | `{idToken,campus}` | Rework payload/UI |
| PUT `/me/profile` | `{bio,skills}` → UserResponse | Keep route; rework editor/payload |
| GET `/me/semesters` | Absent; GET `/me/formation-window?semester=...`, GET `/eligibility/me`, GET `/groups` provide different pieces | Replace context; no invented equivalent |
| GET `/subjects/{id}/open-groups` | GET `/groups?available=true&page=...&size=...` → Page | Rework; q/skill unsupported server filters |
| GET `/subjects/{id}/candidates` | Absent; `/users` Admin-only | Remove student directory controls |
| POST `/subjects/{id}/groups` | POST `/groups` `{semester,groupCode?,topicId?,supervisorId?}`; last two Admin-only | Rework existing create form |
| GET `/groups/{id}` | Same route, own-group restriction for student/leader | Keep; rework DTO and public-detail behavior |
| PUT `/groups/{id}` `{name,wantedSkills}` | Admin-only `{topicId?,supervisorId?,status?,leaderUserId?}` | Rework into authorized Admin action |
| POST `/groups/{id}/lock` or `/unlock` | Same paths; Admin or Leader; lockedByAdmin restricts unlock | Keep, correct role/rules/DTO |
| DELETE `/groups/{id}/members/{userId}` | DELETE `/groups/{id}/members/{memberId}` | Correct membership identifier |
| POST `/groups/{id}/applications` `{message}` | Same endpoint/body → JoinRequestResponse | Keep, correct response model |
| POST `/groups/{id}/invitations` | POST `/groups/{id}/invites` → JoinRequestResponse | Rename path, preserve form |
| GET `/groups/{id}/requests` | Separate GET `/groups/{id}/applications` and `/groups/{id}/invites` → arrays | Combine in domain layer |
| GET `/subjects/{id}/my-requests` | Separate GET `/me/applications` and `/me/invites` → arrays | Replace; no subject scope |
| POST `/requests/{id}/accept` for APPLY | POST `/applications/{id}/approve` → newly generated INVITE | Rework two-stage workflow |
| POST `/requests/{id}/accept` for INVITE | POST `/invites/{id}/accept` → GroupMemberResponse, HTTP 201 | Rework mapping and membership refresh |
| POST `/requests/{id}/reject` | APPLY: `/applications/{id}/reject` `{reason?}`; INVITE: `/invites/{id}/decline`, no body required | Split by request type |
| POST `/requests/{id}/withdraw` | APPLY: `/applications/{id}/withdraw`; INVITE: `/invites/{id}/revoke` | Split by request type/owner |
| PUT/DELETE `/requests/{id}/like` | POST `/applications/{id}/votes` `{vote:SUPPORT\|OPPOSE,comment?}`; GET votes | Replace Like UI with voting; no delete equivalent |
| POST `/groups/{id}/leave` | POST `/groups/{id}/leave-requests` `{reason?}` → LeaveRequestResponse, HTTP 201 | Rework; leader reason required |
| GET `/groups/{id}/leave-requests` | Same path, different DTO; members see own, leader/Admin all | Keep and map correctly |
| GET `/me/leave-requests` | Absent; group-specific list exists, global `/leave-requests` Admin-only | Rework within known group; no privileged workaround |
| POST `/leave-requests/{id}/leader-decision` | `/approve` with optional newLeaderUserId or `/reject` | Rework role/payload |
| POST `/leave-requests/{id}/withdraw` | Same path → different LeaveRequestResponse | Keep and map |
| POST `/leave-requests/{id}/complaint` | Absent | Remove complaint action |
| `/groups/{id}/leader-transfers`, `/me/leader-transfers`, `/leader-transfers/{id}/...` | Absent; Admin PUT/PATCH/POST `/groups/{id}/leader` accepts target identifiers | Remove voluntary-transfer protocol; add authorized replacement only |
| GET notifications/unread-count; PUT notification read/read-all | Same routes; Page, `{unread}`, NotificationResponse, `{updated}` | Keep |

Source: [mobile service][M-group], [auth service][M-auth], [BE group controller][B-groups], [formation controller][B-join], [profile controller][B-profile], [notification controller][B-notifications].

## Canonical formats, enums and validations

**HTTP/JSON:** Bearer JWT; login result `{accessToken,tokenType,expiresInSeconds,user}`. Access lifetime defaults to 60 minutes in source configuration, subject to environment override. No refresh token field, refresh endpoint or server logout endpoint exists. `GET /auth/me` uses DB-resolved role/status, so role changes take effect on existing JWTs. Null JSON properties are omitted by BE configuration: mobile DTOs must allow absence, not only explicit null.

**Pagination:** Spring Page objects contain `content` and page metadata (`number`, `size`, `totalElements`, `totalPages`, `last`, etc.); query parameters are zero-based `page`, `size`, optional `sort`. Requests/invites/leaves and milestone endpoints return lists; do not apply a Page unwrap globally. Slot filters are instructorId/status/fromDate/toDate; date values must parse as ISO Instant, not arbitrary local date strings. There is no groupId slot filter or booking-list controller.

**Errors:** `{timestamp,status,errorCode,message,path,fieldErrors?}`, where validation fieldErrors are `{field,message}[]`. Validation returns 400 VALIDATION_FAILED; credentials 401 INVALID_CREDENTIALS; unauthenticated 401 UNAUTHORIZED; permission 403 FORBIDDEN; locked/inactive 403 ACCOUNT_LOCKED; business exceptions may use generic BAD_REQUEST/CONFLICT. Preserve details such as eligibility/rejection reasons. Do not assume every 403 is expired authentication. See [error handler][B-error].

| Domain | Checked-out BE values | Mobile delta |
|---|---|---|
| Account role | ADMIN, INSTRUCTOR, COUNCIL, GROUP_LEADER, STUDENT | STUDENT-only session assertion must change; web aliases LECTURER/TEACHER/REVIEWER are not BE values |
| User status | ACTIVE, SUSPENDED, INACTIVE, PENDING_APPROVAL, REJECTED | Replace open string with DTO enum; keep active-only session acceptance |
| Campus | HA_NOI, HO_CHI_MINH, DA_NANG, CAN_THO, QUY_NHON | Missing model/selection/request field |
| Group status | FORMED, ACTIVE, COMPLETED, FAILED, ARCHIVED | OPEN/FULL/LOCKED/DISSOLVED are not GroupStatus; full/locked are separate booleans |
| Member status / leadership | ACTIVE, REMOVED; isLeader boolean; membership id distinct from userId | Member status/id absent; `leader` incorrectly named |
| Roster status | DRAFT, SUBMITTED, APPROVED, REJECTED | Absent; finalized is not a replacement |
| Apply/invite type/status | APPLY, INVITE; PENDING, APPROVED, ACCEPTED, REJECTED, WITHDRAWN, EXPIRED, CANCELLED | APPROVED missing from request union; tally/profile model wrong |
| Advisory vote | SUPPORT, OPPOSE | Likes/likedByMe unsupported |
| Leave status | PENDING, APPROVED, REJECTED, WITHDRAWN | PENDING_LEADER/PENDING_MODERATOR/CLOSED unsupported |
| Slot / booking | AVAILABLE, FULL, IN_SESSION, COMPLETED, CANCELLED / CONFIRMED, ATTENDED, CANCELLED, NO_SHOW | Missing |
| Location / session | ONLINE, OFFLINE / SCHEDULED, IN_PROGRESS, CONCLUDED, CANCELLED | Missing |
| Topic / question | DRAFT, PUBLISHED, ARCHIVED / DRAFT, ACTIVE, DEPRECATED | Missing; do not send group PENDING |
| Artifact | SUBMITTED, SUPERCEDED, ACCEPTED; source LINK or FILE | Missing; retain exact BE spelling SUPERCEDED on wire |
| Requirement / priority | OPEN, IN_PROGRESS, RESOLVED, CLOSED / HIGH, MEDIUM, LOW | Missing |
| Minutes / signing | DRAFT, UNDER_REVIEW, APPROVED, REJECTED / decision APPROVE, REJECT | Missing; sign request requires decision |
| Evaluation / task | DRAFT, SUBMITTED, PUBLISHED / TODO, IN_PROGRESS, DONE | Missing |
| Proposal | PENDING_INSTRUCTOR, PENDING_COUNCIL, APPROVED, REJECTED | BE-only backlog |
| Review / defense | REVIEW_1, REVIEW_2, REVIEW_3 / SCHEDULED, PASSED, FAILED | BE-only backlog; outcome labels are server-provided |
| Warning flags | GROUP_BEHIND_SCHEDULE, MEMBER_INACTIVE; LOW, MEDIUM, HIGH | BE-only implementation distinct from web's demo checkbox |

| Form/action | Web validation/copy | BE requirement and mobile consequence |
|---|---|---|
| Password login | Required email/password; browser email validation; remember email only | Email valid/nonblank, password nonblank; enabled policy and approval state determine availability. Remember-email is absent mobile behavior, not permission to store passwords |
| Register | “Vui lòng đồng ý với Điều khoản sử dụng!”; “Email không hợp lệ! Vui lòng nhập đúng dạng example@fpt.edu.vn”; “Mật khẩu phải chứa ít nhất 8 ký tự!”; “Mật khẩu xác nhận không khớp!” | email/fullName ≤255; password 8–100; MSSV `^[A-Za-z]{2}\d{5,6}$`; campus required; STUDENT only. Web teacher choice/department/email wording requires BE-compatible correction |
| Group create | Required group code/semester; topic/supervisor choices | Semester required; group code optional/generated; student cannot assign topic/supervisor. Do not copy static semester options as a canonical catalog |
| Recruiting profile | Web normal profile read-only | BE editor bio ≤1000, skills ≤500; current mobile skills ≤1000 is invalid and absent bio can be cleared |
| Apply/invite/reject/vote | No active web forms beyond direct member addition | Optional message/reason/comment ≤1000. Application reject reason is optional, while current mobile forces it. Vote type required |
| Leave | No active web form | Optional reason ≤1000 for members; nonblank reason required for leader; current mobile labels it optional for all |
| Slot create/book/cancel | Datetimes required, default 45m, capacity 1; web 12h cancel guard | Future start/end, end after start, duration ≥5, capacity exactly 1. Booking notice ≥24h; cancellation reason nonblank and cutoff 2h; ownership/conflict checks stay on server |
| Weekly report | Required summary/week/percentage 0–100 | weekNumber 1–15, progressPercentage 0–100; summary optional; tasks title/status required, assignee active in group; only Leader writes |
| Link document | Required title and browser URL | JSON title/fileUrl nonblank, optional fileType/sessionId/milestoneId; multipart alternatively file OR url. Do not send JSON url field |
| Question / reply | Schedule uses questionText; standalone TopicQuestions uses content; instructor sends instructorAnswer | POST requires questionText, optional category/guidanceNotes; response has questionText/guidanceNotes. No PUT answer route exists |
| Admin user/topic | Modal state and handlers; topic defaults PUBLISHED | User create role required, optional password min8; update fullName/status required. Topic create topicCode/title required and starts DRAFT; update title/status required |
| Meeting/minute (source-only web) | Web sends no sign body, reads content/signed/status/meetingUrl | BE sessionStatus/rawNotes; minutes generatedContent/finalContent/status/sign timestamps; sign decision required. Missing screen is not proof of a working web flow |

## Reference conflicts and external constraints

These are constraints to report, not permission to edit BE/FE:

1. **Own-group discovery:** STUDENT GET `/groups` returns recruiting groups; GROUP_LEADER gets memberships. UserResponse has no groupId and BE has no my-groups endpoint. A regular student's full/locked group may be absent from discovery. The web's saved group ID works only when already known; scanning details of nonmember groups receives forbidden responses. Mobile can retain a user-scoped known ID and verify membership on every restore, or derive a known group from a valid accepted invitation when available; it cannot guarantee recovery for a fresh install/Admin-added student whose group is hidden. This remains a High integration limitation unless an existing authorized source is identified or a separate BE change is approved outside this task.
2. **Student read permissions:** SecurityConfig allows STUDENT only its formation/identity/notification path set. Topics/slots/documents/progress/overview and other capstone paths fall under the staff/leader rule. Thus the web student menu does not prove ordinary STUDENT access. Mobile must show the real restriction and record the parity failure rather than bypass it or manufacture data.
3. **No direct student join:** web POST `/groups/{id}/join` has no controller; POST members is Admin-only. Both conflict with BE's Apply → Invite → Accept. Implement the real membership workflow and keep the terminology clear.
4. **No student topic assignment:** web overview writes PENDING and student group creation offers supervisor/topic assignment. BE rejects these permissions/values. Admin assignment and proposal workflow are distinct; a proposal screen is not automatically implied by a broken web form.
5. **Web response errors:** documents use url instead of fileUrl; progress uses percentage/supervisorFeedback instead of progressPercentage/instructorFeedback; some questions use content/instructorAnswer instead of questionText/guidanceNotes. Instructor answer catch reports success even on failure. These must not be copied into mobile.
6. **Booking visibility:** GET `/slots?groupId=...` ignores an unsupported filter and returns slots, not BookingResponse records; no booking list controller exists. Upcoming booking IDs/times are available in the restricted group overview response. Do not use a slot ID as a booking ID or claim complete history without an API source.
7. **Prototype controls:** InstructorEvaluation uses local examples and setTimeout; TopicManagement is an unmounted mock; InstructorScheduleManagement is unmounted and calls nonexistent PUT slot update. Admin user/topic modal state/handlers are not all rendered as forms. Upcoming schedule/stats are placeholders. Treat these as incomplete reference features, not successful real-BE writes.
8. **No exact visual sign-off:** source colors/layout/assets were compared and background SHA256 matches; no device/render QA was done. This report is not a pixel-perfect certification.

## Proposed mobile removal/rework list — approval required

**No whole working mobile screen is proposed for deletion.** Existing route shells, components and compatible flows should be adapted in place. The following live controls/contracts cannot remain as functional promises against the selected BE. “Remove” below means remove unsupported live controls/API calls after confirmation, retaining useful reusable code/history rather than deleting an entire working feature without explanation.

| Existing mobile screen/feature | Proposed action in Phase 2 | Reason and compatible behavior to preserve |
|---|---|---|
| FormationContext; semester/subject/scope picker in FormationPage | **Rework** context; **remove** subject/scope/major/currentTerm/phase/finalized/readOnly assumptions and unsupported endpoints | BE groups belong to semester, not subjects/scopes. Preserve server verification, loading/retry, group selection, deadline/capacity/eligibility intent with real fields; disclose membership recovery limitation |
| Login / GoogleAuthSection / student-only session assertion | **Rework** existing login; **remove** “personal Google only/no school email/no registration/staff web-only” policy | BE supports campus-based Google, approved registration/password paths and global roles. Preserve secure storage, native Google build handling, account selection, 401 and race protection |
| CreateGroupContent / `(groups)/create` | **Rework** existing form; **remove** name/wantedSkills/recruitment-tag/subject inputs from live group writes | BE create accepts semester/optional code; assignments are Admin-only. Preserve confirmation, server-generated code support, success/error feedback and refresh |
| Overview / `(tabs)/index` | **Rework** formation-only summary into group/topic/supervisor/semester overview | These fields exist in web/BE; retain 3–5 badge and no-group create/find entry. Do not invent topic approval status from a group lock |
| MembersScreen group search and detail | **Rework** search around paginated summaries; **remove** applicant access to other groups' private member detail | Real GET group detail requires membership for student/leader. Preserve recruiting list, known own-group member view and invitation form |
| Candidate directory and skill filters | **Remove** unsupported student directory/cards/server skill filtering | No candidate endpoint and users is Admin-only. Preserve invitation by MSSV/email/identifier via real invite endpoint; local supported-field search must clearly cover only loaded data |
| RequestsScreen / RequestCard | **Rework** combined inbox and decision controls | BE separates applications/invites; Apply approval generates Invite, accept returns membership; student profile may disappear. Preserve history, expiration disabling, confirmations, rejection text and advisory intent |
| Like / Unlike | **Replace/rework** controls into SUPPORT/OPPOSE vote with optional comment and tallies | No Like/delete endpoint. Preserve member opinion feature, using actual BE voting rather than deleting voting altogether |
| Management group edit card | **Remove** leader name/wantedSkills edit; **rework** supported group changes under Admin | Same URL is Admin-only and has different request fields. Preserve leader lock/invite/kick/leave intent |
| Management lock/unlock | **Rework**, retain existing controls | Routes match; enforce real GROUP_LEADER/Admin role, lockedByAdmin and separate roster state |
| Members/Management kick controls | **Rework** identifier and permissions, retain confirmation | BE expects membership ID; leader kicks only unlocked roster; Admin can change locked roster |
| Management leave card/history | **Rework** into leave request/approve/reject/withdraw; **remove** immediate-leave and unsupported decision-note/Moderator promises | BE approval workflow, status and response differ; leader reason mandatory and Admin decides leader's request. Keep supported leave/history/withdrawal behavior |
| Leave complaint/escalation button | **Remove** unsupported action | No complaint route/state. Keep BE-backed request status and server reason; do not claim automatic escalation |
| LeaderTransferRequests and Management transfer controls | **Remove** offer/accept/decline/cancel/leaveAfter protocol; **rework** replacement under Admin | BE has Admin replacement and Admin-decided leader leave, no voluntary transfer requests. Preserve leadership-change capability only through authorized BE operations |
| ProfileScreen / ProfileEditor / ProfileDetails | **Rework**, retain identity/avatar and BE-supported bio/skills; **remove** unsupported phone/strengths/weaknesses/private switch/major display promises and scope-based edit locks | These fields/privacy protocol are from v2.9. BE profile update is not restricted by subject phase or eligibility. Preserve BE-controlled recruiting visibility and prevent accidental bio clearing. Student identity stays read-only as web; Admin edit separate |
| NotificationsScreen / notificationService | **Keep**, decouple from formation failure; align copy | Endpoints/pagination/unread mapping already match. Preserve unread filter, read actions, retry and load-more |
| FormationUI shell / theme / brand | **Keep and refactor incrementally**, rename brand/menu/copy to web; remove v2.9/Moderator-specific claims | Palette/background/shared primitives are compatible; no redesign or app rewrite needed |
| Auth/formation tests and docs | **Rework** baseline-specific assertions/docs; retain independent session/race/privacy principles | Tests currently require missing campus, unsupported routes, STUDENT-only rejection and absent capstone screens. Preserve useful protection while validating real contract |
| Previously deleted registration/topics/progress/documents files | **Review history and restore/adapt only compatible parts**, add missing routes/screens incrementally | Existing deletions predate audit. Do not blindly reset or overwrite the user's v2.9 work; explain replacements in area-specific commits after approval |

## Implementation order and verification boundary

Proposed order after confirmation:

1. High: auth DTO/campus/login/register/roles, exact models and group context; resolve or explicitly expose own-group discovery/permission limitations. Preserve session/storage/race protections.
2. High: group CRUD identifiers, application/invite two-stage enrollment, voting, locks, leave and Admin replacement; replace unsupported profile payload without losing existing bio.
3. High: active web capstone flows and staff portals, using actual BE DTOs and permissions. Keep reference-only prototypes and BE-only additions separately scoped.
4. Med then Low: validation/error schemas, feature structure/shared components/theme/menu/copy, offline states and verified unused-code cleanup. Use small area-specific commits; never include pre-existing unrelated changes by accident.
5. Phase 3 only: lint/typecheck/build and real-BE login/read/write per supported role; record actual pass/fail and backend denial. Update feature-parity-matrix.md and README. Native OAuth/device/build results must be distinguished from mocked tests and JavaScript export.

Checks in this phase: repository/source/route/controller/DTO/security/enum/form/style/test inspection; matching background hash; no live API writes or app source edits. Runtime behavior remains unverified. The only deliverable added by this audit is this document.

**STOP: awaiting the user's confirmation of this report and proposed rework/removal list before Phase 2.**

## Source references

[W-routes]: ../../Capstone-project-progress-tracking-system-FE/src/App.jsx
[W-login]: ../../Capstone-project-progress-tracking-system-FE/src/auth/Login.jsx
[W-register]: ../../Capstone-project-progress-tracking-system-FE/src/auth/Register.jsx
[W-api]: ../../Capstone-project-progress-tracking-system-FE/src/services/api.js
[W-services]: ../../Capstone-project-progress-tracking-system-FE/src/services
[W-student]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/StudentDashboard.jsx
[W-create]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/CreateGroup.jsx
[W-members]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/MemberGroup.jsx
[W-overview]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/Overview.jsx
[W-schedule]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/ScheduleGroup.jsx
[W-progress]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/ProgressGroup.jsx
[W-documents]: ../../Capstone-project-progress-tracking-system-FE/src/pages/students/DocumentGroup.jsx
[W-instructor]: ../../Capstone-project-progress-tracking-system-FE/src/pages/instructor/InstructorDashboard.jsx
[W-evaluation]: ../../Capstone-project-progress-tracking-system-FE/src/pages/instructor/InstructorEvaluation.jsx
[W-admin]: ../../Capstone-project-progress-tracking-system-FE/src/pages/admin/AdminDashboard.jsx
[B-auth]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/auth/AuthService.java
[B-auth-controller]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/auth/AuthController.java
[B-google]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/auth/dto/GoogleLoginRequest.java
[B-register]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/auth/dto/RegisterRequest.java
[B-role]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/user/Role.java
[B-security]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/config/SecurityConfig.java
[B-groups]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/group/StudentGroupController.java
[B-group-dtos]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/group/dto
[B-group-service]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/group/StudentGroupService.java
[B-join]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/group/GroupJoinController.java
[B-join-service]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/group/GroupJoinService.java
[B-leave]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/group/GroupLeaveService.java
[B-users]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/user/UserController.java
[B-user-dtos]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/user/dto/UserResponse.java
[B-profile]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/user/ProfileController.java
[B-notifications]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/notification/NotificationController.java
[B-error]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/common/exception/GlobalExceptionHandler.java
[B-slots]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/scheduling/ScheduleSlotController.java
[B-booking]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/scheduling/BookingService.java
[B-progress]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/progress/dto/ProgressReportRequest.java
[B-artifact]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/artifact/ArtifactController.java
[B-question]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/question/QuestionBankController.java
[B-topic]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/topic/TopicController.java
[B-evaluation]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/evaluation/EvaluationRecord.java
[B-overview]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/overview/GroupOverviewResponse.java
[B-proposal]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/proposal/TopicProposalController.java
[B-review]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/review/ReviewController.java
[B-defense]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/defense/DefenseController.java
[B-report]: ../../Capstone-project-progress-tracking-system-BE/src/main/java/com/capstone/tracking/report/ReportController.java
[M-migration]: V29_MIGRATION.md
[M-root]: ../app/_layout.tsx
[M-tabs]: ../app/(tabs)/_layout.tsx
[M-login]: ../app/(auth)/login.tsx
[M-auth]: ../src/services/authService.ts
[M-api]: ../src/services/api.ts
[M-session]: ../src/services/sessionStore.ts
[M-auth-context]: ../src/contexts/AuthContext.tsx
[M-formation]: ../src/contexts/FormationContext.tsx
[M-types]: ../src/types/auth.ts
[M-models]: ../src/types/models.ts
[M-group]: ../src/services/groupService.ts
[M-errors]: ../src/services/apiError.ts
[M-google]: ../src/components/GoogleAuthSection.tsx
[M-create]: ../src/screens/CreateGroupContent.tsx
[M-members]: ../src/screens/MembersScreen.tsx
[M-management]: ../app/(tabs)/management.tsx
[M-request]: ../src/components/JoinRequestCard.tsx
[M-invite]: ../src/components/GroupInvitationForm.tsx
[M-transfer]: ../src/components/LeaderTransferRequests.tsx
[M-profile]: ../src/components/ProfileEditor.tsx
[M-notifications]: ../app/(tabs)/notifications.tsx
[M-ui]: ../src/components/FormationUI.tsx
[M-theme]: ../src/constants/colors.ts
[M-rules]: ../src/constants/formation.ts
[M-config]: ../src/constants/config.ts
[M-icon]: ../scripts/generate-icon.js
[M-package]: ../package.json
[M-tests]: ../scripts/formation.test.cjs
[M-auth-tests]: ../scripts/auth.test.cjs
