# Google login — BE-supplied clients (2026-11-04)

The owner retired the self-created OAuth clients and selected the two Web clients supplied by the BE team. Local `.env` and checked-in `.env.example` now use these values:

| Platform | Variable | BE-supplied Web Client ID |
| --- | --- | --- |
| Browser | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `336326792584-via4aii2ugfnqg7qgee3st7amav9jg56.apps.googleusercontent.com` |
| Native server audience | `EXPO_PUBLIC_GOOGLE_MOBILE_WEB_CLIENT_ID` | `191002082253-suft0ihkl6o9vt2620g27sqg7atgu6qq.apps.googleusercontent.com` |

Both supplied clients are type **Web application**. The client named `mobile` is the native SDK's server audience, not an Android or iOS OAuth client. The old iOS ID has been removed from local/example configuration; iOS Google sign-in and its configuration preflight remain unavailable until BE supplies a matching iOS OAuth client.

The BE team's Android-client screenshot on 2026-11-04 identifies a concrete mismatch in the failed native trial: BE registered **`com.fpt.capstone.mobile`**, while the installed APK used **`com.fpt.capstone.mobil`**. The screenshot's SHA-1 matches the debug certificate, and its Android Client ID starts with the same `191002082253-` project number as the selected native server Web client. Expo and generated native sources are now aligned to `com.fpt.capstone.mobile`. Native rebuild **PASS** (`6m 6s`); actual APK package/signature inspection and emulator installation **PASS**. Metro 8082 reports the new package. The subsequent interactive native attempt reached the BE denial **`Google ID token was not issued for this application`**, replacing the previous provider `DEVELOPER_ERROR`. Native credential return is supported by that BE exchange and the code's required-ID-token boundary; the token itself was not inspected or logged. A successful application session has not been established.

The owner also requested deletion of the old self-created OAuth clients on Google Cloud. **No Cloud deletion has been verified**: browser access was unavailable and Windows Computer Use was stopped by the physical Escape key. Removal from configuration does not delete Cloud resources. Keep both BE-supplied clients.

## What is configured

- iOS bundle: `com.fpt.capstone.mobile` (must match the Google iOS client).
- Android application ID: `com.fpt.capstone.mobile`, matching the Android OAuth client supplied by BE. The earlier `com.fpt.capstone.mobil` installation is historical. The signing certificate stays unchanged.
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: empty pending the BE-supplied iOS client; when supplied it determines the callback scheme in `app.config.js`.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: browser audience from the BE team's Capstone Web client.
- `EXPO_PUBLIC_GOOGLE_MOBILE_WEB_CLIENT_ID`: native SDK server audience from the BE team's Web client named `mobile`.
- Google returns an ID token; mobile sends only `{idToken}` to `POST /api/v1/auth/google`. The existing BE validates it and returns the application session. No Google profile is trusted as an application session, and no Google token/password is persisted or logged.
- Each platform opens Google with its explicit audience. Only web uses `GET /auth/google/config` as a fallback; a missing native audience disables native Google sign-in rather than substituting the browser client. BE still validates tokens at `POST /auth/google`.
- Expo Go displays an upfront unavailable notice and a disabled Google button. The native module is loaded only in a configured native build. Cancellation does not contact BE; the SDK offers account selection again after logout or a denied login. Late provider results after the login screen unmounts are ignored.

## Running backend audience configuration

An earlier experimental v2.9 patch on `fix/mobile-google-oauth` used the now-retired self-created mobile audience. That historical patch/default is not the current configuration. The actual running BE must accept the newly selected native server Web ID above in `GOOGLE_CLIENT_IDS`, alongside its browser audience. No local BE change updates the teammate's running server automatically.

The current mobile attempt reaches the exact audience-rejection message used by `TokenInfoGoogleTokenVerifier`. The teammate hosting BE must add the native server Web ID to the process's `GOOGLE_CLIENT_IDS`, preserving its existing browser audience and any other valid entries, then restart/redeploy BE. For the two supplied audiences:

```dotenv
GOOGLE_CLIENT_IDS=336326792584-via4aii2ugfnqg7qgee3st7amav9jg56.apps.googleusercontent.com,191002082253-suft0ihkl6o9vt2620g27sqg7atgu6qq.apps.googleusercontent.com
```

This is the environment of the process hosting BE, not mobile's `.env`. Keep token audience validation enabled. No local edit updates the teammate's already running server.

