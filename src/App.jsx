import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';

import Polaroid from './components/Polaroid';

import liam from './assets/1d/liam_heart.jpg';
import harry from './assets/1d/harry_point.jpg';
import groupHug from './assets/1d/group_hug.jpg';
import booth from './assets/1d/booth_goofy.jpg';
import concert1 from './assets/1d/concert_singing.jpg';
import concert2 from './assets/1d/concert_lineup.jpg';

import heart from './assets/doodles/heart2.png';





export default function App() {
  // Home page: login check + buttons
  const [name, setName] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) { setName(''); return; }

    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r)))
      .then(data => {
        const display = data.display_name || '';
        setName(display);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_profile_name');
        setName('');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_profile_name');
    window.location.reload();
  };

  if (name === null) {
    return <div className="container"><p>Checking Spotify login…</p></div>;
  }

  if (name) {
    return (
      <div className="container">
        <h1>Hi, {name}! 🎧</h1>
        <p>You’re logged in with Spotify.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          <button onClick={logout}>Log out</button>
        </div>
      </div>
    );
  }

  // Not logged in
  return (
    <div className="container" style={{ position: "relative" }}>
    {/* ---- Scrapbook collage (framing the center) ---- */}
<div style={{ position: "absolute", top: "5%", right: "100%" }}>
  <Polaroid src={liam} caption="Liam 💙" tilt={-8} />
</div>

<div style={{ position: "absolute", top: "2%", left: "90%" }}>
  <Polaroid src={harry} caption="Hazza 💚" tilt={6} />
</div>

<div style={{ position: "absolute", top: "10%", left: "35%" }}>
  <Polaroid src={concert2} caption="Legends 🖤" tilt={-3} />
</div>

<div style={{ position: "absolute", bottom: "8%", right: "90%" }}>
  <Polaroid src={booth} caption="Chaotic 1D 😂" tilt={10} />
</div>

<div style={{ position: "absolute", bottom: "4%", right: "40%" }}>
  <Polaroid src={concert1} caption="On stage 🎤" tilt={-5} />
</div>

<div style={{ position: "absolute", bottom: "3%", left: "90%", transform: "translateX(-50%)" }}>
  <Polaroid src={groupHug} caption="Best night ever ✨" tilt={3} />
</div>


<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", top: "10%", left: "10%", width: 50, opacity: 0.9, transform: "rotate(-10deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", top: "25%", right: "15%", width: 60, opacity: 0.8, transform: "rotate(15deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "15%", left: "20%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "15%", left: "120%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "40%", left: "120%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "60%", left: "140%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "80%", left: "120%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "25%", left: "140%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "25%", right: "140%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "45%", right: "120%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "45%", right: "145%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "65%", right: "130%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />

<img src={heart} alt="heart doodle"
     className="heart"
     style={{ position: "absolute", bottom: "75%", right: "140%", width: 55, opacity: 0.85, transform: "rotate(8deg)" }} />





      <h1>Hello 1D World 🎶</h1>
      <p>Find your music soulmate here! 🥰</p>
      <LoginButton />
    </div>
  );
}
