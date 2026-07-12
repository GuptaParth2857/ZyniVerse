(function () {
  'use strict';

  const ZYNI_API = 'https://zyverse.in/api/v1';

  function getPageType() {
    const host = window.location.hostname;
    if (host.includes('myanimelist.net')) return 'mal';
    if (host.includes('anilist.co')) return 'anilist';
    if (host.includes('anime-planet.com')) return 'animeplanet';
    return null;
  }

  function extractAnimeInfo() {
    const page = getPageType();
    if (page === 'mal') {
      // MyAnimeList: title in h1 with class "title-name" or inside .h1-title
      const titleEl = document.querySelector('.title-name h1, .h1-title h1, h1.title-name');
      const title = titleEl ? titleEl.textContent.trim() : null;

      // Try to get MAL ID from URL
      const match = window.location.pathname.match(/\/anime\/(\d+)/);
      const malId = match ? parseInt(match[1]) : null;

      return { title, malId, page };
    }

    if (page === 'anilist') {
      // AniList: title in header
      const titleEl = document.querySelector('.page-header h1, .header h1, [data-testid="media-title"]');
      const title = titleEl ? titleEl.textContent.trim() : null;

      // Get AniList ID from URL
      const match = window.location.pathname.match(/\/anime\/(\d+)/);
      const anilistId = match ? parseInt(match[1]) : null;

      return { title, anilistId, page };
    }

    if (page === 'animeplanet') {
      const titleEl = document.querySelector('h1[itemprop="name"], h1.pageTitle, .entry-title');
      const title = titleEl ? titleEl.textContent.trim() : null;

      return { title, page };
    }

    return { title: null, page };
  }

  async function fetchFillerData(animeId, title) {
    try {
      const res = await fetch(`${ZYNI_API}/filler/${animeId}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    // Try searching by title
    try {
      const searchRes = await fetch(`${ZYNI_API}/anime/search?q=${encodeURIComponent(title)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (searchRes.ok) {
        const json = await searchRes.json();
        if (json.data && json.data.length > 0) {
          const found = json.data[0];
          const fr = await fetch(`${ZYNI_API}/filler/${found.id}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (fr.ok) {
            const fjson = await fr.json();
            return fjson.data || fjson;
          }
        }
      }
    } catch {}

    return null;
  }

  async function fetchDubStatus(malId) {
    if (!malId) return null;
    try {
      const res = await fetch(`${ZYNI_API}/dub-status/${malId}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}
    return null;
  }

  function createBadge(fillerPct, dubStatus, animeId) {
    const existing = document.querySelector('.zyni-badge-widget');
    if (existing) existing.remove();

    const badge = document.createElement('div');
    badge.className = 'zyni-badge-widget';

    let dubText = 'Dub: ?';
    let dubClass = 'zyni-dub-unknown';
    if (dubStatus) {
      if (dubStatus.isDubbed === true || dubStatus.isIndianDub === true) {
        dubText = 'Dub: Hindi ✓';
        dubClass = 'zyni-dub-yes';
      } else if (dubStatus.isDubbed === false) {
        dubText = 'No Dub';
        dubClass = 'zyni-dub-no';
      }
    }

    const fillerText = fillerPct != null ? `Filler: ${Math.round(fillerPct)}%` : 'Filler: ?';

    badge.innerHTML = `
      <div class="zyni-badge-header">ZyniVerse</div>
      <div class="zyni-badge-body">
        <span class="zyni-filler-badge">${fillerText}</span>
        <span class="zyni-dub-badge ${dubClass}">${dubText}</span>
      </div>
    `;

    badge.title = 'Click to open ZyniVerse filler guide';
    badge.addEventListener('click', () => {
      const url = animeId
        ? `https://zyverse.in/anime/${animeId}/filler`
        : 'https://zyverse.in/filler';
      window.open(url, '_blank');
    });

    return badge;
  }

  async function init() {
    const info = extractAnimeInfo();
    if (!info.title && !info.malId && !info.anilistId) {
      // For AniList, try to get from page state
      if (info.page === 'anilist') {
        const metaData = document.querySelector('script[data-name="page"]');
        if (metaData) {
          try {
            const data = JSON.parse(metaData.textContent);
            info.anilistId = data.id;
          } catch {}
        }
      }
      if (!info.title && !info.anilistId && !info.malId) return;
    }

    const animeId = info.anilistId || info.malId;

    // Fetch filler data
    let fillerData = null;
    if (animeId) {
      fillerData = await fetchFillerData(animeId, info.title);
    }

    // Fetch dub status
    let dubStatus = null;
    if (info.malId) {
      dubStatus = await fetchDubStatus(info.malId);
    } else if (fillerData && fillerData.malId) {
      dubStatus = await fetchDubStatus(fillerData.malId);
    }

    const fillerPct = fillerData?.fillerPercent ?? null;
    const badge = createBadge(fillerPct, dubStatus, animeId);

    // Inject badge into the page
    if (info.page === 'mal') {
      const sidebar = document.querySelector('#content .rightside, .borderClass');
      if (sidebar) {
        sidebar.prepend(badge);
      } else {
        document.body.appendChild(badge);
      }
    } else if (info.page === 'anilist') {
      const sidebar = document.querySelector('.sidebar, .page-content aside, [class*="sidebar"]');
      if (sidebar) {
        sidebar.prepend(badge);
      } else {
        const main = document.querySelector('.page-content, main, .content');
        if (main) main.prepend(badge);
        else document.body.appendChild(badge);
      }
    } else if (info.page === 'animeplanet') {
      const main = document.querySelector('#contentWrapper, .mainWrapper, .pageContent');
      if (main) main.prepend(badge);
      else document.body.appendChild(badge);
    }

    // Also notify background script
    chrome.runtime.sendMessage({
      type: 'ANIME_DETECTED',
      data: { title: info.title, animeId, fillerPct, dubStatus },
    });
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
