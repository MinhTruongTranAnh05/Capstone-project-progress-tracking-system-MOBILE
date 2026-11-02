# Google login — native setup (2026-11-03)

Only the mobile repository is changed. The Google Cloud project belongs to the app owner. Its public Web and iOS OAuth Client IDs are recorded in `.env.example` and configured in the ignored local `.env`. The client secret is not used by the mobile app and must not be committed. The previously disclosed secret should be revoked in Google Cloud.

## What is configured

- iOS bundle: `com.fpt.capstone.mobile` (must match the Google iOS client).
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: iOS client used for native authentication and the reversed callback URL scheme in `app.config.js`.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: server audience requested by the native SDK. This is also needed for a native mobile app; creating it does not modify the existing website.
- Google returns an ID token; mobile sends only `{idToken}` to `POST /api/v1/auth/google`. The existing BE validates it and returns the application session. No Google profile is trusted as an application session, and no Google token/password is persisted or logged.
- When `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is configured, the button opens Google directly with that ID without waiting for `GET /auth/google/config`. When it is absent, the public config endpoint supplies an enabled client ID as a discovery fallback. This does not change the website or skip BE token/audience validation at `POST /auth/google`.
- Expo Go displays an upfront unavailable notice and a disabled Google button. The native module is loaded only in a configured native build. Cancellation does not contact BE; the SDK offers account selection again after logout or a denied login. Late provider results after the login screen unmounts are ignored.

## Backend handoff (the BE owner performs this)

Add the mobile **Web** Client ID from `.env.example` to `GOOGLE_CLIENT_IDS`, preserving the website's existing allowed client IDs, then restart/redeploy the process with that environment. This is the environment of the process hosting BE, not mobile's `.env`, and does not require a database migration. Do not replace the website client ID or its public default just to configure mobile.

If BE runs on a teammate's machine/server, that host needs the environment update. If the demo will run BE on this computer, obtain its startup instructions and approved test DB connection from the BE owner first; the mobile app does not need its own database. No BE/FE repository file was edited for this handoff.

The old API tunnel failed DNS resolution on 2026-11-02. A new working test API URL and confirmation of the audience configuration are still required. Update `EXPO_PUBLIC_API_URL` in `.env` only after the owner supplies that URL; retain `/api/v1`. No real OAuth login or BE write has been performed with these new IDs.

## Google Cloud

In the same Google Cloud project, retain both the Web client and the iOS client. In Audience, add the approved student Gmail accounts under Test users while the OAuth app is in Testing. These accounts must also exist and be eligible in the BE's student roster. Client IDs are public identifiers; client secrets, passwords, ID tokens and application tokens must not be sent in chat or checked into Git.

For Android, also create an Android OAuth client with package `com.fpt.capstone.mobile` and the **SHA-1 of the certificate actually signing the installed build** in that project. The supplied IDs alone do not configure Android signing. Do not pass an invented `androidClientId` to `GoogleSignin.configure`.

## Prepare a development build

```sh
npm ci
npm run google:check
```

This command checks local configuration only. It cannot verify Google client types, test users, BE allowlisting, tunnel reachability, signing or a successful login.

The project includes `expo-dev-client` and `eas.json` profiles `development` (physical device) and `development-simulator` (iOS Simulator). It is linked to [@minhtruongtrananh05/capstone-mobile](https://expo.dev/accounts/minhtruongtrananh05/projects/capstone-mobile), project ID `0f5d9332-5ac4-4fe8-8a78-42c5c6f6faa8`. Expo account access was verified and both public OAuth IDs below were saved as project-scoped plaintext variables in the **development** cloud environment on 2026-11-03. No other project's variables or website credentials were changed.

`.env` is ignored, so EAS cloud builds do not receive it automatically. The three required cloud variables are:

- `EXPO_PUBLIC_API_URL`: **still missing in cloud**, awaiting a current approved test URL ending in `/api/v1`; the known-dead tunnel was not uploaded.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: **configured**, Web ID from `.env.example`.
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: **configured**, iOS ID from `.env.example`.

The `eas-build-post-install` hook rejects a missing environment or iOS scheme. Do not mark these as secret visibility: they must be available during local app config resolution and are embedded in the app. Do not upload the OAuth client secret.

With the owner signed into Expo and, for a physical iPhone cloud build, a paid Apple Developer account and registered device:

```sh
npx eas-cli@latest login
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
```

The EAS project and its OAuth variables are already configured; do not reinitialize it just to build. Complete Apple account authentication/signing interactively and configure the current API URL first. No Apple credentials, paid signing, device registration or cloud build has been created by this change. After installing the resulting app, enable iOS Developer Mode and start Metro with:

```sh
npm run start:dev -- --clear
```

Open the **installed MatchPoint FPT app**, not Expo Go. Changing the iOS OAuth ID/callback scheme requires a new native build. On macOS, a local Xcode build is an alternative; Windows cannot compile the iOS native project locally. With no paid Apple account, a physical-device local build requires a Mac/Xcode and suitable personal-team signing; the Simulator is another option on Mac. A JS/Hermes export is not an IPA.

## Verify when unblocked

1. Reach the new BE URL and inspect public Google config; stop if the test tunnel is down or the contract changed.
2. Install the signed app and complete Google sign-in interactively with an approved student account.
3. Verify the BE returns an active STUDENT and `/auth/me` restores that identity, then perform the authorized TEST- read/write flows. Preserve the exact BE denial if the audience, roster or eligibility is rejected.
4. Verify cancel/retry/account switching, app logout, restart/restore and expired-session 401 behavior on device. Do not paste or log any token.

Static checks and provider-boundary unit tests do not sign off these device flows.

Sources: [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/), [library Expo setup](https://react-native-google-signin.github.io/docs/setting-up/expo), [Google iOS/server clients](https://developers.google.com/identity/sign-in/ios/start-integrating), [EAS environment variables](https://docs.expo.dev/eas/environment-variables/), [development builds](https://docs.expo.dev/develop/development-builds/create-a-build/).
