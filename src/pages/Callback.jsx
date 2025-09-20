// src/pages/Callback.jsx
import { useEffect } from 'react';
import { exchangeCodeForToken } from '../lib/token';

export default function Callback() {
  useEffect(() => {
    (async () => {
      const qp = new URLSearchParams(window.location.search);
      const code  = qp.get('code');
      const state = qp.get('state');

      const savedState = localStorage.getItem('spotify_auth_state');
      const verifier   = localStorage.getItem('spotify_code_verifier');

      if (!code || !verifier || state !== savedState) {
        alert('Login failed. Please try again.');
        return;
      }

      const token = await exchangeCodeForToken({
        code,
        verifier,
        redirectUri: import.meta.env.VITE_REDIRECT_URI,
        clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      });

      console.log('Granted scopes:', token.scope); 
      localStorage.setItem('spotify_access_token', token.access_token);
      localStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('spotify_code_verifier');

      window.location.replace('/'); 
    })().catch(err => alert(err.message));
  }, []);

  return null;
}
