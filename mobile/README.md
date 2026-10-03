# ZyniVerse Mobile

React Native / Expo mobile app for ZyniVerse — your ultimate anime companion.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/go) app on your phone (iOS/Android)
- (Optional) EAS CLI for production builds: `npm install -g eas-cli`

## Installation

```bash
cd mobile
npm install
```

## Running

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Platform-specific
```bash
npx expo start --android    # Android emulator
npx expo start --ios        # iOS simulator (macOS only)
npx expo start --web        # Web browser
```

## Assets (icon + splash)

`assets/icon.png` and `assets/splash.png` are **generated, not hand-drawn** — do
not edit them by hand. They are derived from the web logo at the repo root
(`logo.png`, a white mark + wordmark lockup on a black plate):

```bash
node scripts/generate-assets.js
```

Outputs:

| File | Purpose |
| --- | --- |
| `assets/icon.png` | 1024×1024, black plate — legacy/standard launcher icon |
| `assets/adaptive-icon-foreground.png` | 1024×1024, transparent, sized to stay inside the 61% circular safe zone |
| `assets/splash.png` | 1024×1024, transparent — splash lockup, shown over the `#0a0a0f` splash background |

After changing any of them run `npx expo prebuild --platform android` so the
generated `android/app/src/main/res` drawables are refreshed. Verify the result
by checking that `assets/icon.png` is **not** a single flat colour — an earlier
revision shipped a solid `#C084FC` placeholder, which is why the published APK
showed a blank purple square instead of the logo.

## Notifications are not wired up

`expo-notifications` is deliberately **not** a dependency. It links Firebase
Messaging + Google Play Services and registers a `FirebaseInitProvider` that runs
*before* `Application.onCreate()`. Without a `google-services.json` and the
`com.google.gms.google-services` Gradle plugin, Firebase has no default options
and the app crashes the moment it is launched from the launcher icon.

To add push notifications later:

1. Create a Firebase project with Android package `app.zyniverse.mobile`.
2. Put `google-services.json` in `mobile/` and add
   `"google-app.json"`-equivalent config (or set
   `android.googleServicesFile` in `app.json`).
3. Apply the `com.google.gms.google-services` plugin to
   `android/app/build.gradle` — EAS injects this when `googleServicesFile` is
   set, a local Gradle build does not.
4. Re-add `expo-notifications` to `dependencies` and `plugins` in `app.json`.
5. Remove the Firebase stripping in `plugins/withZyniManifest.js` first —
   otherwise the safety net will delete the components you just added.

## OTA updates are currently disabled

`expo.updates.enabled` is `false` in `app.json`, so code changes only reach users
by shipping a new APK to Uptodown. The "App update" row in Settings reflects
this (it will always report `up to date`). Enabling OTA needs an EAS project id
and a `runtimeVersion` policy — the `production` channel in `eas.json` is ready
for it.

## Building for Production

```bash
eas build --platform android --profile production
```

> The `production` profile sets `"android": { "buildType": "apk" }`. This matters:
> EAS defaults to an **AAB**, and Uptodown only accepts **APK**. Without this
> line the upload is rejected.
> A debug APK will not work for end users: it has no embedded JS bundle and
> blocks waiting for a Metro dev server.

Local release APK (signed with the debug keystore, for sideloading only):

```bash
node scripts/generate-assets.js
npx expo prebuild --platform android
cd android && gradlew.bat assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```

> `android/local.properties` is wiped by `expo prebuild --clean`; if Gradle
> cannot find the SDK, recreate it with
> `sdk.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk`.

> **Windows path length:** a deeply nested project path breaks the release build.
> Reanimated's native build shells out to `ninja`, which ignores
> `LongPathsEnabled`, so paths over 260 characters fail. Copy the project to a
> short path (e.g. `C:\zv`) and build there, then copy the APK back.

### Entry point: never point `main` at a component file

`package.json`'s `main` is the bundler root for **release** builds. Gradle
resolves it with `expo/scripts/resolveAppEntry` -> `resolveEntryPoint`, and
`export:embed` bundles exactly that file as the root module.

