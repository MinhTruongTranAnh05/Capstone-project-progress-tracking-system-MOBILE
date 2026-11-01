# Feature parity matrix — deployed v2.9

Target changed by explicit user decision on 2026-11-01. API contract: public `/v3/api-docs` at the supplied test tunnel, HTTP 200, 76 paths. Role wording: Student/Leader on mobile; Leader is membership, account remains STUDENT. Coordinator is LECTURER assigned to a semester, with ADMIN fallback; COUNCIL is not a deployed role. No staff portal is in scope.

| Web feature / lecturer requirement | API | Roles | Mobile screen | Status |
|---|---|---|---|---|
| Google login | GET `/auth/google/config`, POST `/auth/google` `{idToken}`, GET `/auth/me` | STUDENT; Leader membership | Login | Retarget in progress; real Google login not tested |
| Create account | POST `/auth/register` absent; `/auth/campuses` absent | Neither Student nor Leader exposed | Account-access / registration explanation | **blocked by BE**: no self-registration controller; latest web register is inactive |
| Semester/subject context | GET `/me/semesters`, GET `/groups/{id}` | Student; Leader membership | Shared scope selector | Existing compatible code; membership verification/persistence to finish |
| Create/discover groups | `/subjects/{id}/groups`, `/open-groups`, `/candidates` | Eligible student; recruitment restrictions | Create / Members | Existing compatible code; verification pending |
| Apply / invite / accept | `/groups/{id}/applications`, `/invitations`, `/requests/{id}/accept` | Applicant/invitee or group Leader | Members / Requests | Existing compatible code; accepted Apply joins immediately; no two-stage fallback |
| Advisory Like | PUT/DELETE `/requests/{id}/like` | Group members | Requests | Existing compatible code; not SUPPORT/OPPOSE |
| Lock / kick / leave / transfer | Deployed group/request routes | Group Leader/member as permitted by scope | Management | Existing compatible code; live checks pending |
| Profile | PUT `/me/profile` with phone/skills/strengths/weaknesses/profilePrivate | STUDENT | Profile | Retarget editor; bio absent from selected BE |
| Notifications | GET `/notifications`, `/unread-count`; PUT read/read-all | STUDENT | Notifications | Existing API mapping matches; preserve pagination and improve isolation |
| Topic catalog | GET `/topics`, `/topics/{id}` absent | Neither Student nor Leader exposed | Danh mục đề tài | **blocked by BE**: no deployed catalog endpoint; no live denial claimed |
| Topic selection / proposal | Topic-specific endpoint absent; POST `/groups/{id}/topic-proposals` absent | Neither Student nor Leader exposed | Chọn đề tài | **blocked by BE**: group update accepts only name/wantedSkills; no topic field/proposal API |
| Weekly progress | GET/POST `/groups/{id}/progress`, PUT `/progress/{id}` absent | Neither Student nor Leader exposed | Tiến độ tuần | **blocked by BE**: no report endpoints; no fabricated history or submission |
| Advisory/guidance timetable | No advisory/guidance schedule endpoint | Neither Student nor Leader exposed | Lịch tư vấn & hướng dẫn đồ án | **blocked by BE**: formation deadlines are not a guidance schedule |
| Booking/appointments | Not used | None in mobile | None | Excluded by lecturer; no booking implementation/testing |
| Admin/Coordinator portals | Staff-only APIs | Staff | None | Out of scope |

“Blocked by BE” above is based on the published contract plus matching source, not a guessed 403/404. Authenticated denials will be copied exactly when real testing is possible. No test data has been written. Only authorized `TEST-` disposable data may be used. Flows needing 3+ signed-in members are not tested with the two supplied accounts. No Phase 3 sign-off yet.
