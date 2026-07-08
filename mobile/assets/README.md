# Assets

This directory contains the app's static assets.

## Icon (`icon.png`)
- Required size: 1024×1024px
- Should be a square PNG with the app icon
- Used for app icon on home screen and in app stores
- Generate using: `npx expo generate-icon <source-image> --output ./assets/icon.png`

## Splash (`splash.png`)
- Recommended size: 1284×2778px (iPhone 6.5" display)
- Content should fit within a centered safe area
- Background color: `#0a0a0f` (matches `app.json` splash config)
- Shows while the app is loading

## Generating Assets
Use Expo's built-in asset generation:
```bash
npx expo generate-icon ./path/to/source.png
```

Or use a service like [AppIcon](https://appicon.co/) to generate all required sizes.

For a quick placeholder, create simple 1024×1024 PNG files with your design tool of choice.
