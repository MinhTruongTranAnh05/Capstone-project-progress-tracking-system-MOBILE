# Android Google login — local device check

The owner created an Android OAuth client in the same Google Cloud project as the mobile Web/server client on 2026-11-03. Android client IDs do not need to be passed to GoogleSignin.configure or added as an invented EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.

## Current Android identity

- Application ID: `com.fpt.capstone.mobil`, explicitly chosen by the owner after the OAuth package mismatch; set in Expo `android.package` and the local generated Android application ID/namespace/Kotlin entry-point package.
- iOS bundle remains `com.fpt.capstone.mobile`. An iOS bundle ID does not reserve an Android package/SHA-1 pair.
- Debug keystore: `android/app/debug.keystore`, alias `androiddebugkey` (the generated Android Gradle debug signing configuration).
- Certificate SHA-1 read with keytool: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
- Google Cloud Android client must have this package and SHA-1. SHA-1 is a public certificate fingerprint, not the OAuth client ID or a client secret.
- This identity is for the current local debug build. A differently signed release/EAS/Play build needs its own actual certificate registered.

The existing Web/server Client ID in `.env` is still used to request the ID token's server audience. iOS configuration is independent. Neither Client secret nor a Google access token is added to mobile source or env.

## Verification of selected `com.fpt.capstone.mobil` identity

- Expo config resolves Android package `com.fpt.capstone.mobil` and iOS bundle `com.fpt.capstone.mobile`.
- Native x86_64 debug rebuild: **PASS**, `BUILD SUCCESSFUL in 37m 27s`, 485 actionable tasks (47 executed, 438 up-to-date). Existing vendor warnings remain.
- Actual APK inspection with `aapt2 dump badging`: package `com.fpt.capstone.mobil`, launch activity `com.fpt.capstone.mobil.MainActivity`.
- Actual APK signature verification: **PASS**, SHA-1 `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`, unchanged from the existing debug signing certificate.
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`, 91,463,481 bytes. This is an emulator x86_64 development APK, not a universal release.
- Installation on `emulator-5554`: **PASS**, `adb install -r` returned `Success`; `pm path com.fpt.capstone.mobil` confirms the new package is installed. The old app was not uninstalled or cleared, so its local data was not migrated/deleted by this change.
- Launch: **PASS to Android permission prompt**. Metro is running on port 8081; a package-targeted development-client deep link opened the new app. It currently awaits the owner's manual nearby-device permission decision.
- Google credential return and BE session for the new package: **NOT TESTED**, pending interactive Google sign-in. No Cloud settings or signing keys were modified. The new ngrok API's OpenAPI and public Google config have since returned HTTP 200; the old tunnel DNS failure is historical. See [backend-ngrok-recheck.md](backend-ngrok-recheck.md) for the new base and remaining mobile-audience verification.

The checked-in source of truth is Expo `app.json`. The owner's existing generated `android/` tree remains untracked as it was before this change; its local application ID/namespace/Kotlin packages were synchronized for the verified build. A fresh Expo prebuild uses the new checked-in Android package. The stale generated autolinking JSON was backed up under ignored `.expo/native-tools/autolinking-before-android-mobil.json`; the regenerated JSON and Java entry point now reference `com.fpt.capstone.mobil`.

## Build/run

Use JDK 17+ (the configured build for this machine uses the existing JBR 21 installation), Android SDK and an emulator with Google Play Services. The machine's default Java 8 is insufficient for the current Gradle/Android build. Expo Go cannot load the Google native module.

Local JDK selection is now persisted in ignored `.env.local` as `JAVA_HOME=C:/Users/Minht/.jdks/jbr-21.0.11`. The installed Expo env loader permits tool roots in `.local` files and passes this value to Gradle. This fixes `npx expo run:android` launched from a fresh PowerShell on this machine without changing system Java or committing a machine-specific JDK path. Verified through the Expo env loader and the actual Gradle wrapper: both Launcher JVM and Daemon JVM report JBR 21.0.11. This was a JVM selection check, not another full APK build or Google login test.

For a different machine, use its own JDK path in ignored `.env.local`. For direct `gradlew.bat` commands (which do not load Expo dotenv), or if the shell already defines a different `JAVA_HOME`, select the JDK in that PowerShell first:

```powershell
$env:JAVA_HOME = 'C:\Users\Minht\.jdks\jbr-21.0.11'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
npx expo run:android
```

```sh
npx expo run:android --device emulator-5554 --no-bundler
npm run start:dev -- --localhost --port 8081
```

Select the actual device ID from `adb devices` if it differs. When Metro runs on localhost, connect the emulator through `adb reverse tcp:8081 tcp:8081`. The current device is Android Studio's Medium Phone, `emulator-5554`; boot completion and installed `com.google.android.gms` were verified. Device IDs and installed system images are local-machine details, not constants in the app.

Local build preparation: Gradle 9.4.1, NDK 27.1.12297006 and Android SDK Build-Tools 37.0.0 were downloaded/installed during the first build.

The first native build failed in Worklets with `ninja: error: mkdir(...react-native-worklets/Common): No such file or directory`. The CMake 3.22.1 installation bundled Ninja 1.10.2. Following the library's Windows build guidance, the local SDK's Ninja executable was updated to official Ninja 1.13.2, verified against the release asset's SHA-256; the old executable is backed up in ignored `.expo/native-tools/ninja-sdk-1.10.2.exe`. No dependency downgrade or Windows security/registry change was made. On this 16 GB machine, the retry limits Gradle to two workers and preserves existing caches:

```sh
cd android
gradlew.bat app:assembleDebug --max-workers=2 --no-parallel --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64
```

This command targets the currently connected x86_64 emulator. Use the actual device architecture when building for another device. See [the library's Windows build guidance](https://docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows/) and [Ninja 1.13.2](https://github.com/ninja-build/ninja/releases/tag/v1.13.2).

## Historical result on 2026-11-03 — previous `com.fpt.capstone.mobile` APK

- Native Android debug build: **PASS**, `BUILD SUCCESSFUL in 22m 13s` (485 actionable tasks). The Google Sign-In native module compiled successfully. Vendor deprecation/Kotlin/manifest warnings remain; this is not a warning-free build.
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`, 91,463,477 bytes, emulator x86_64 development build.
- APK signature: **PASS**, `apksigner verify --print-certs` reports SHA-1 `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`, matching the registered debug identity above.
- Emulator installation: **PASS**, `adb -s emulator-5554 install -r ...` returned `Success`.
- Launch and login UI: **PASS**. The development-client deep link opened the installed app. After the owner handled Android's nearby-device permission prompt, Metro bundled the app and the login screen rendered with the staff form and enabled Google button. The Expo Go/development-build error is absent. No permission decision was automated.
- Google provider UI opening: **PASS**, the installed app reached Google's Android sign-in screen. On inspection after the owner's attempt, Google displayed `Couldn't find this account` below the email field. The account identifier is intentionally omitted from this report. This is an observed Google account-entry error, not an authenticated BE denial or proof that token issuance/audience validation succeeds.
- Google credential return/provider login completion: **NOT VERIFIED**, pending the owner's correction and completion of Google's interactive sign-in. No authentication input was automated, and no token was inspected or logged.
- BE application session: **BLOCKED**, the supplied BE tunnel previously failed DNS resolution; no reachable replacement has been supplied. No credential or DB writes were generated by this check.

