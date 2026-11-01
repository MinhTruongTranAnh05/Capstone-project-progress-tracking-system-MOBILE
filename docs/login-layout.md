# Login screenshot update — 2026-11-01

The user requested the supplied login design and explicitly selected **add Admin/Coordinator password login**, superseding the earlier decision to refuse staff login altogether. All changes are in mobile. Student/Leader business scope and the exclusion of staff portals remain.

- Layout: existing campus photograph with a light overlay, translucent rounded card, 32px logo, bold heading, light rounded inputs, password visibility toggle, orange staff button, Google separator and compact two-part footer. Mobile retains one column and no orange introduction panel.
- API: POST `/auth/login` with email/password and public auth mode. Email is trimmed; password is sent exactly as entered and never stored/logged. Login validation requires an email and nonblank password, matching BE LoginRequest. BE errors are displayed exactly.
- Authentication: only active STUDENT/ADMIN/LECTURER wire roles are accepted. Student uses Google; ADMIN/LECTURER uses password, matching the selected BE AuthController/AuthService. Token-storage serialization, old-request protection, verified restore and 401 handling remain.
- Navigation: Student opens the existing group workspace. Staff opens an identity confirmation screen with current user, refresh and logout. Student routes are guarded, and FormationProvider disables its known-group/semester/group queries for staff.
- Google config stays dynamic. A disabled-config sentence appears only when the server reports disabled; the screenshot's disabled state is not hard-coded. Google native still requires a development build.
- Registration information remains accessible as a compact link. No account-creation request or staff management features were added.

Tests cover staff-session acceptance, unknown/inactive roles, fresh role verification, login-method boundaries, exact password/public HTTP contract, invalid credentials, public 401 isolation and the existing session races/privacy/group rules. No supplied real credential was embedded in code, docs, tests or logs, and no real account login or test-data write was performed.

Static/type/test/export results are in [verification.md](verification.md). Device rendering and authenticated BE behavior remain unverified.
