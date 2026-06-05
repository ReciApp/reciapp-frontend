import { motion } from "framer-motion";

const PASOS = [
  { label: "Tipo",     icon: "♻" },
  { label: "Cantidad", icon: "⚖" },
  { label: "Fecha",    icon: "📅" },
  { label: "Confirmar", icon: "✓" },
];

export default function BarraPasos({ actual }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", marginBottom: "2rem",
    }}>
      {PASOS.map(({ label, icon }, i) => {
        const n = i + 1;
        const done   = n < actual;
        const active = n === actual;

        return (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: i < PASOS.length - 1 ? 1 : "none" }}>
            {/* Step circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <motion.div
                animate={active ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)",
                  position: "relative", transition: "all .3s",
                  ...(done ? {
                    background: "rgba(132,204,22,.18)",
                    border: "2px solid rgba(132,204,22,.5)",
                    color: "#a3e635",
                  } : active ? {
                    background: "linear-gradient(135deg,#a3e635,#84cc16)",
                    border: "2px solid rgba(132,204,22,.6)",
                    color: "#14532d",
                    boxShadow: "0 0 20px rgba(132,204,22,.45), 0 0 40px rgba(132,204,22,.2)",
                  } : {
                    background: "rgba(255,255,255,.05)",
                    border: "2px solid rgba(255,255,255,.12)",
                    color: "rgba(255,255,255,.3)",
                  }),
                }}
              >
                {icon}
              </motion.div>
              <span style={{
                fontSize: "0.7rem", marginTop: "0.35rem", fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: active
                  ? "#a3e635"
                  : done
                  ? "rgba(132,204,22,.7)"
                  : "rgba(255,255,255,.3)",
              }}>
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < PASOS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginInline: "0.5rem", marginBottom: "1.3rem",
                background: done
                  ? "linear-gradient(90deg,rgba(132,204,22,.7),rgba(132,204,22,.35))"
                  : "rgba(255,255,255,.08)",
                borderRadius: 2,
                transition: "background .4s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
