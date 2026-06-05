import { useState } from "react";
import { motion } from "framer-motion";

const QUICK_PICKS = [1, 2, 5, 10, 20];

export default function Paso2Cantidad({ form, onChange, onNext, onBack }) {
  const [error, setError] = useState("");

  const handleNext = () => {
    const val = parseFloat(form.cantidad_kg);
    if (!form.cantidad_kg || isNaN(val) || val <= 0) {
      setError("Ingresa una cantidad mayor a 0 kg");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        color: "white", fontSize: "1.1rem", marginBottom: "0.35rem",
      }}>
        ¿Cuántos kilogramos aproximadamente?
      </h3>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Ingresa el peso estimado del material a reciclar
      </p>

      {/* Big input */}
      <div style={{ position: "relative", marginBottom: "0.5rem" }}>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={form.cantidad_kg}
          onChange={(e) => { onChange("cantidad_kg", e.target.value); setError(""); }}
          placeholder="0.0"
          style={{
            width: "100%", fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "2rem", textAlign: "center",
            background: "rgba(255,255,255,.07)", color: "white",
            border: error ? "1.5px solid rgba(239,68,68,.5)" : "1.5px solid rgba(255,255,255,.12)",
            borderRadius: "var(--radius-sm)", padding: "0.9rem 3.5rem 0.9rem 1rem",
            outline: "none", transition: "all .2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(132,204,22,.5)";
            e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.12)";
            e.target.style.boxShadow = "none";
          }}
        />
        <span style={{
          position: "absolute", right: "1.1rem", top: "50%", transform: "translateY(-50%)",
          color: "rgba(255,255,255,.4)", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: "1.1rem",
        }}>
          kg
        </span>
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "0.75rem" }}>{error}</p>
      )}

      {/* Quick picks */}
      <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.78rem", marginBottom: "0.5rem", marginTop: "1rem" }}>
        Acceso rápido
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {QUICK_PICKS.map((kg) => {
          const selected = parseFloat(form.cantidad_kg) === kg;
          return (
            <motion.button
              key={kg}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => { onChange("cantidad_kg", kg.toString()); setError(""); }}
              style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.82rem",
                padding: "0.4rem 0.85rem", borderRadius: "var(--radius-pill)",
                border: selected ? "1.5px solid rgba(132,204,22,.6)" : "1.5px solid rgba(255,255,255,.12)",
                background: selected ? "rgba(132,204,22,.12)" : "rgba(255,255,255,.06)",
                color: selected ? "#a3e635" : "rgba(255,255,255,.6)",
                cursor: "pointer", transition: "all .2s",
              }}
            >
              {kg} kg
            </motion.button>
          );
        })}
      </div>

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
