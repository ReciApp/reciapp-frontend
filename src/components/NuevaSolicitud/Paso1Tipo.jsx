import { motion } from "framer-motion";

const TIPOS = [
  { value: "plastico",    label: "Plástico",    icon: "🧴", glow: "rgba(96,165,250,.4)"  },
  { value: "papel",       label: "Papel",        icon: "📄", glow: "rgba(251,191,36,.4)"  },
  { value: "vidrio",      label: "Vidrio",       icon: "🍶", glow: "rgba(34,211,238,.4)"  },
  { value: "metal",       label: "Metal",        icon: "🔩", glow: "rgba(156,163,175,.4)" },
  { value: "organico",    label: "Orgánico",     icon: "🍃", glow: "rgba(74,222,128,.4)"  },
  { value: "electronico", label: "Electrónico",  icon: "💻", glow: "rgba(167,139,250,.4)" },
];

export default function Paso1Tipo({ form, onChange, onNext }) {
  return (
    <div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        color: "white", fontSize: "1.1rem", marginBottom: "0.35rem",
      }}>
        ¿Qué tipo de residuo deseas reciclar?
      </h3>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        Selecciona una categoría
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem" }}>
        {TIPOS.map(({ value, label, icon, glow }, i) => {
          const selected = form.tipo_residuo === value;
          return (
            <motion.button
              key={value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, delay: i * 0.04 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onChange("tipo_residuo", value)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "1rem 0.5rem", borderRadius: "var(--radius)",
                border: selected ? "1.5px solid rgba(132,204,22,.6)" : "1.5px solid rgba(255,255,255,.08)",
                background: selected ? "rgba(132,204,22,.1)" : "rgba(255,255,255,.06)",
                cursor: "pointer", transition: "all .25s",
                boxShadow: selected ? `0 0 16px ${glow}, 0 0 32px rgba(132,204,22,.15)` : "none",
              }}
            >
              <span style={{ fontSize: "1.8rem", marginBottom: "0.5rem", lineHeight: 1 }}>{icon}</span>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.78rem",
                color: selected ? "#a3e635" : "rgba(255,255,255,.6)",
                textAlign: "center",
              }}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          disabled={!form.tipo_residuo}
          onClick={onNext}
          className="btn-lime"
          style={{ fontSize: "0.9rem", padding: "0.65rem 1.75rem", opacity: form.tipo_residuo ? 1 : 0.4 }}
        >
          Siguiente →
        </motion.button>
      </div>
    </div>
  );
}
