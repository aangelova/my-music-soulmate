// src/LoginButton.jsx
import { randomString, challengeFromVerifier } from './utils/pkce';

function LoginButton() {
  const handleLogin = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    // Always include the scopes we need
    const scopes = import.meta.env.VITE_SCOPES || 
      'user-read-private user-read-email user-top-read';

    // PKCE setup
    const verifier = randomString(64);
    const challenge = await challengeFromVerifier(verifier);
    const state = randomString(16);

    // Save PKCE + state for callback validation
    localStorage.setItem('spotify_code_verifier', verifier);
    localStorage.setItem('spotify_auth_state', state);

    // Build Spotify authorize URL
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href =
      `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

   return (
    <button onClick={handleLogin}>
      {/* Spotify logo (SVG) */}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 
        5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm5.385 
        17.451c-.215.356-.676.468-1.032.253-2.83-1.735-6.394-2.127-10.593-1.163-.403.093-.808-.155-.9-.557-.094-.403.155-.808.558-.9 
        4.549-1.064 8.496-.61 11.657 1.289.356.215.468.676.31 1.078zm1.47-3.274c-.268.436-.84.574-1.276.306-3.247-1.992-8.197-2.574-12.027-1.408-.495.155-1.022-.124-1.177-.62-.154-.495.124-1.021.62-1.176 
        4.302-1.348 9.805-.702 13.582 1.676.436.268.574.84.278 1.222zm.126-3.407c-3.82-2.297-10.174-2.507-13.837-1.368-.58.186-1.205-.14-1.39-.72-.186-.58.14-1.204.72-1.39 
        4.193-1.34 11.253-1.095 15.566 1.536.52.313.686.985.373 1.505-.312.52-.985.686-1.505.373z"/>
      </svg>
      Login with Spotify
    </button>
  );
}

export default LoginButton;
