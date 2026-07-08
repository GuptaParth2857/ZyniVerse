# ZyniVerse Chrome Extension

Quickly look up anime on ZyniVerse — check filler episodes, Indian dub status, and streaming availability without leaving your current page.

## Features

- 🔍 **Search anime** from the popup — get filler %, dub status, and episode counts
- 🏷️ **Context menu** — select any text on any page, right-click, and "Search on ZyniVerse"
- 🖥️ **Site integration** — visit MyAnimeList, AniList, or Anime-Planet to see a ZyniVerse badge with filler/dub info
- ⚡ **Lightweight** — vanilla JS, no framework overhead

## Installation

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder in this project

## Building / Packing

To create a `.zip` for the Chrome Web Store:

```bash
cd chrome-extension
zip -r ../zyniverse-extension.zip . -x "generate-icons.html" "icons/README.md"
```

## Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest (V3)
├── icons/                 # Extension icons (16, 48, 128)
├── popup/                 # Popup UI (search interface)
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/            # Service worker (context menus, messaging)
│   └── background.js
├── content/               # Content script (site integration)
│   ├── content.js
│   └── content.css
├── _locales/en/           # i18n strings
│   └── messages.json
├── generate-icons.html    # Icon preview tool
└── README.md
```

## Resources

- **Website:** [https://zyniverse.app](https://zyniverse.app)
- **API:** `https://zyniverse.app/api/v1`
- **Support:** Report issues on the ZyniVerse repository

## Permissions

- `storage` — Save search history and preferences
- `contextMenus` — Right-click search on any page
- `activeTab` — Detect current page for site integration
- `https://zyniverse.app/*` — Fetch anime data from ZyniVerse API
- `https://graphql.anilist.co/*` — Fallback search via AniList
