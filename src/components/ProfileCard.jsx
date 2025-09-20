// components/ProfileCard.jsx
import React, { useEffect, useState } from 'react';
import { getMe } from '../lib/spotify';

export default function ProfileCard() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        setMe(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  if (err) return <div style={{color:'crimson'}}>Error: {err}</div>;
  if (!me) return <div>Loading profile…</div>;

  const avatar = me.images?.[0]?.url || '';
  const name = me.display_name || me.id;
  const email = me.email || '(no email available)';

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'12px',
      padding:'12px', border:'1px solid #eee', borderRadius:'12px'
    }}>
      {avatar ? (
        <img src={avatar} alt="avatar" width="64" height="64"
             style={{borderRadius:'50%', objectFit:'cover'}}/>
      ) : (
        <div style={{
          width:64, height:64, borderRadius:'50%', background:'#ddd',
          display:'grid', placeItems:'center', fontWeight:'bold'
        }}>
          {name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <div>
        <div style={{fontWeight:'600'}}>{name}</div>
        <div style={{opacity:0.8}}>{email}</div>
      </div>
    </div>
  );
}
