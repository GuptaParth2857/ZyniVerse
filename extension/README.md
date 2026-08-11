# ZyniVerse Auto-Tracker — Browser Extension

Chrome (Manifest V3) extension that automatically syncs the anime you watch on
**Crunchyroll** and **Netflix** to your ZyniVerse watchlist — episodes logged, progress updated.

## How it works

1. Content script detects the currently-playing anime + episode on Crunchyroll/Netflix.
2. It reports the title/episode to the background service worker.
3. Background calls `POST https://zyverse.in/api/v1/scrobble` with your API key.
4. ZyniVerse matches the title to an AniList anime, sets it to **Currently Watching**, and records the episode progress.

## Install (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select this `extension` folder
4. Pin the extension, click it, paste your API key (`zyverse.in/profile` → API Keys), hit **Save & Verify**

## API endpoint used

`POST /api/v1/scrobble` with header `Authorization: Bearer <key>`
Body: `{ "title": "Naruto", "episode": 3 }`

You can also pass `mediaId` directly to skip title matching.

## Files

- `manifest.json` — extension manifest (MV3)
- `content.js` — Crunchyroll/Netflix episode detection
- `background.js` — sends scrobbles to ZyniVerse
- `popup.html` / `popup.js` — settings UI (API key + toggle)
- `icons/` — add `icon16.png`, `icon48.png`, `icon128.png` (any purple/gradient anime icons)

## Local testing

The extension targets `https://zyverse.in`. To test against a local build,
change `API_BASE` in `content.js`/`background.js`/`popup.js` to `http://localhost:3000`
and add it to `host_permissions` in `manifest.json`.
