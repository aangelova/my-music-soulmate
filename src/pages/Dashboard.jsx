// src/pages/Dashboard.jsx
import React from 'react';
import ProfileCard from '../components/ProfileCard';
import TopTracks from '../logic/TopTracks';   
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_profile_name');
    // clear PKCE stuff too
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_auth_state');
    navigate('/', { replace: true });
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '24px auto',
      padding: '0 16px',
      display: 'grid',
      gap: '16px'
    }}>
      <ProfileCard />
      <TopTracks />

      <button
        type="button"
        onClick={logout}
        style={{
          marginTop: '20px',
          padding: '10px 16px',
          borderRadius: '10px',
          backgroundColor: '#e63946',
          color: 'white',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        🚪 Log out
      </button>
    </div>
  );
}
