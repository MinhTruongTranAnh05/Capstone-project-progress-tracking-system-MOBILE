# Phase 2 progress — 2026-11-01

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
