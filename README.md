# My Music Soulmate 

A small React (Vite) app that logs in with Spotify, reads your **top tracks & artists**, and matches your “music soulmate” from One Direction based on **genres**. Made with a lot of love by a 1D girly!
Hope you will enjoy it, if you have any issues feel free to send me a message on ally03vt@gmail.com

---

## TL;DR — What you must change

In `.env` at the project root, replace **only these two** with your own:

- `VITE_SPOTIFY_CLIENT_ID` → your **Client ID** from Spotify Dashboard  
- `VITE_REDIRECT_URI` → the **Redirect URI** you added in your Spotify app (must match exactly)

Scopes can stay as:
```
user-read-private user-read-email user-top-read
```

---

## 0) Prerequisites

- Node.js **v16+** and npm
- A Spotify account (free is fine)

---

## 1) Create a Spotify app (get Client ID + set Redirect URI)

1. Open the **Spotify Developer Dashboard**: https://developer.spotify.com/dashboard  
2. Click **Create app** → give it a name.  
3. Copy the **Client ID** (you’ll paste it into `.env` in Step 3).  
4. Go to your app → **Edit settings** → **Redirect URIs** → **Add** :  
   - `http://127.0.0.1:5173/callback` 
5. Click **Save**.  

> The Redirect URI must match **exactly** (protocol, host, port, path). If you add `127.0.0.1`, then use `127.0.0.1` in `.env` and when starting the dev server.

---

## 2) Clone & install

```bash
git clone <your-repo-url>
cd my-music-soulmate
npm install
```

---

## 3) Create `.env` (only 2 fields to replace)

Create a file named `.env` in the project root with:

```env
VITE_SPOTIFY_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
VITE_SCOPES=user-read-private user-read-email user-top-read
```

- Replace `PASTE_YOUR_CLIENT_ID_HERE` with your Client ID from Step 1.  
- If you registered `http://localhost:5173/callback` instead, use that here.

---

## 4) Run the app

If `.env` uses **127.0.0.1**:

```bash
npm run dev -- --host 127.0.0.1
```

If `.env` uses **localhost**:

```bash
npm run dev
```

Open the printed URL (usually `http://127.0.0.1:5173` ).  

Click **Log in with Spotify**, approve the scopes, and you’ll be redirected back to `/callback`, then into the app.

---

## 5) Verify

- After login you should see your profile/top tracks and a **soulmate** result.  
- If you see a loop or “nothing happens,” check **Troubleshooting**.

---

## Troubleshooting

**Login loop / “nothing happens” after approve**  
- `VITE_REDIRECT_URI` must match the Spotify app’s Redirect URI **exactly**.  
- If using `127.0.0.1`, you **must** start Vite with `--host 127.0.0.1`.

**Missing top tracks / genres**  
- Ensure scopes include `user-top-read` (set in `.env`).  
- Some artists have no genres in Spotify’s data; the app falls back.

**Stale auth**  
- Clear `localStorage` for the site, then try logging in again.

**Safari quirks**  
- If storage is blocked, try Chrome/Firefox or allow storage for the site.

---

##  Customize (optional)

- **Number of tracks**  
  In `src/components/TopTracks.jsx`, change:
  ```js
  getTopTracks(10, 'medium_term')
  ```
- **Genre → member mapping & fallback**  
  In `src/logic/soulmate.js`:
  - Edit the `ROOTS` object to tune genre keywords per member.
  - Adjust the winner/fallback logic (e.g., use `"None😭"` or pick second-best if top score is “None”).
- **Scopes**  
  Edit `VITE_SCOPES` in `.env` if you add features (e.g., recently played).

---

## Build & preview (optional)

```bash
npm run build
npm run preview
```

For deployment, add a **production** Redirect URI (e.g., `https://your-domain/callback`) in Spotify and update `VITE_REDIRECT_URI` accordingly.

---

## Quick checklist

1. Create Spotify app → copy **Client ID** → add **Redirect URI**  
2. Clone repo → `npm install`  
3. Make `.env` → replace **Client ID** + **Redirect URI** only  
4. Run: `npm run dev` (or `npm run dev -- --host 127.0.0.1`)  
5. Log in with Spotify → see your soulmate 
