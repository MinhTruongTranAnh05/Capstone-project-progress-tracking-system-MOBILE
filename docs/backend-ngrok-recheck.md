# Backend URL recheck — 2026-11-03

The owner supplied `https://cortex-bristle-ferry.ngrok-free.dev/v3/api-docs` as the new BE documentation URL. Only the mobile repository was edited for this recheck.

## Public evidence

- OpenAPI: **HTTP 200**, OpenAPI 3.0.1, Team Formation API, 76 paths. Raw response SHA-256: `b967e1f5f096a94d372191fe23f95899ede4819d0901756db420d03b5cf9f854`.
- All path/method sets match the earlier captured v2.9 contract: no added/removed paths or changed methods.
- All eight audited schemas match recursively, including required fields, enums and property constraints: `UserResponse`, `GoogleLoginRequest`, `ProfileRequest`, `GroupRequest`, `GroupResponse`, `JoinRequestResponse`, `MySemester`, `MySubject`.
- Authentication remains POST `/api/v1/auth/google` with `{idToken}`, POST `/api/v1/auth/login` with `{email,password}`, and GET `/api/v1/auth/me`. The documented Google login response contains `accessToken`, `tokenType`, `expiresInSeconds`, and `user`.
- Roles remain `ADMIN`, `LECTURER`, `STUDENT`; leader remains group membership. No topic/progress/document/guidance endpoint was added by this deployment.
- GET `/api/v1/auth/google/config`: **HTTP 200**, `enabled=true`, public `clientId=336326792584-via4aii2ugfnqg7qgee3st7amav9jg56.apps.googleusercontent.com`.

The response above advertises the browser client. On 2026-11-04 the owner selected BE's native server Web client `191002082253-suft0ihkl6o9vt2620g27sqg7atgu6qq.apps.googleusercontent.com` and retired the self-created clients. This endpoint does not reveal all allowed audiences and therefore does **not** establish native audience acceptance. Current configuration and Android registration requirements are in [google-login-setup.md](google-login-setup.md). The earlier local BE patch is historical and is not evidence that this remote deployment runs it.

## Mobile change and limits

`.env` local and `.env.example` now use `https://cortex-bristle-ferry.ngrok-free.dev/api/v1`. No endpoint, payload, role guard, signing key or OAuth client ID was changed. The contract snapshot provenance now points to this source; the audited schemas/path sets were retained because they match.

Restart/reload Metro so the running JS bundle receives the new environment value. No native rebuild is needed for an API URL change. Changing this value does not resolve an independent Android `DEVELOPER_ERROR`; the Android OAuth client still must match `com.fpt.capstone.mobil` and the installed certificate.

Verification after the update: **43 mobile unit/contract/provider tests PASS**, Android Google configuration preflight **PASS**, and Expo's environment loader resolves the new `/api/v1` base. The previously started Metro process was restarted on port 8081 with the updated environment; reload the running app to replace any already loaded bundle. These checks do not perform real authentication.

This recheck made only public GET requests. No password/Google token was submitted, no application session was established, and no DB writes or role-specific flows were exercised. The old tunnel's DNS outage is historical; connectivity to the new public API is verified. Full Google login and the BE mobile-audience check remain **NOT TESTED**.
