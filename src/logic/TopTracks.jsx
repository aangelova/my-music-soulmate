import React, { useEffect, useMemo, useState } from 'react';
import { getTopTracks, getArtistsByIds } from '../lib/spotify';
import {
  scoreMembersByTracksExclusive,
  featuresToPseudoGenres,
} from '../logic/soulmate';
import './TopTracks.css';
import '../components/soulmate-modal.css';

// winner images
import harryImg from '../assets/1d/harry.jpg';
import louisImg from '../assets/1d/louis.jpg';
import niallImg from '../assets/1d/niall.jpg';
import liamImg from '../assets/1d/liam.jpg';
import zaynImg from '../assets/1d/zayn.jpg';

const MEMBER_IMG = {
  'Harry Styles': harryImg,
  'Louis Tomlinson': louisImg,
  'Niall Horan': niallImg,
  'Liam Payne': liamImg,
  'Zayn': zaynImg,
};

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normalizeArtistsResponse(resp) {
  if (Array.isArray(resp)) return resp;
  if (resp?.artists && Array.isArray(resp.artists)) return resp.artists;
  if (resp?.body?.artists && Array.isArray(resp.body.artists)) return resp.body.artists;
  return [];
}

// Pull a token from common app locations; add your own key if different
function getSpotifyTokenFromApp() {
  return (
    window.__SPOTIFY_TOKEN__ ||
    window.localStorage?.getItem('spotify_access_token') ||
    window.localStorage?.getItem('access_token') ||
    window.sessionStorage?.getItem('spotify_access_token') ||
    ''
  );
}

async function fetchArtistsDirectBatch(ids) {
  const token = getSpotifyTokenFromApp();
  if (!token || !ids.length) return [];
  const url = `https://api.spotify.com/v1/artists?ids=${encodeURIComponent(ids.join(','))}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Spotify /v1/artists batch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.artists) ? data.artists : [];
}

async function fetchArtistDirectSingle(id) {
  const token = getSpotifyTokenFromApp();
  if (!token || !id) return null;
  const url = `https://api.spotify.com/v1/artists/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Spotify /v1/artists/${id} failed: ${res.status}`);
  return await res.json();
}

// audio-features fetcher
async function fetchAudioFeaturesBatch(ids) {
  const token = getSpotifyTokenFromApp();
  if (!token || !ids.length) return {};
  const url = `https://api.spotify.com/v1/audio-features?ids=${encodeURIComponent(ids.join(','))}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Spotify /v1/audio-features failed: ${res.status}`);
  const data = await res.json();
  const byId = {};
  for (const f of data?.audio_features || []) {
    if (f && f.id) byId[f.id] = f;
  }
  return byId;
}

