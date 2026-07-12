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
eas build --platform android
eas build --platform ios
eas build --platform all    # Both platforms
```

## Features

- **Browse & Search** — Discover anime with trending lists, genre filters, and search
- **Anime Details** — View anime info, scores, streaming platforms, and dub availability
- **Filler Guides** — Color-coded episode lists distinguishing canon, mixed, and filler episodes
- **Schedule** — Weekly airing schedule with notifications
- **Forum** — Community discussions and categories
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
