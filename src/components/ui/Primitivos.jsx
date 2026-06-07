// ============================================================
// src/components/ui/Primitivos.jsx
// Átomos visuales compartidos de ReciApp (sin dependencias de UI kits).
// Estilos inline; las variables de color y @keyframes viven en styles/reciapp.css.
// Imágenes: deja bolsas.png y pie-basura.png en /public  (se usan como "/bolsas.png").
// ============================================================
import React, { useState } from "react";
import { ESTADOS } from "../../lib/datos";

/* ---------- Sistema de iconos (stroke) ---------- */
export const ICONS = {
  user: "M12 11.5a3.6 3.6 0 100-7.2 3.6 3.6 0 000 7.2zM4.5 20c0-3.6 3.3-5.6 7.5-5.6s7.5 2 7.5 5.6",
  truck: "M2 7h11v8H2zM13 10h4l3 3v2h-7M6.5 17.5a1.6 1.6 0 100 .1M16.5 17.5a1.6 1.6 0 100 .1",
  clipboard: "M9 4V3h6v1M5 4h14v17H5zM9 4a1 1 0 001 1h4a1 1 0 001-1M9 11h6M9 15h4",
  pin: "M12 21s-7-5.7-7-11a7 7 0 0114 0c0 5.3-7 11-7 11zM12 10a2.4 2.4 0 100 .1",
  leaf: "M11 20A7 7 0 0118 6c0 6-4 9-7 9M11 20c0-4 1-7 4-9",
  recycle: "M7 19h10l-3-5M12 4l5 9M17 13l-1-3M7 5l-4 7 3 2M3 12l3-1",
  camera: "M3 8h3l2-2h8l2 2h3v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z",
  upload: "M12 16V4M7 9l5-5 5 5M5 20h14",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  check: "M5 13l4 4L19 7",
  x: "M6 6l12 12M18 6L6 18",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14v15H5zM9 13h2M13 13h2M9 17h2",
  edit: "M14 4l6 6M4 20l1-4L16 5l3 3L8 19l-4 1z",
  logout: "M14 8V5l-9 2v10l9 2v-3M14 12h7M18 9l3 3-3 3",
  bell: "M12 4a5 5 0 015 5c0 6 2 7 2 7H5s2-1 2-7a5 5 0 015-5zM10 21a2 2 0 004 0",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  alert: "M12 9v4M12 17h.01M10.3 4l-8 14h19.4l-8-14a2 2 0 00-3.4 0z",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  weight: "M7 8h10l2 12H5zM9 8a3 3 0 116 0",
  phone: "M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  gps: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  power: "M12 4v8M7 6a7 7 0 1010 0",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6zM4 12l-1.2-.8.9-2.2 1.5.2M19.3 9l1.5-.2.9 2.2L20.4 12M4 12l-1.2.8.9 2.2 1.5-.2M19.3 15l1.5.2.9-2.2L20.4 12M12 4l.8-1.2 2.2.9-.2 1.5M9 19.3l-.2 1.5 2.2.9.8-1.2",
  trophy: "M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5",
  home: "M4 11l8-7 8 7M6 10v10h12V10",
};

