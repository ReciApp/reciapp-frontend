import React, { useState, useEffect } from "react";

export default function Temporizador({ minutos = 5, size = 46, onExpire }) {
  const total = minutos * 60;
  const [secs, setSecs] = useState(total);

  useEffect(() => {
    setSecs(total);
    const t = setInterval(() => setSecs((s) => {
      if (s <= 1) { clearInterval(t); onExpire && onExpire(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [minutos]); // eslint-disable-line react-hooks/exhaustive-deps

  const frac = secs / total;
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  const mm = String(Math.floor(secs / 60)).padStart(1, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const col = frac > 0.5 ? "var(--green)" : frac > 0.2 ? "var(--orange)" : "var(--pink)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--sans)", fontWeight: 700, fontSize: size * 0.26, color: col }}>{mm}:{ss}</span>
    </div>
  );
}
