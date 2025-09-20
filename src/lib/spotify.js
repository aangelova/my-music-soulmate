// src/lib/spotify.js

function requireToken() {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No access token. Please log in again.');
  return token;
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.error?.message || msg;
    } catch {}
    if (res.status === 401) msg = 'Unauthorized (token expired). Log in again.';
    if (res.status === 403) msg = 'Insufficient scope. Did you include user-top-read?';
    throw new Error(msg);
  }
  return res.json();
}

// ---- Profile
export async function getMe() {
  const token = requireToken();
  return fetchJSON('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Top Tracks
export async function getTopTracks(limit = 10, time_range = 'medium_term') {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error(`Invalid limit: ${limit}. Must be 1–50.`);
  }
  const token = requireToken();
  const url = new URL('https://api.spotify.com/v1/me/top/tracks');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('time_range', time_range);
  return fetchJSON(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Top Artists (me)
export async function getTopArtists(limit = 10, time_range = 'medium_term') {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error(`Invalid limit: ${limit}. Must be 1–50.`);
  }
  const token = requireToken();
  const url = new URL('https://api.spotify.com/v1/me/top/artists');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('time_range', time_range);
  return fetchJSON(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Artists by IDs (for genres)
export async function getArtistsByIds(ids = []) {
  const token = requireToken();
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  if (uniq.length === 0) return { artists: [] };

  // API allows up to 50 IDs per call → chunk if needed
  const chunks = [];
  for (let i = 0; i < uniq.length; i += 50) {
    chunks.push(uniq.slice(i, i + 50));
  }

  const results = [];
  for (const chunk of chunks) {
    const url = new URL('https://api.spotify.com/v1/artists');
    url.searchParams.set('ids', chunk.join(','));
    const { artists } = await fetchJSON(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    results.push(...(artists || []));
  }

  return { artists: results };
}
