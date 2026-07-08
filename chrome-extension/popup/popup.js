const ZYNI_API = 'https://zyniverse.app/api/v1';
const ANILIST_API = 'https://graphql.anilist.co';

const $ = (id) => document.getElementById(id);
const searchInput = $('search-input');
const searchBtn = $('search-btn');
const resultsEl = $('results');
const loadingEl = $('loading');
const errorEl = $('error');
const errorText = errorEl.querySelector('.error-text');

let currentResults = [];

// Load last search on open
chrome.storage.local.get(['lastSearch', 'lastResults'], ({ lastSearch, lastResults }) => {
  if (lastSearch) {
    searchInput.value = lastSearch;
  }
  if (lastResults && lastResults.length > 0) {
    currentResults = lastResults;
    renderResults(lastResults);
  }
});

searchBtn.addEventListener('click', () => doSearch());
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});

async function doSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  showLoading();
  hideError();

  try {
    const data = await searchAnime(query);
    if (data && data.length > 0) {
      currentResults = data;
      chrome.storage.local.set({ lastSearch: query, lastResults: data });
      renderResults(data);
    } else {
      showError('No results found. Try a different search term.');
    }
  } catch (err) {
    showError(err.message || 'Failed to search. Please try again.');
  }
}

async function searchAnime(query) {
  // Try ZyniVerse API first
  try {
    const res = await fetch(`${ZYNI_API}/anime/search?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) return json.data;
    }
  } catch {}

  // Fallback to AniList GraphQL search
  const gqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title { romaji english native }
          coverImage { large medium }
          episodes
          format
          status
          averageScore
          genres
          studios { nodes { name } }
        }
      }
    }
  `;

  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: gqlQuery, variables: { search: query } }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error('API request failed');

  const json = await res.json();
  if (!json.data?.Page?.media?.length) return [];

  // Try to enrich with filler data from ZyniVerse
  const media = json.data.Page.media;
  const enriched = await Promise.all(media.map(async (anime) => {
    let fillerData = null;
    try {
      const fr = await fetch(`${ZYNI_API}/filler/${anime.id}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (fr.ok) fillerData = await fr.json();
    } catch {}

    let dubData = null;
    if (anime.idMal) {
      try {
        const dr = await fetch(`${ZYNI_API}/dub-status/${anime.idMal}`, {
          signal: AbortSignal.timeout(3000),
        });
        if (dr.ok) dubData = await dr.json();
      } catch {}
    }

    return {
      id: anime.id,
      idMal: anime.idMal,
      title: anime.title.english || anime.title.romaji || anime.title.native,
      nativeTitle: anime.title.native,
      coverImage: anime.coverImage?.large || anime.coverImage?.medium || null,
      episodes: anime.episodes,
      format: anime.format,
      status: anime.status,
      score: anime.averageScore,
      genres: anime.genres,
      studio: anime.studios?.nodes?.[0]?.name || null,
      fillerPercent: fillerData?.data?.fillerPercent ?? null,
      filler: fillerData?.data ?? null,
      dub: dubData?.data ?? null,
    };
  }));

  return enriched;
}

function renderResults(animeList) {
  resultsEl.innerHTML = '';
  animeList.forEach((anime) => {
    const card = document.createElement('div');
    card.className = 'result-card';

    const coverUrl = anime.coverImage || '';
    const fillerPct = anime.fillerPercent != null ? anime.fillerPercent : (anime.filler?.fillerPercent ?? null);
    const dubData = anime.dub;

    let dubBadge = '<span class="badge badge-dub-unknown">Dub: ?</span>';
    if (dubData) {
      if (dubData.isDubbed === true || dubData.isIndianDub === true) {
        dubBadge = '<span class="badge badge-dub">Dub: Hindi ✓</span>';
      } else if (dubData.isDubbed === false) {
        dubBadge = '<span class="badge badge-dub-none">No Dub</span>';
      }
    }

    let fillerBadge = '';
    if (fillerPct != null) {
      const pct = Math.round(fillerPct);
      fillerBadge = `<span class="badge badge-filler">Filler: ${pct}%</span>`;
    }

    const episodes = anime.episodes ? `${anime.episodes} eps` : '';

    card.innerHTML = `
      <img class="cover" src="${coverUrl}" alt="${escapeHtml(anime.title)}" loading="lazy"
        onerror="this.style.display='none'">
      <div class="info">
        <div class="title">${escapeHtml(anime.title)}</div>
        <div class="meta">
          ${fillerBadge}
          ${dubBadge}
          ${episodes ? `<span class="badge" style="background:rgba(148,163,184,0.15);color:#94a3b8">${episodes}</span>` : ''}
        </div>
        <a class="link" href="https://zyniverse.app/anime/${anime.id}/filler" target="_blank">View Details →</a>
      </div>
    `;

    resultsEl.appendChild(card);
  });

  resultsEl.classList.remove('hidden');
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');
}

function showLoading() {
  resultsEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');
}

function showError(msg) {
  loadingEl.classList.add('hidden');
  resultsEl.classList.add('hidden');
  errorText.textContent = msg;
  errorEl.classList.remove('hidden');
}

function hideError() {
  errorEl.classList.add('hidden');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
