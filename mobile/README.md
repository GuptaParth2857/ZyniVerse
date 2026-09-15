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

## Building for Production

```bash
eas build --platform android --profile production
```

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
