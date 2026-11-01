# Expo SDK 58 compatibility — 2026-11-01

The supplied iPhone screenshot shows Expo Go 58 rejecting the project's SDK 57. Only the mobile repository was changed to address this mismatch.

## Changes

- Expo 58.0.22, Router 58.0.29, React Native 0.88.1 and React/React DOM 19.3.0, with Expo's matching native modules, React types and lint configuration.
- Re-resolved the dependency graph in an ignored temporary directory because npm could not reconcile the installed Router 57 optional peers during the normal upgrade. Installed the resulting lockfile with `npm ci`; no force/legacy-peer-deps override was used.
- Declared `expo-font` directly for vector icons and migrated the removed top-level splash configuration to `expo-splash-screen`'s plugin, retaining the existing asset/background.
- Kept Web export as a single-page app explicitly; Router 58 otherwise changes its default output. Web safe-area spacing now uses CSS environment insets; native retains its safe-area provider.
- Replaced deprecated ImageBackground with View/Image, retaining the login background and overlay.

## Verification

| Check | Result |
|---|---|
| Expo dependency compatibility | PASS — dependencies up to date |
| Expo Doctor | PASS — 20/20 checks |
| ESLint | PASS — zero warnings |
| Strict TypeScript | PASS |
| Existing session/group/contract tests | PASS — 28/28 |
| Web, Android and iOS export | PASS — JS/Hermes bundles, not signed device binaries |
| Local Metro iOS manifest | PASS — HTTP 200; sdkVersion 58.0.0; runtimeVersion exposdk:58.0.0 |
| Opening on the user's iPhone | NOT TESTED — the device must reload from the restarted Metro server |
| Google native login / authenticated BE flows | NOT TESTED — unchanged development-build/OAuth prerequisites |

The first sandboxed Metro startup could not write the React Native DevTools cache. Restarting with the approved filesystem/network access removed that error. Dependency audit still reports findings; no forced security upgrades or security sign-off were performed.

## Reopen on iPhone

Stop the previous Metro terminal with Ctrl+C. In the mobile repository, run:

```sh
npm ci
npm start -- --clear --go
```

Scan the new QR code while the iPhone and development machine can reach each other over LAN. Do not reuse a stale server/QR. Expo Go can now receive an SDK 58 manifest; the app's native Google Sign-In module still requires a development build and correctly refuses that operation inside Expo Go.

References: [SDK upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/), [SDK 58 changes](https://expo.dev/changelog/sdk-58), [Router migration](https://docs.expo.dev/router/migrate/sdk-57-to-58/), [safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/), [splash configuration](https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/), [Google authentication](https://docs.expo.dev/guides/google-authentication/).