If BE runs on a teammate's machine/server, that host needs the patched build or the environment update. If the demo will run BE on this computer, an approved test DB connection/startup configuration is still needed; the mobile app does not need its own database. Do not start the old BE main contract just because its local configuration exists: mobile targets v2.9.

The owner supplied a new BE URL on 2026-11-03: `https://cortex-bristle-ferry.ngrok-free.dev/api/v1`. Mobile `.env`/`.env.example` use it. Public Google config was rechecked after the native attempt on 2026-11-04: HTTP 200, `enabled=true`, advertising the `336326792584-` browser client. That endpoint does not expose the complete audience allowlist. The actual native login attempt now returns the audience denial above; successful authentication remains pending BE runtime configuration. No authenticated student data write was performed. See [backend-ngrok-recheck.md](backend-ngrok-recheck.md).

## Google Cloud

The BE team supplied the Android-client screen as well as the Web-client screens. It registers package `com.fpt.capstone.mobile` and the debug SHA-1 below. Test users must also be eligible in BE's student roster. Client IDs are public; client secrets, passwords and tokens are not configuration for the mobile app.

For Android, the APK must use package `com.fpt.capstone.mobile` and certificate SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, matching BE's screenshot. Inspect the rebuilt APK itself before installing it. Android client IDs are not passed as `webClientId` to the SDK. See [Android verification](android-google-login.md).

## Prepare a development build

```sh
npm ci
npm run google:check:android
npm run google:check:web
```

This command checks local configuration only. It cannot verify Google client types, test users, BE allowlisting, tunnel reachability, signing or a successful login.

The project includes `expo-dev-client` and EAS development profiles. It is linked to [@minhtruongtrananh05/capstone-mobile](https://expo.dev/accounts/minhtruongtrananh05/projects/capstone-mobile), project ID `0f5d9332-5ac4-4fe8-8a78-42c5c6f6faa8`. Earlier development environment variables were created before this migration; remote EAS cleanup/update is **not yet verified**. They must not be assumed to match the local configuration.

`.env` is ignored, so EAS cloud builds do not receive it automatically. Before the next cloud build, synchronize:

- `EXPO_PUBLIC_API_URL`: current approved URL ending in `/api/v1`.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: BE-supplied browser ID from `.env.example`.
- `EXPO_PUBLIC_GOOGLE_MOBILE_WEB_CLIENT_ID`: BE-supplied native server ID from `.env.example`.
- Remove the retired `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`; only set it again after BE supplies the matching iOS client.

The `eas-build-post-install` hook rejects a missing environment or iOS scheme. Do not mark these as secret visibility: they must be available during local app config resolution and are embedded in the app. Do not upload the OAuth client secret.

With the owner signed into Expo and, for a physical iPhone cloud build, a paid Apple Developer account and registered device:

```sh
npx eas-cli@latest login
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
```

Do not reinitialize the linked EAS project. Complete the current environment setup and obtain the BE-supplied iOS client before an iOS build. Apple authentication/signing stays interactive. No signing or cloud build was started by this cleanup. Start Metro for an installed development app with:

```sh
npm run start:dev -- --lan --port 8082
```

Open the **installed MatchPoint FPT app**, not Expo Go. Changing the iOS OAuth ID/callback scheme requires a new native build. On macOS, a local Xcode build is an alternative; Windows cannot compile the iOS native project locally. With no paid Apple account, a physical-device local build requires a Mac/Xcode and suitable personal-team signing; the Simulator is another option on Mac. A JS/Hermes export is not an IPA.

## Verify when unblocked

1. Reach the new BE URL and inspect public Google config; stop if the test tunnel is down or the contract changed.
2. Install the signed app and complete Google sign-in interactively with an approved student account.
3. Verify the BE returns an active STUDENT and `/auth/me` restores that identity, then perform the authorized TEST- read/write flows. Preserve the exact BE denial if the audience, roster or eligibility is rejected.
4. Verify cancel/retry/account switching, app logout, restart/restore and expired-session 401 behavior on device. Do not paste or log any token.

Static checks and provider-boundary unit tests do not sign off these device flows.

Sources: [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/), [library Expo setup](https://react-native-google-signin.github.io/docs/setting-up/expo), [Google iOS/server clients](https://developers.google.com/identity/sign-in/ios/start-integrating), [EAS environment variables](https://docs.expo.dev/eas/environment-variables/), [development builds](https://docs.expo.dev/develop/development-builds/create-a-build/).
