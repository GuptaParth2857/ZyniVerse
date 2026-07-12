const ZYNI_URL = 'https://zyverse.in';

chrome.runtime.onInstalled.addListener((details) => {
  // Set default settings
  chrome.storage.local.get(['settings'], ({ settings }) => {
    if (!settings) {
      chrome.storage.local.set({
        settings: {
          showBadge: true,
          autoSearch: true,
          theme: 'dark',
        },
      });
    }
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'search-zyniverse',
    title: 'Search on ZyniVerse',
    contexts: ['selection'],
  });

  // Open welcome page on install
  if (details.reason === 'install') {
    chrome.tabs.create({ url: `${ZYNI_URL}/welcome?ref=extension` });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'search-zyniverse' && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    chrome.tabs.create({ url: `${ZYNI_URL}/search?q=${query}&ref=extension` });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_ANIME_DATA') {
    fetchAnimeData(message.animeId, message.title)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'OPEN_ZYNI_PAGE') {
    chrome.tabs.create({ url: message.url });
  }
});

async function fetchAnimeData(animeId, title) {
  const url = `${ZYNI_URL}/api/v1/anime/${animeId}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}