export function Icon({ name, size = 20, stroke = "currentColor", sw = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {(ICONS[name] || "").split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

/* ---------- Estrella de muchas puntas ---------- */
export function Starburst({ points = 18, color, size = 100, inner = 0.56, style }) {
  const cx = 50, cy = 50, outer = 50, ir = outer * inner, total = points * 2;
  let d = "";
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? outer : ir;
    const ang = (Math.PI / points) * i - Math.PI / 2;
    d += (i === 0 ? "M" : "L") + (cx + r * Math.cos(ang)).toFixed(2) + " " + (cy + r * Math.sin(ang)).toFixed(2) + " ";
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", ...style }}>
      <path d={d + "Z"} fill={color} />
    </svg>
  );
}

export function ReciLogo({ size = 30, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g fill={color}>
        <path d="M24 7.5l5.2 9-3.3 1.9-1.9-3.3-4.4 7.6-3.9-2.2 6-10.4a1.6 1.6 0 012.8 0z" />
        <path d="M37.6 31.5l-10.4 0 0-3.8 3.8 0-4.4-7.6 3.9-2.3 6 10.4a1.6 1.6 0 01-1.4 2.4z" transform="rotate(120 24 24)" />
        <path d="M37.6 31.5l-10.4 0 0-3.8 3.8 0-4.4-7.6 3.9-2.3 6 10.4a1.6 1.6 0 01-1.4 2.4z" transform="rotate(240 24 24)" />
      </g>
    </svg>
  );
}

/* ---------- Campo de formulario ---------- */
export function Field({ label, type = "text", value, onChange, placeholder, error, trailing, hint, autoComplete, name, inputMode, maxLength, disabled }) {
  const [focus, setFocus] = useState(false);
  return (
    <label className="field" style={{ display: "block" }}>
      {label && <span style={{ display: "block", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13.5, color: "var(--ink)", marginBottom: 7, letterSpacing: 0.2 }}>{label}</span>}
      <div style={{
        display: "flex", alignItems: "center", background: disabled ? "var(--cream)" : "#fff",
        border: "1.5px solid " + (error ? "var(--pink)" : focus ? "var(--green)" : "var(--line)"),
        borderRadius: 13, boxShadow: focus ? "0 0 0 4px oklch(0.66 0.15 142 / 0.16)" : "none",
        transition: "border-color .15s, box-shadow .15s", padding: "0 6px 0 15px", opacity: disabled ? 0.7 : 1,
      }}>
        <input name={name} type={type} value={value} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength} disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder={placeholder}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 15.5, color: "var(--ink)" }} />
        {trailing}
      </div>
      {error ? <span style={{ display: "block", color: "var(--pink)", fontSize: 12, marginTop: 5, fontWeight: 500 }}>{error}</span>
        : hint ? <span style={{ display: "block", color: "var(--ink-soft)", fontSize: 12, marginTop: 5 }}>{hint}</span> : null}
    </label>
  );
}

export function EyeToggle({ show, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Mostrar contraseña" tabIndex={-1}
      style={{ border: "none", background: "transparent", cursor: "pointer", padding: 8, color: "var(--ink-soft)", display: "grid", placeItems: "center" }}>
      {show
        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 002.8 2.8" /><path d="M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7-.4 1-1.3 2.3-2.6 3.4M6.1 6.1C3.9 7.5 2.4 9.6 2 12c.7 1.7 4 7 10 7a9 9 0 003.9-.9" /></svg>
        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>}
    </button>
  );
}

/* ---------- Botones ---------- */
export function PrimaryButton({ children, loading, type = "submit", onClick, full, color = "var(--green)", deep = "var(--green-deep)", size = "lg" }) {
  const pad = size === "sm" ? "11px 18px" : "14px 22px";
  const fs = size === "sm" ? 16 : 20;
  return (
    <button type={type} disabled={loading} onClick={onClick} style={{
      border: "none", cursor: loading ? "wait" : "pointer", background: color, color: "#fff",
      fontFamily: "var(--serif)", fontSize: fs, padding: pad, borderRadius: 999, width: full ? "100%" : "auto",
      boxShadow: "0 5px 0 " + deep, transition: "transform .12s, box-shadow .12s",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, whiteSpace: "nowrap",
    }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = "0 2px 0 " + deep; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 5px 0 " + deep; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 5px 0 " + deep; }}>
      {loading ? <span style={{ width: 20, height: 20, border: "2.5px solid oklch(1 0 0 / 0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> : children}
    </button>
  );
}

export function GhostButton({ children, onClick, color = "var(--ink-soft)", type = "button" }) {
  const [h, setH] = useState(false);
  return (
    <button type={type} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ border: "1.5px solid " + (h ? "var(--ink-soft)" : "var(--line)"), background: h ? "var(--cream)" : "transparent", color: color,
        fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, padding: "12px 20px", borderRadius: 999, cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .15s, border-color .15s" }}>
      {children}
    </button>
  );
}

/* ---------- Caja de éxito ---------- */
export function SuccessBox({ title, msg, color = "var(--green)" }) {
  return (
    <div className="pop" style={{ background: "var(--cream)", border: "1.5px solid var(--green-soft)", borderRadius: 18, padding: "30px 26px", textAlign: "center" }}>
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: color, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
        <Icon name="check" size={30} stroke="#fff" sw={2.6} />
      </div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, margin: "0 0 6px", color: "var(--ink)" }}>{title}</h3>
      <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", margin: 0, fontSize: 15 }}>{msg}</p>
    </div>
  );
}

