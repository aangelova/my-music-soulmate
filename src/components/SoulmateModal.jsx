import React, { useEffect, useMemo, useState } from "react";
import "./soulmate-modal.css";

import harryImg from "../assets/1d/harry.jpg";
import louisImg from "../assets/1d/louis.jpg"; 
import niallImg from "../assets/1d/niall.jpg";
import liamImg from "../assets/1d/liam.jpg";
import zaynImg from "../assets/1d/zayn.jpg";

const MEMBER_IMG = {
  "Harry Styles": harryImg,
  "Louis Tomlinson": louisImg,
  "Niall Horan": niallImg,
  "Liam Payne": liamImg,
  "Zayn": zaynImg,
};


export default function SoulmateModal({ open, onClose, scores, message }) {
  const [confettiBatch, setConfettiBatch] = useState([]);

  const { topMember, topScorePct } = useMemo(() => {
    if (!scores) return { topMember: null, topScorePct: 0 };
    let best = null;
    let bestScore = -1;
    Object.entries(scores).forEach(([name, score]) => {
      if (score > bestScore) {
        best = name;
        bestScore = score;
      }
    });
    const pct = Math.round((bestScore / 10) * 100);
    return { topMember: best, topScorePct: pct };
  }, [scores]);

  // Create a burst of pictures whenever the modal opens
  useEffect(() => {
    if (!open || !topMember) return;
    const count = 100; 
    const burst = Array.from({ length: count }).map((_, idx) => ({
      id: `${Date.now()}_${idx}`,
      // random start position around the modal; CSS reads these as vars
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      // random size and delay to make it organic
      size: `${Math.random() * 32 + 36}px`,
      delay: `${Math.random() * 0.5}s`,
      rotate: `${Math.random() * 40 - 20}deg`,
      img: MEMBER_IMG[topMember],
    }));
    setConfettiBatch(burst);

    // auto-clear after animation ends (4.5s)
    const t = setTimeout(() => setConfettiBatch([]), 5000);
    return () => clearTimeout(t);
  }, [open, topMember]);

  if (!open) return null;

  return (
    <div className="sm-overlay" role="dialog" aria-modal="true">
      {/* drifting pics of the winner */}
      {topMember && (
        <div className="sm-confetti-layer" aria-hidden>
          {confettiBatch.map((c) => (
            <img
              key={c.id}
              className="sm-float-pic"
              src={c.img}
              alt=""
              style={{
                "--sm-top": c.top,
                "--sm-left": c.left,
                "--sm-size": c.size,
                "--sm-delay": c.delay,
                "--sm-rotate": c.rotate,
              }}
            />
          ))}
        </div>
      )}

      <div className="sm-modal">
        <button className="sm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="sm-title">
          <span className="sm-emoji">💘</span> Your Music Soulmate
        </div>

        {topMember && (
          <div className="sm-headline">
            {message ??
              `Your vibe matches ${topMember} the most.`}{" "}
            <span className="sm-chip">{topScorePct}%</span>
          </div>
        )}

        <div className="sm-content">
        </div>

        <div className="sm-actions">
          <button className="sm-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
