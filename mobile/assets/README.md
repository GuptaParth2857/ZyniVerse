# Assets — generated, do not hand-edit

The PNGs in this directory are **build outputs**. Editing them directly (or
dropping in a solid-colour placeholder) is what caused the first published APK
to show a blank purple square instead of the ZyniVerse logo.

Regenerate everything from the web logo at the repo root (`logo.png` — a white
mark + wordmark lockup on a black plate):

```bash
node ../scripts/generate-assets.js
```

| File | Size | Contents |
| --- | --- | --- |
| `icon.png` | 1024×1024 | Black plate (`#000000`) with the lockup at 78% width. Standard/legacy launcher icon. |
| `adaptive-icon-foreground.png` | 1024×1024 | Transparent, lockup at 52% width so it stays inside the 61% circular safe zone that Android masks to. Pairs with `backgroundColor: "#000000"` in `app.json`. |
| `splash.png` | 1024×1024 | Transparent, lockup at 72% width. Expo re-fits this into its 384dp square bitmap, which lands the logo at ~50%. |

The splash is drawn over the `#0a0a0f` background from the `splash` key in
`app.json` — keep these files transparent or with a transparent-safe background,
never a full-bleed colour, or the logo will be hidden behind a flat rectangle.

## After regenerating

```bash
npx expo prebuild --platform android
```

This refreshes `android/app/src/main/res` (the `mipmap-*` launcher icons and the
`drawable-*/splashscreen_logo.png` files that actually ship in the APK). Skip it
and the APK keeps the stale artwork even though the source PNGs look right.

## Checking your work

Run the asset generator's summary — the "dominant" value is the average colour.
A single flat dominant colour means the artwork is missing:

```
assets\icon.png   1024x1024  208.5 KB  dominant #171419
```

A solid `#C084FC` dominant value is the old broken placeholder.