/* ---------- Badge de estado de solicitud ---------- */
export function StatusBadge({ estado, size = "md" }) {
  const e = ESTADOS[estado] || ESTADOS.pendiente;
  const sm = size === "sm";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: e.color, color: e.fg,
      fontFamily: "var(--sans)", fontWeight: 700, fontSize: sm ? 11 : 12.5, letterSpacing: 0.3,
      padding: sm ? "4px 10px" : "6px 13px", borderRadius: 999, whiteSpace: "nowrap" }}>
      <Icon name={e.icon} size={sm ? 12 : 14} stroke={e.fg} sw={2.4} />
      {e.label}
    </span>
  );
}

/* ---------- Tarjeta de material (seleccionable) ---------- */
export function MaterialCard({ mat, selected, onClick, compact }) {
  const [hover, setHover] = useState(false);
  const active = selected;
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%",
        background: active ? "color-mix(in oklch, " + mat.color + " 14%, var(--cream-card))" : "var(--cream-card)",
        border: "2px solid " + (active ? mat.color : hover ? mat.color : "var(--line)"),
        borderRadius: 18, padding: compact ? "14px 10px 12px" : "18px 12px 16px", cursor: "pointer", minWidth: 0, position: "relative",
        boxShadow: hover || active ? "0 10px 22px -14px oklch(0.3 0.04 130 / 0.5)" : "0 2px 0 oklch(0.88 0.03 120)",
        transform: hover && !active ? "translateY(-3px)" : "none", transition: "transform .15s, box-shadow .15s, border-color .15s, background .15s",
      }}>
      {active && <span style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: mat.color, display: "grid", placeItems: "center" }}><Icon name="check" size={13} stroke="#fff" sw={3} /></span>}
      <span style={{ position: "relative", width: 52, height: 52, borderRadius: 15, display: "grid", placeItems: "center", background: mat.color, flexShrink: 0 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: 15, background: "oklch(1 0 0 / 0.18)", clipPath: "polygon(0 0, 100% 0, 100% 42%, 0 62%)" }} />
        <span style={{ position: "relative", color: "#fff" }}><Icon name={mat.icon} size={24} stroke="#fff" /></span>
      </span>
      <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{mat.label}</span>
    </button>
  );
}

/* ---------- Tarjeta contenedora ---------- */
export function Card({ children, style, pad = 22 }) {
  return <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: pad, boxShadow: "0 2px 0 oklch(0.88 0.03 120)", ...style }}>{children}</div>;
}

/* ---------- Avatar con inicial ---------- */
export function Avatar({ name, size = 44, bg = "var(--green)", color = "#fff" }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontSize: size * 0.42, flexShrink: 0 }}>{(name || "U").charAt(0).toUpperCase()}</span>;
}

