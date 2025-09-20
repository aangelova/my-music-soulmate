
const stripDiacritics = (s = "") => {
  try { return s.normalize("NFD").replace(/\p{Diacritic}/gu, ""); }
  catch { return s; }
};

const norm = (s) =>
  stripDiacritics(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\s\-]/g, "");

const ROOTS = {
  "Harry Styles": [
    "pop","dancepop","ukpop","poppunk","poprock","softrock",
    "classicrock","glamrock","glam","indiepop","altpop","poptimism",
    "baroquepop","singersongwriter","adultcontemporary",
    "bedroompop","altz","sadgirl","melancholia","modernlove"
  ],
  "Louis Tomlinson": [
    "indie","alt","alternativerock","altrock","modernrock","postpunk",
    "shoegaze","garage","britpop","punk","emo","grunge","indietronica",
    "garagepunk","lofirock"
  ],
  "Niall Horan": [
    "folk","acoustic","celtic","irish","singersongwriteracoustic",
    "country","countrypop","americana"
  ],
  "Liam Payne": [
    "edm","electro","electronic","house","club","tropical","futurebass",
    "bigroom","progressivehouse","dubstep","dance","deephouse","trance"
  ],
  "Zayn": [
    "randb","rnb","rb","neosoul","soul","trap","trapsoul","hiphop","rap",
    "altrandb","contemporaryrandb"
  ],
};

function fuzzyFamilyMember(genre) {
  const g = norm(genre);
  let best = null, bestScore = 0;
  for (const [member, roots] of Object.entries(ROOTS)) {
    let s = 0;
    for (const r of roots) if (g.includes(r)) s += 1;
    if (s > bestScore) { best = member; bestScore = s; }
  }
  return bestScore > 0 ? best : null;
}

export function assignGenreToMember(genre) {
  const g = norm(genre);

  if (g.includes("randb") || g.includes("rnb") || g.includes("rb") ||
      g.includes("neosoul") || g.includes("soul") ||
      g.includes("trapsoul") || g.includes("trap") ||
      g.includes("hiphop") || g.includes("rap") ||
      g.includes("altrandb") || g.includes("contemporaryrandb")) return "Zayn";

  if (g.includes("folk") || g.includes("acoustic") || g.includes("celtic") ||
      g.includes("irish") || g.includes("singersongwriteracoustic") ||
      g.includes("country") || g.includes("countrypop")) return "Niall Horan";

  if (g.includes("pop") || g.includes("dancepop") || g.includes("ukpop") ||
      g.includes("poprock") || g.includes("softrock") ||
      g.includes("classicrock") || g.includes("glamrock") || g.includes("glam") ||
      g.includes("singersongwriter") || g.includes("adultcontemporary") ||
      g.includes("baroquepop") || g.includes("altpop") ||
      g.includes("indiepop") || g.includes("poptimism") ||
      g.includes("altz") || g.includes("bedroompop") || g.includes("sadgirl") ||
      g.includes("melancholia") || g.includes("modernlove")) return "Harry Styles";

  if (g.includes("indie") || g.includes("alternativerock") || g.includes("altrock") ||
      (g.includes("rock") && !g.includes("classicrock") && !g.includes("glamrock") && !g.includes("poprock")) ||
      g.includes("punk") || g.includes("poppunk") ||
      g.includes("britpop") || g.includes("garage") || g.includes("modernrock") ||
      g.includes("postpunk") || g.includes("shoegaze") || g.includes("emo") ||
      g.includes("grunge") || g.includes("altmetal")) return "Louis Tomlinson";

  const fuzzy = fuzzyFamilyMember(genre);
  // fall back to none
  return fuzzy ?? "None😭";
}

//genres from spotify audio
export function featuresToPseudoGenres(f = {}) {
  if (!f || typeof f !== "object") return [];
  const {
    danceability = 0, energy = 0, acousticness = 0, instrumentalness = 0,
    speechiness = 0, valence = 0, tempo = 0
  } = f;

  const tags = new Set();

  // EDM / Dance
  if (danceability > 0.65 && energy > 0.6 && acousticness < 0.3 && tempo >= 118) {
    tags.add("edm"); tags.add("dance"); tags.add("electronic");
    if (tempo >= 122) tags.add("house");
  }

  // Hip hop / R&B / Trap
  if (speechiness > 0.33 || (tempo >= 65 && tempo <= 110 && energy >= 0.45)) {
    tags.add("hip hop"); tags.add("r&b");
    if (tempo <= 90 || (energy >= 0.6 && danceability >= 0.6)) tags.add("trap");
  }

  // Acoustic / Folk / Country
  if (acousticness > 0.5 && energy < 0.7) {
    tags.add("acoustic"); tags.add("folk");
    if (valence > 0.4 && tempo >= 85 && tempo <= 120) tags.add("country");
  }

  // Rock / Alt
  if (energy > 0.65 && acousticness < 0.4 && instrumentalness < 0.8) {
    tags.add("rock");
    if (valence < 0.6 && danceability < 0.65) tags.add("alternativerock");
    if (danceability >= 0.55) tags.add("poprock");
  }

  // Pop (default-ish)
  if (tags.size === 0 || (danceability >= 0.5 && valence >= 0.45)) {
    tags.add("pop");
    if (danceability >= 0.6) tags.add("dancepop");
    if (valence >= 0.5 && energy <= 0.7 && acousticness <= 0.6) tags.add("indiepop");
  }

  return Array.from(tags);
}