Metro remains available on localhost port 8081 through `adb reverse`. A successful native build and an opened app do not establish a successful Google or BE login.

### Follow-up: Android OAuth package mismatch

The owner's next screenshot showed `DEVELOPER_ERROR` from Google and a separate server connectivity error. The installed APK was pulled from `emulator-5554` and inspected directly: its package is `com.fpt.capstone.mobile` and its certificate SHA-1 remains `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`. The owner reported that the Cloud Android client instead uses `com.fpt.capstone.mobil` (missing the final `e`). This is a confirmed mismatch from the supplied Cloud value; the Cloud package must match the installed application ID exactly. Keep the existing Web/server ID in mobile configuration; do not replace it with an Android client ID.

The initial recommendation to align Cloud to the old APK was superseded by the owner's explicit choice to use `com.fpt.capstone.mobil` for Android. Expo and the local generated Android project have therefore been updated to that application ID; iOS retains `com.fpt.capstone.mobile`. Rebuild/install and verify the new APK before retrying Google. The Android Cloud client must use `com.fpt.capstone.mobil` with the verified signing SHA-1 in the project containing the mobile Web/server client. No Cloud settings were changed by the agent, and a successful retry has not been observed. Google's return of an ID token and the BE session remain **NOT VERIFIED**. See [the library's DEVELOPER_ERROR guidance](https://react-native-google-signin.github.io/docs/troubleshooting).

The configured public BE URL was also rechecked outside the tool sandbox and still failed with `The remote name could not be resolved: 'quick-collecting-studies-apparently.trycloudflare.com'`. This independently blocks API login; no authenticated BE error or success is inferred.

The app uses its explicitly configured Web client to open Google directly. It then sends only `{idToken}` to POST `/api/v1/auth/google` and requires the BE session response; provider account selection alone is not an authenticated application session. User account/password/2FA/consent entry remains interactive. No tokens may be pasted into chat, logs or source.

The previously supplied BE tunnel has failed DNS resolution. The authorized v2.9 BE patch exists in a separate worktree, but it has not been deployed or started against an approved DB. Do not claim real application login or data access until a reachable BE is used. A physical/emulated Android phone is not the Backend server.

Sources: [Expo native development builds](https://docs.expo.dev/develop/development-builds/create-a-build/), [Google Sign-In Android signing configuration](https://react-native-google-signin.github.io/docs/setting-up/get-config-file).