The root module must call `registerRootComponent`. `App.tsx` only does
`export default App`, so pointing `main` at it ships a release APK that dies
immediately on launch with:

```
com.facebook.react.common.JavascriptException: Invariant Violation:
"main" has not been registered.
* A module failed to load due to an error and `AppRegistry.registerComponent`
  wasn't called.
```

Metro hides this in development (it wraps the entry for you), which is why the
app can look fine under `expo start` and still crash as a release APK.

Keep `main` pointing at `index.js`, which registers the component. To check a
built APK, extract `assets/index.android.bundle` and confirm the string
`registerRootComponent` is present; if it is missing, the app will not start.

### APK size: ARM only

The release APK ships `armeabi-v7a` and `arm64-v8a` only, via
`plugins/withAndroidArchitectures.js`. React Native defaults to all four ABIs,
and `x86` / `x86_64` — which exist solely for the Android emulator — were adding
28.5 MB (43% of the build) that no Uptodown user can run.

Two settings are needed, and they do different jobs:

| Setting | Effect |
| --- | --- |
| `gradle.properties` → `reactNativeArchitectures` | Stops modules that compile native code (Reanimated) from *building* x86. Speeds up the build, does **not** shrink the APK. |
| `app/build.gradle` → `defaultConfig { ndk { abiFilters } }` | Actually strips the `.so` files. Without this the dependency AARs contribute every ABI regardless. |

Do not drop `armeabi-v7a` to save a further ~9.8 MB: Uptodown's audience still
includes 32-bit budget phones, and excluding them loses real users. If you ever
do drop it, the app becomes arm64-only and will not install on 32-bit devices.

If the APK grows again, do not guess where the weight went —
`scripts/verify-apk.js` prints a per-group breakdown of the shipped file:

```bash
node scripts/verify-apk.js path/to.apk
```

```
composition  (compressed, 956 entries)
  lib/arm64-v8a     13.80 MB  #######
  dex               11.02 MB  ######
  lib/armeabi-v7a    9.78 MB  #####
  other              2.30 MB  #
  JS bundle          0.83 MB
  res                0.73 MB
```

`dex` at 11 MB is React Native's Java/Kotlin code. Shrinking it needs R8
(`android.enableProguardInReleaseBuilds`), which risks reflection breakage in
Expo / Updates / Reanimated for a few MB. Not worth it here.

## Pushing Updates (OTA) — no APK re-download

After the first production build, code/UI changes reach users **automatically**
(via `expo-updates`), without them re-installing the APK.

```bash
# 1. (one time, logged in) link the Expo project so OTA knows where to publish
npx eas-cli login
npx eas-cli update:configure

# 2. push a code/JS change to all installed apps (apply on next app launch)
npx eas-cli update --channel production

# 3. only for NATIVE changes (new library/plugin, icon, splash, min OS) rebuild:
eas build --platform android --profile production
```

The app checks for updates automatically on launch and downloads them in the
background. Even a downloaded update applies on the next app launch (no forced
restart mid-use). A manual "App update" row in **Settings** shows the status
and can apply a downloaded update by restarting.

## Features

- **Browse & Search** — Discover anime with trending lists, genre filters, and search
- **Anime Details** — View anime info, scores, streaming platforms, and dub availability
- **Filler Guides** — Color-coded episode lists distinguishing canon, mixed, and filler episodes
- **Schedule** — Weekly airing schedule with notifications
- **Forum** — Community discussions and categories
- **Tournaments** — Live anime character tournaments: qualifying polls (one vote per app), live rankings, countdown, and bracket results
- **Profile** — Track your anime lists, stats, and achievements
- **Dub Status** — Check Hindi, Tamil, and Telugu dub availability
- **Recommendations** — Personalized anime suggestions by genre
- **Dark Theme** — Full dark mode UI throughout

## Links

- Web App: [https://zyverse.in](https://zyverse.in)
- API: [https://zyverse.in/api/v1](https://zyverse.in/api/v1)

## Tech Stack

- React Native 0.76
- Expo SDK 52
- React Navigation 7
- TypeScript