/* ---------- Encabezado de página interna ---------- */
export function PageHead({ eyebrow, title, sub, right }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        {eyebrow && <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green-deep)", color: "#fff", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", padding: "7px 14px", borderRadius: 999 }}>{eyebrow}</span>}
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(32px, 4.4vw, 48px)", color: "var(--ink)", margin: "14px 0 0", lineHeight: 1.16, letterSpacing: -0.5, paddingBottom: 4 }}>{title}</h1>
        {sub && <p style={{ fontFamily: "var(--sans)", fontSize: 16.5, color: "var(--ink-soft)", margin: "10px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- Mapa estilizado (placeholder de react-leaflet) ----------
   Reemplázalo por tu <MapContainer> de react-leaflet cuando integres;
   conserva las props (height, label, moving, originLabel, destLabel). */
export const MAP_ROUTE = "M40 250 C 120 220, 150 120, 250 130 S 400 200, 470 90";
export function MapaPlaceholder({ height = 260, label = "Mapa en vivo", moving = false, originLabel, destLabel, radius = 22 }) {
  const blocks = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) {
    if (rnd() > 0.42) blocks.push({ x: 10 + x * 56 + rnd() * 6, y: 10 + y * 48 + rnd() * 6, w: 30 + rnd() * 20, h: 24 + rnd() * 16, t: rnd() });
  }
  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: radius, overflow: "hidden", border: "1.5px solid var(--line)", background: "oklch(0.93 0.02 150)", boxShadow: "inset 0 2px 12px oklch(0.3 0.04 130 / 0.08)" }}>
      <svg viewBox="0 0 520 300" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect x="0" y="0" width="520" height="300" fill="oklch(0.94 0.018 150)" />
        <rect x="300" y="180" width="120" height="90" rx="14" fill="oklch(0.86 0.07 145)" />
        <rect x="20" y="20" width="90" height="70" rx="12" fill="oklch(0.87 0.06 145)" />
        <path d="M-10 120 C 120 150, 180 60, 320 80 S 540 60, 560 90 L560 130 C 420 120, 320 140, 200 130 S 60 180, -10 160 Z" fill="oklch(0.83 0.07 230)" opacity="0.7" />
        {blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill={b.t > 0.7 ? "oklch(0.9 0.02 100)" : "oklch(0.97 0.015 110)"} stroke="oklch(0.86 0.02 120)" strokeWidth="1" />)}
        {[60, 150, 250, 350, 450].map((x) => <line key={"v" + x} x1={x} y1="0" x2={x} y2="300" stroke="oklch(0.97 0.01 110)" strokeWidth="7" />)}
        {[70, 150, 230].map((y) => <line key={"h" + y} x1="0" y1={y} x2="520" y2={y} stroke="oklch(0.97 0.01 110)" strokeWidth="7" />)}
        <path d={MAP_ROUTE} fill="none" stroke="oklch(0.55 0.14 143)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 11" style={{ animation: moving ? "dash 4s linear infinite" : "none" }} />
        <g><circle cx="40" cy="250" r="13" fill="var(--green-deep)" /><circle cx="40" cy="250" r="5" fill="#fff" /></g>
        <g transform="translate(470 90)"><circle r="16" fill="var(--orange)" opacity="0.3" style={{ transformOrigin: "center", animation: "pulse 2s ease-out infinite" }} /><path d="M0 -16 C 9 -16 16 -9 16 0 C 16 9 0 18 0 18 C 0 18 -16 9 -16 0 C -16 -9 -9 -16 0 -16Z" fill="var(--orange)" /><circle cy="-1" r="5" fill="#fff" /></g>
      </svg>
      {moving && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "3px solid var(--green)", display: "grid", placeItems: "center", boxShadow: "0 4px 10px oklch(0.3 0.04 130 / 0.35)", offsetPath: "path('" + MAP_ROUTE + "')", offsetRotate: "0deg", animation: "routeMove 8s linear infinite" }}>
              <Icon name="truck" size={18} stroke="var(--green-deep)" />
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 7, background: "oklch(1 0 0 / 0.92)", borderRadius: 999, padding: "6px 13px", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, color: "var(--ink)", boxShadow: "0 2px 8px oklch(0.3 0.04 130 / 0.15)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 0 3px oklch(0.66 0.15 142 / 0.3)" }} />{label}
      </div>
      <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 6 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "oklch(1 0 0 / 0.92)", display: "grid", placeItems: "center", boxShadow: "0 2px 8px oklch(0.3 0.04 130 / 0.15)" }}><Icon name="plus" size={15} stroke="var(--ink)" /></span>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "oklch(1 0 0 / 0.92)", display: "grid", placeItems: "center", boxShadow: "0 2px 8px oklch(0.3 0.04 130 / 0.15)" }}><Icon name="minus" size={15} stroke="var(--ink)" /></span>
      </div>
      {(originLabel || destLabel) && (
        <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", flexDirection: "column", gap: 5 }}>
          {originLabel && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "oklch(1 0 0 / 0.92)", borderRadius: 999, padding: "5px 11px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 11.5, color: "var(--ink)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-deep)" }} />{originLabel}</span>}
          {destLabel && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "oklch(1 0 0 / 0.92)", borderRadius: 999, padding: "5px 11px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 11.5, color: "var(--ink)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)" }} />{destLabel}</span>}
        </div>
      )}
    </div>
  );
}