export default function TopTracks() {
  const [tracks, setTracks] = useState([]);
  const [artistsById, setArtistsById] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confettiBatch, setConfettiBatch] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) Top tracks
        const top = await getTopTracks(10, 'medium_term');
        const items = top?.items || [];

        // 2) Unique artist IDs from tracks
        const artistIds = Array.from(
          new Set(items.flatMap(t => (t.artists || []).map(a => a?.id)).filter(Boolean))
        );

        // 3) First try your wrapper (array -> string -> singles)
        const gathered = [];

        for (const ids of chunk(artistIds, 50)) {
          if (!ids.length) continue;
          try {
            const resp = await getArtistsByIds(ids);
            gathered.push(...normalizeArtistsResponse(resp));
          } catch (e) {
            console.warn('getArtistsByIds(array) failed for', ids, e);
          }
        }

        if (gathered.length === 0 && artistIds.length) {
          try {
            const resp = await getArtistsByIds(artistIds.join(','));
            gathered.push(...normalizeArtistsResponse(resp));
          } catch (e) {
            console.warn('getArtistsByIds(string) failed', e);
          }
        }

        let map = Object.fromEntries(gathered.filter(Boolean).map(a => [a.id, a]));

        const stillMissing = artistIds.filter(id => !map[id]);
        for (const id of stillMissing) {
          try {
            const resp = await getArtistsByIds([id]);
            const got = normalizeArtistsResponse(resp);
            if (got?.[0]?.id) map[got[0].id] = got[0];
          } catch (e) {
            console.warn('getArtistsByIds single failed', id, e);
          }
        }

        // 4) Any artists present but missing `genres`? Re-fetch them directly.
        const missingGenresIds = Object.values(map)
          .filter(a => !Array.isArray(a.genres) || a.genres.length === 0)
          .map(a => a.id)
          .filter(Boolean);

        // 4.1 Try batch /v1/artists
        for (const ids of chunk(missingGenresIds, 50)) {
          try {
            const full = await fetchArtistsDirectBatch(ids);
            for (const a of full) {
              if (a?.id) map[a.id] = a;
            }
          } catch (e) {
            console.warn('fetchArtistsDirectBatch failed', ids, e);
          }
        }

        // 4.2 Any still without genres? Hit /v1/artists/{id}
        const stillNoGenres = Object.values(map)
          .filter(a => !Array.isArray(a.genres) || a.genres.length === 0)
          .map(a => a.id);

        for (const id of stillNoGenres) {
          try {
            const a = await fetchArtistDirectSingle(id);
            if (a?.id && Array.isArray(a.genres)) map[a.id] = a;
          } catch (e) {
            console.warn('fetchArtistDirectSingle failed', id, e);
          }
        }

        // 4.3 PSEUDO-GENRES: for tracks that still have no track/album/artist genres
        const noGenreTrackIds = items
          .filter(t => {
            const hasTrackOrAlbum = (t.genres && t.genres.length) || (t.album?.genres && t.album.genres.length);
            if (hasTrackOrAlbum) return false;
            const artistHasGenres = (t.artists || []).some(a => {
              const aid = a?.id;
              return aid && Array.isArray(map[aid]?.genres) && map[aid].genres.length > 0;
            });
            return !artistHasGenres;
          })
          .map(t => t.id);

        let featuresById = {};
        for (const ids of chunk(noGenreTrackIds, 100)) {
          try {
            const part = await fetchAudioFeaturesBatch(ids);
            featuresById = { ...featuresById, ...part };
          } catch (e) {
            console.warn('fetchAudioFeaturesBatch failed for', ids, e);
          }
        }

        const enrichedTracks = items.map(t => {
          const alreadyHas = (t.genres && t.genres.length) || (t.album?.genres && t.album.genres.length) ||
            (t.artists || []).some(a => {
              const aid = a?.id;
              return aid && Array.isArray(map[aid]?.genres) && map[aid].genres.length > 0;
            });

          if (alreadyHas) return t;

          const f = featuresById[t.id];
          const pseudo = featuresToPseudoGenres(f);
          return pseudo.length ? { ...t, _pseudoGenres: pseudo } : t;
        });

        setArtistsById(map);

        // console sanity
        const total = Object.keys(map).length;
        const withGenres = Object.values(map).filter(a => Array.isArray(a.genres) && a.genres.length).length;
        const withoutGenres = total - withGenres;
        const withoutList = Object.values(map)
          .filter(a => !Array.isArray(a.genres) || a.genres.length === 0)
          .map(a => `${a?.name || a?.id} (${a?.id})`);
        console.log('🎧 Artists fetched:', total, '| with genres:', withGenres, '| without genres:', withoutGenres);
        if (withoutList.length) console.log('⚠️ Without genres:', withoutList);

        // NOW set tracks (after enrichment)
        setTracks(enrichedTracks);

        setErr('');
      } catch (e) {
        console.error(e);
        setErr(e?.message || 'Failed to load top tracks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // scoring (track genres first → else artist genres; fallback goes to none)
  const result = useMemo(() => scoreMembersByTracksExclusive(tracks, artistsById), [tracks, artistsById]);
  const { scores = {}, best, bestScore, total = tracks.length } = result || {};

  const ranked = useMemo(() => {
    const denom = total || 1;
    return Object.entries(scores)
      .filter(([member]) => member !== 'None😭')
      .map(([member, s]) => {
        const scoreInt = Math.round(s || 0);
        const pct = (scoreInt / denom) * 100;
        return { member, score: scoreInt, pct };
      })
      .sort((a, b) => (b.score - a.score) || (b.pct - a.pct));
  }, [scores, total]);

  // do not show a "winner" if the best is none
  const topMember = bestScore > 0 && best !== 'None😭' ? best : null;
  const winnerPhoto = topMember ? MEMBER_IMG[topMember] : null;

  // confetti
  useEffect(() => {
    if (!showModal || !winnerPhoto) return;
    const count = 100;
    const burst = Array.from({ length: count }).map((_, idx) => ({
      id: `${Date.now()}_${idx}`,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      size: `${Math.random() * 32 + 50}px`,
      delay: `${Math.random() * 0.8}s`,
      rotate: `${Math.random() * 40 - 20}deg`,
      img: winnerPhoto,
    }));
    setConfettiBatch(burst);
    const t = setTimeout(() => setConfettiBatch([]), 5000);
    return () => clearTimeout(t);
  }, [showModal, winnerPhoto]);

  if (err) return <div style={{ color: 'crimson' }}>Error: {err}</div>;
  if (loading) return <div>Loading your top tracks…</div>;

  return (
    <div className="toptracks-container">
      <div className="toptracks-header">
        <h2>Your Top 10 Tracks</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="toptracks-btn" onClick={() => setShowModal(true)}>💘 Find your soulmate</button>
        </div>
      </div>

      <ul className="toptracks-list">
        {tracks.map((t) => {
          const cover =
            t.album?.images?.[2]?.url ||
            t.album?.images?.[1]?.url ||
            t.album?.images?.[0]?.url;
          const artists = (t.artists || []).map((a) => a.name).join(', ');
          return (
            <li key={t.id} className="toptracks-item">
              {cover && <img src={cover} width="56" height="56" alt="" />}
              <div>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ opacity: 0.8 }}>{artists}</div>
              </div>
            </li>
          );
        })}
      </ul>

      {showModal && (
        <div
          className="modal-overlay sm-overlay"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          {winnerPhoto && (
            <div className="sm-confetti-layer" aria-hidden>
              {confettiBatch.map((c) => (
                <img
                  key={c.id}
                  className="sm-float-pic"
                  src={c.img}
                  alt=""
                  style={{
                    '--sm-top': c.top,
                    '--sm-left': c.left,
                    '--sm-size': c.size,
                    '--sm-delay': c.delay,
                    '--sm-rotate': c.rotate,
                  }}
                />
              ))}
            </div>
          )}

          <div className="modal-box sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="sm-emoji">💘</span> Your Music Soulmate</h3>
              <button className="modal-close sm-close" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>

            <div className="summary-banner sm-headline">
              {topMember ? (
                <>Your vibe matches <b>{topMember}</b> the most.</>
              ) : (
                <>Unfortunately you don't match with any 1D members this time…</>
              )}
            </div>

            <div className="score-list sm-content">
              {ranked.length ? (
                ranked.map(({ member, pct, score }) => (
                  <div key={member} className="score-item">
                    <div className="score-item-header">
                      <span>{member}</span>
                      <span>
                        {pct.toFixed(0)}%{' '}
                        <span style={{ opacity: 0.6 }}>
                          (score {score}/{total})
                        </span>
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ opacity: 0.8 }}>No data to score yet.</div>
              )}
            </div>

            <div className="modal-footer sm-actions">
              <button className="close-btn sm-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