//Track vs Artist genre sources
function cleanGenres(list) {
  const banned = new Set(["", "none", "unknown", "n/a", "na", "null", "undefined"]);
  const out = [];
  const seen = new Set();
  for (const raw of list || []) {
    const g = (raw || "").trim();
    if (!g) continue;
    const key = g.toLowerCase();
    if (banned.has(key)) continue;
    if (!seen.has(key)) { seen.add(key); out.push(g); }
  }
  return out;
}

function getTrackDirectGenres(track) {
  const raw = [
    ...(track?.genres || []),
    ...(track?._pseudoGenres || []), // pseudo-genres injected on the track
    ...(track?.album?.genres || []),
  ];
  return cleanGenres(raw);
}

function getArtistGenres(track, artistsById = {}) {
  if (!track?.artists?.length) return [];
  const set = new Set();
  for (const a of track.artists) {
    const aid = a?.id;
    const genres = (aid && artistsById[aid]?.genres) || [];
    for (const g of genres || []) set.add(g);
  }
  return cleanGenres([...set]);
}

function getEffectiveTrackGenres(track, artistsById) {
  const primary = getTrackDirectGenres(track);
  if (primary.length) return primary;
  const fallback = getArtistGenres(track, artistsById);
  return fallback.length ? fallback : [];
}

//scorring 
export function scoreMembersByGenres(genreListOrFreq) {
  const freq = {};
  if (Array.isArray(genreListOrFreq)) {
    for (const g of genreListOrFreq) {
      const k = norm(g);
      freq[k] = (freq[k] || 0) + 1;
    }
  } else {
    for (const [g, c] of Object.entries(genreListOrFreq || {})) {
      const k = norm(g);
      freq[k] = (freq[k] || 0) + c;
    }
  }

  const scores = {
    "Harry Styles": 0, "Niall Horan": 0, "Louis Tomlinson": 0,
    "Liam Payne": 0, "Zayn": 0, "None😭": 0,
  };

  for (const [genre, count] of Object.entries(freq)) {
    const member = assignGenreToMember(genre);
    scores[member] += count;
  }

  let best = "None😭", bestScore = -1;
  const members = Object.keys(scores).filter(m => m !== "None😭");
  const anyReal = members.some(m => scores[m] > 0);
  const pool = anyReal ? members : Object.keys(scores);
  for (const m of pool) {
    if (scores[m] > bestScore) { best = m; bestScore = scores[m]; }
  }
  return { best, bestScore, scores, freq };
}

export function scoreMembersByTracksExclusive(tracks, artistsById = {}) {
  const scores = {
    "Harry Styles": 0, "Niall Horan": 0, "Louis Tomlinson": 0,
    "Liam Payne": 0, "Zayn": 0, "None😭": 0,
  };

  const priority = ["Harry Styles", "Louis Tomlinson", "Niall Horan", "Liam Payne", "Zayn"];

  for (const t of (tracks || [])) {
    const effectiveGenres = getEffectiveTrackGenres(t, artistsById);
    const votes = { "Harry Styles":0,"Louis Tomlinson":0,"Niall Horan":0,"Liam Payne":0,"Zayn":0 };

    // strict
    for (const g of effectiveGenres) {
      const m = assignGenreToMember(g);
      if (m && m !== "None😭") votes[m] += 1;
    }

    let totalVotes = Object.values(votes).reduce((a,b)=>a+b,0);

    // fuzzy (only if we have some effective genres)
    if (totalVotes === 0 && effectiveGenres.length) {
      for (const g of effectiveGenres) {
        const m = fuzzyFamilyMember(g);
        if (m) votes[m] += 1;
      }
      totalVotes = Object.values(votes).reduce((a,b)=>a+b,0);
    }

    if (totalVotes === 0) {
      scores["None😭"] += 1; // fallback
      continue;
    }

    // winner for this track
    let winner = priority[0], bestVotes = -1;
    for (const m of priority) {
      const v = votes[m];
      if (v > bestVotes) { winner = m; bestVotes = v; }
    }
    scores[winner] += 1;
  }

  // overall best
  let best = "None😭", bestScore = -1;
  const members = priority;
  const anyReal = members.some(m => scores[m] > 0);
  const pool = anyReal ? members : [...members, "None😭"];
  for (const m of pool) {
    const s = scores[m];
    if (s > bestScore) { best = m; bestScore = s; }
  }

  return { scores, best, bestScore, total: tracks?.length || 0 };
}

/* ---------- Debug helper (not used by UI now) ---------- */
export function collectGenresDebug(tracks, artistsById = {}) {
  return (tracks || []).map(t => {
    const trackGenres = getTrackDirectGenres(t);
    const artistGenres = getArtistGenres(t, artistsById);
    const effective = getEffectiveTrackGenres(t, artistsById);
    return {
      track: t?.name || '(unknown track)',
      artists: (t?.artists || []).map(a => a?.name).filter(Boolean),
      trackGenres,
      artistGenres,
      effective,
    };
  });
}
