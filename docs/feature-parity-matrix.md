# Feature parity matrix — deployed v2.9

Target changed by explicit user decision on 2026-11-01. API contract: public `/v3/api-docs` at the supplied test tunnel, HTTP 200, 76 paths. Role wording: Student/Leader on mobile; Leader is membership, account remains STUDENT. Coordinator is LECTURER assigned to a semester, with ADMIN fallback; COUNCIL is not a deployed role. No staff portal is in scope.

| Web feature / lecturer requirement | API | Roles | Mobile screen | Status |
|---|---|---|---|---|
| iPhone Expo Go compatibility | No BE change | Student; Leader membership | App entry | Upgraded to SDK 58; Doctor 20/20 and iOS manifest checked; physical device rendering not tested |
| Google login | GET `/auth/google/config`, POST `/auth/google` `{idToken}`, GET `/auth/me` | STUDENT; Leader membership | Login | Implemented and unit/contract checked; real Google login not tested |
| Create account | POST `/auth/register` absent; `/auth/campuses` absent | Neither Student nor Leader exposed | Account-access / registration explanation | **blocked by BE**: no self-registration controller; latest web register is inactive |
| Semester/subject context | GET `/me/semesters`, GET `/groups/{id}` | Student; Leader membership | Shared scope selector | Implemented: per-user known hint, fresh membership/scope verification, no guessing; unit tests pass |
| Create/discover groups | `/subjects/{id}/groups`, `/open-groups`, `/candidates` | Eligible student; recruitment restrictions | Create / Members | Implemented with shared validation; contract tests pass; real read/write not tested |
| Apply / invite / accept | `/groups/{id}/applications`, `/invitations`, `/requests/{id}/accept` | Applicant/invitee or group Leader | Members / Requests | Implemented; accepted Apply joins immediately; contract tests pass; real flow not tested |
| Advisory Like | PUT/DELETE `/requests/{id}/like` | Group members | Requests | Implemented; not SUPPORT/OPPOSE; real write not tested |
| Lock / kick / leave / transfer | Deployed group/request routes | Group Leader/member as permitted by scope | Management | Existing flows retained and contract checked; user ID for kick; live checks pending |
| Profile | PUT `/me/profile` with phone/skills/strengths/weaknesses/profilePrivate | STUDENT | Profile | Implemented with deployed limits/privacy; bio absent from selected BE; real write not tested |
| Notifications | GET `/notifications`, `/unread-count`; PUT read/read-all | STUDENT | Notifications | Mapping/pagination retained; independent rendering during group error; real flow not tested |
| Topic catalog | GET `/topics`, `/topics/{id}` absent | Neither Student nor Leader exposed | Danh mục đề tài | **blocked by BE**: no deployed catalog endpoint; no live denial claimed |
| Topic selection / proposal | Topic-specific endpoint absent; POST `/groups/{id}/topic-proposals` absent | Neither Student nor Leader exposed | Chọn đề tài | **blocked by BE**: group update accepts only name/wantedSkills; no topic field/proposal API |
| Weekly progress | GET/POST `/groups/{id}/progress`, PUT `/progress/{id}` absent | Neither Student nor Leader exposed | Tiến độ tuần | **blocked by BE**: no report endpoints; no fabricated history or submission |
| Advisory/guidance timetable | No advisory/guidance schedule endpoint | Neither Student nor Leader exposed | Lịch tư vấn & hướng dẫn đồ án | **blocked by BE**: formation deadlines are not a guidance schedule |
| Link documents (earlier approved scope) | Document submission/list endpoints absent | Neither Student nor Leader exposed | None | **blocked by BE**: no deployed document controller; no fake submission |
| Booking/appointments | Not used | None in mobile | None | Excluded by lecturer; no booking implementation/testing |
| Admin/Coordinator portals | Staff-only APIs | Staff | None | Out of scope |

“Blocked by BE” above is based on the published contract plus matching source, not a guessed 403/404. Authenticated denials will be copied exactly when real testing is possible. No test data has been written. Only authorized `TEST-` disposable data may be used. Flows needing 3+ signed-in members are not tested with the two supplied accounts. No Phase 3 sign-off yet.

The four required capstone entries are now visible with explicit unavailable states. These are **not** implemented catalog/selection/report/schedule features. Account-access UI matches the Web palette/background/card/banner but cannot create accounts. See [verification.md](verification.md) for 28 passing tests, static checks/export and the Computer Use blocker.
