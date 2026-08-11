/**
 * ZyniVerse Auto-Tracker — background service worker
 * Receives scrobbles from content scripts and posts them to the ZyniVerse API
 * using the user's saved API key.
 */

const API_BASE = "https://zyverse.in";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "ZV_SCROBBLE") {
    chrome.storage.local.get(["zv_api_key", "zv_enabled"], async (store) => {
      if (store.zv_enabled === false) return sendResponse({ ok: false, error: "disabled" });
      const apiKey = store.zv_api_key;
      if (!apiKey) return sendResponse({ ok: false, error: "no-key" });

      try {
        const res = await fetch(`${API_BASE}/api/v1/scrobble`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            title: message.payload.title,
            episode: message.payload.episode,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          sendResponse({ ok: true, data });
          chrome.runtime.sendMessage({ type: "ZV_SCROBBLED", payload: data }).catch(() => {});
        } else {
          sendResponse({ ok: false, error: data.error || `HTTP ${res.status}` });
        }
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    });
    return true; // async
  }
});
