import { useState } from "react";
import { motion } from "framer-motion";

const FRANJAS = [
  {
    value: "manana", label: "Mañana",  icon: "🌅",
    hora: "7:00 – 12:00",
    glow: "rgba(251,191,36,.45)",
    bg: "rgba(251,191,36,.08)",
    borderSel: "rgba(251,191,36,.55)",
    colorSel: "#fbbf24",
  },
  {
    value: "tarde", label: "Tarde", icon: "☀️",
    hora: "12:00 – 18:00",
    glow: "rgba(251,146,60,.45)",
    bg: "rgba(251,146,60,.08)",
    borderSel: "rgba(251,146,60,.55)",
    colorSel: "#fb923c",
  },
  {
    value: "noche", label: "Noche", icon: "🌙",
    hora: "18:00 – 22:00",
    glow: "rgba(167,139,250,.45)",
    bg: "rgba(167,139,250,.08)",
    borderSel: "rgba(167,139,250,.55)",
    colorSel: "#c4b5fd",
  },
];

const hoy = new Date().toISOString().split("T")[0];

export default function Paso3FechaFranja({ form, onChange, onNext, onBack }) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!form.fecha_recoleccion) { setError("Selecciona una fecha"); return; }
    if (!form.franja_horaria)    { setError("Selecciona una franja horaria"); return; }
    setError("");
    onNext();
  };

  return (
    <div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        color: "white", fontSize: "1.1rem", marginBottom: "0.35rem",
      }}>
        ¿Cuándo prefieres la recolección?
      </h3>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.85rem", marginBottom: "1.4rem" }}>
        Elige fecha y franja horaria
      </p>

      {/* Date picker */}
      <label style={{
        display: "block", fontFamily: "var(--font-display)", fontWeight: 600,
        fontSize: "0.85rem", color: "rgba(255,255,255,.6)", marginBottom: "0.5rem",
      }}>
        Fecha
      </label>
      <input
        type="date"
        min={hoy}
        value={form.fecha_recoleccion}
        onChange={(e) => { onChange("fecha_recoleccion", e.target.value); setError(""); }}
        className="input"
        style={{
          colorScheme: "dark",
          marginBottom: "1.4rem",
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
        }}
      />

      {/* Franjas */}
      <label style={{
        display: "block", fontFamily: "var(--font-display)", fontWeight: 600,
        fontSize: "0.85rem", color: "rgba(255,255,255,.6)", marginBottom: "0.6rem",
      }}>
        Franja horaria
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem", marginBottom: "1.25rem" }}>
        {FRANJAS.map(({ value, label, icon, hora, glow, bg, borderSel, colorSel }, i) => {
          const sel = form.franja_horaria === value;
          return (
            <motion.button
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, delay: i * 0.06 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => { onChange("franja_horaria", value); setError(""); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "0.9rem 0.5rem", borderRadius: "var(--radius)",
                border: sel ? `1.5px solid ${borderSel}` : "1.5px solid rgba(255,255,255,.08)",
                background: sel ? bg : "rgba(255,255,255,.06)",
                cursor: "pointer", transition: "all .25s",
                boxShadow: sel ? `0 0 18px ${glow}, 0 0 36px rgba(0,0,0,.1)` : "none",
              }}
            >
              <span style={{ fontSize: "1.6rem", marginBottom: "0.4rem", lineHeight: 1 }}>{icon}</span>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.82rem",
                color: sel ? colorSel : "rgba(255,255,255,.7)", marginBottom: "0.2rem",
              }}>
                {label}
              </span>
              <span style={{ color: "rgba(255,255,255,.35)", fontSize: "0.7rem" }}>{hora}</span>
            </motion.button>
          );
        })}
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "0.75rem" }}>{error}</p>
      )}

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onBack}
          className="btn-ghost"
        >
          ← Atrás
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleNext}
          className="btn-lime"
          style={{ fontSize: "0.9rem", padding: "0.65rem 1.75rem" }}
        >
          Siguiente →
        </motion.button>
      </div>
    </div>
  );
}