/* ---------- Borde de papel rasgado ---------- */
export function TornEdge({ fill, flip }) {
  return (
    <svg viewBox="0 0 40 1000" preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, [flip ? "left" : "right"]: -1, height: "100%", width: 42, zIndex: 2, transform: flip ? "scaleX(-1)" : "none" }}>
      <path fill={fill} d="M40 0 L18 0 C30 60 8 110 22 165 C34 215 6 255 20 315 C33 372 9 410 23 470 C36 528 8 568 21 628 C34 686 7 726 22 786 C35 842 9 884 21 944 C30 982 24 1000 30 1000 L40 1000 Z" />
    </svg>
  );
}

/* ---------- Panel de marca (lado verde) ---------- */
export function BrandPanel({ brandRight }) {
  return (
    <div style={{ position: "relative", height: "100%", minHeight: 280, background: "var(--green)", overflow: "hidden", display: "flex", flexDirection: "column", padding: "clamp(28px, 4vw, 56px)" }}>
      <TornEdge fill="var(--cream-card)" flip={brandRight} />
      <img src="/bolsas.png" alt="" style={{ position: "absolute", top: "5%", right: "-12%", width: "clamp(240px, 42%, 360px)", height: "auto", zIndex: 0, opacity: 0.92, transform: "rotate(7deg)", animation: "floaty 11s ease-in-out infinite", pointerEvents: "none" }} />
      <img src="/bolsas.png" alt="" style={{ position: "absolute", top: "19%", left: "-16%", width: "clamp(190px, 34%, 290px)", height: "auto", zIndex: 0, opacity: 0.85, transform: "scaleX(-1) rotate(5deg)", animation: "floaty 13s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "6%", right: "23%", animation: "floaty 7s ease-in-out infinite" }}><Starburst points={16} color="var(--yellow)" size={86} inner={0.5} /></div>
      <div style={{ position: "absolute", bottom: "16%", left: "5%", animation: "floaty 9s ease-in-out infinite" }}><Starburst points={20} color="var(--orange)" size={108} inner={0.52} /></div>
      <div style={{ position: "absolute", top: "40%", right: "9%", animation: "floaty 8s ease-in-out infinite" }}><Starburst points={22} color="var(--pink)" size={100} inner={0.5} /></div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 3 }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: "var(--green-deep)", display: "grid", placeItems: "center", boxShadow: "0 4px 0 oklch(0.45 0.12 143)" }}><ReciLogo size={33} /></div>
        <span style={{ fontFamily: "var(--serif)", fontSize: 37, color: "#fff", letterSpacing: 0.3 }}>Reci<span style={{ fontStyle: "italic" }}>App</span></span>
      </div>

      <div style={{ position: "relative", zIndex: 3, marginTop: "auto", marginBottom: "clamp(150px, 22%, 190px)", maxWidth: 540 }}>
        <p style={{ fontFamily: "var(--sans)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2.5, fontSize: 13, color: "oklch(0.92 0.06 130)", margin: "0 0 14px" }}>Plataforma ciudadana de reciclaje</p>
        <h1 style={{ fontFamily: "var(--serif)", color: "#fff", margin: 0, lineHeight: 1.02, fontSize: "clamp(38px, 5vw, 68px)", letterSpacing: -0.5 }}>Únete a la<br /><span style={{ color: "var(--cream)", fontStyle: "italic" }}>Revolución</span><br />del Reciclaje</h1>
        <p style={{ fontFamily: "var(--sans)", color: "oklch(0.95 0.03 120)", fontSize: 17, lineHeight: 1.6, marginTop: 22, maxWidth: 420 }}>Recicla, suma puntos y conéctate con recicladores de tu ciudad.</p>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: "none" }}>
        <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "flex-end", gap: 26, color: "#fff", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, padding: "0 clamp(28px, 4vw, 56px) 12px" }}>
          <span>♻ 8.4 t recicladas</span><span style={{ opacity: 0.9 }}>· 1.2k ciudadanos</span>
        </div>
        <img src="/pie-basura.png" alt="" style={{ display: "block", width: "100%", height: "auto", marginTop: -2 }} />
      </div>
    </div>
  );
}

/* ---------- Layout de autenticación (split brand + formulario) ---------- */
export function AuthLayout({ brandSide = "left", children }) {
  return (
    <div className="stage paper-tex">
      <div className="card" data-brand={brandSide === "right" ? "right" : "left"}>
        <div className="panel panel-brand"><BrandPanel brandRight={brandSide === "right"} /></div>
        <div className="panel panel-form no-bar">
          <div className="form-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
