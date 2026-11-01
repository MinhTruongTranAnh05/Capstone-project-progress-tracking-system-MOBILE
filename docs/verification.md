# Verification — 2026-11-01

Current target: deployed v2.9. No BE/FE source edits. No live authentication or writes were performed.

| Check | Result | Limit |
|---|---|---|
| Deployed OpenAPI | PASS — HTTP 200, 76 paths, evidence in contracts/deployed-v29.json | Public contract inspection only; not authenticated endpoint testing |
| TypeScript | PASS — strict typecheck, unused locals/parameters enabled | Static types are not a device test |
| Unit/contract tests | PASS — 28 tests | HTTP/storage adapters; covers session races/401, deployed operation paths, membership/scope verification, per-user hints, 3–5 capacity and privacy |
| ESLint | PASS — zero warnings allowed | No compiler rules disabled to hide errors; fixes include keyed forms, lazy initialization and async session hydration |
| Web/Android/iOS export | PASS | JS/Hermes export only; no APK/IPA build or install |
| Active source audit | PASS — no Instructor/GVHD/slot/booking logic, explicit any, runtime mocks or console calls | Historical docs/tests may mention removed contracts as evidence |
| Visual/device QA | NOT TESTED | Computer Use stopped because Chrome URL could not be determined confidently enough for policy enforcement; no further browser control attempted |
| Google login, Student read/write | NOT TESTED | Needs interactive login on a supported browser/native OAuth origin |
| Leader create/accept/Like/lock/kick/leave | NOT TESTED on real BE | Requires verified Student A/B sessions and disposable TEST- data; no success/denial inferred |
| 3+ member cases | NOT TESTED | Only two Google accounts supplied |
| Topic catalog/selection, weekly progress, guidance schedule, registration | BLOCKED BY BE | Required routes are absent from deployment/matching source; no fabricated 403/404 or fallback to old BE |

The environment URL is configured only in mobile. The previous local API URL is backed up in ignored `.expo/api-url-before-alignment.txt`. Session tokens remain in SecureStore on native or localStorage on Web; profiles stay in memory. Known group IDs persist per account, but membership and scope must be freshly verified before use.

Follow-up test sequence, once UI/OAuth access is available: Student A logs in and creates TEST- group in SP27; Student B logs in, reads discover/inbox and applies; A accepts and verifies membership (deployed v2.9 immediate join); members Like an open application where applicable; verify lock/unlock, user-ID kick, leave and transfer only on TEST- group's records; verify profile/notification reads/writes without modifying unrelated data. Three-member and maximum-capacity live scenarios remain not tested. Unavailable capstone endpoints are not probed with guessed write bodies.

Installer note: Expo-compatible lint dependency installation reported dependency-audit findings. No forced/breaking dependency upgrade or security-audit sign-off was performed; the pass results above refer to the listed checks only.
