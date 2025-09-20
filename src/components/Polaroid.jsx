import React, { useRef } from "react";
import "./Polaroid.css";

export default function Polaroid({ src, caption, tilt = 0 }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 10; 
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `rotate(${tilt}deg) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    // reset to original tilt
    card.style.transform = `rotate(${tilt}deg)`;
  };

  return (
    <div
      className="polaroid"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <img src={src} alt={caption} />
      <p>{caption}</p>
    </div>
  );
}
