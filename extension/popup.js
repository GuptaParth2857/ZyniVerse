const API_BASE = "https://zyverse.in";

const keyInput = document.getElementById("key");
const enabledToggle = document.getElementById("enabled");
const statusBox = document.getElementById("status");
const saveBtn = document.getElementById("save");
const recentBox = document.getElementById("recent");

function setStatus(text, kind) {
  statusBox.textContent = text;
  statusBox.className = "status " + kind;
}

chrome.storage.local.get(["zv_api_key", "zv_enabled", "zv_last"], (store) => {
  if (store.zv_api_key) keyInput.value = store.zv_api_key;
  if (store.zv_enabled === false) enabledToggle.checked = false;

  if (store.zv_api_key) {
    setStatus("✅ Key saved. Watching Crunchyroll/Netflix will sync to your ZyniVerse list.", "good");
  } else {
    setStatus("Paste your ZyniVerse API key to start auto-tracking.", "info");
  }

  if (store.zv_last) {
    recentBox.innerHTML = `Last synced: <b>${escapeHtml(store.zv_last.title)}</b> — Ep ${store.zv_last.episode}`;
  }
});

async function verifyKey(apiKey) {
  const res = await fetch(`${API_BASE}/api/v1/me/stats`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return res.ok;
}

saveBtn.addEventListener("click", async () => {
  const apiKey = keyInput.value.trim();
  if (!apiKey) {
    setStatus("Enter your API key first.", "bad");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Verifying…";

  const ok = await verifyKey(apiKey);
  if (ok) {
    await chrome.storage.local.set({
      zv_api_key: apiKey,
      zv_enabled: enabledToggle.checked,
    });
    setStatus("✅ Key verified & saved. Auto-tracking enabled!", "good");
  } else {
    setStatus("❌ Invalid API key. Create one at zyverse.in/profile → API Keys.", "bad");
  }

  saveBtn.disabled = false;
  saveBtn.textContent = "Save & Verify";
});

enabledToggle.addEventListener("change", () => {
  chrome.storage.local.set({ zv_enabled: enabledToggle.checked });
  setStatus(
    enabledToggle.checked ? "✅ Auto-tracking on." : "⏸ Auto-tracking paused.",
    enabledToggle.checked ? "good" : "info"
  );
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "ZV_SCROBBLED" && msg.payload) {
    recentBox.innerHTML = `Last synced: <b>${escapeHtml(msg.payload.title)}</b> — Ep ${msg.payload.episode}`;
    chrome.storage.local.set({ zv_last: { title: msg.payload.title, episode: msg.payload.episode } });
  }
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
