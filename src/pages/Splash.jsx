import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ReciLogo, Starburst } from "../components/ui/Primitivos";

export default function Splash({ onDone, onContinue }) {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      const cb = onDone || onContinue;
      if (cb) cb();
      else navigate("/login");
    }, 2600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--green)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <img src="/bolsas.png" alt="" style={{ position: "absolute", top: "8%", right: "-8%", width: "min(360px, 50%)", opacity: 0.9, transform: "rotate(8deg)", animation: "floaty 10s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "14%", left: "10%", animation: "floaty 7s ease-in-out infinite" }}>
        <Starburst points={16} color="var(--yellow)" size={80} inner={0.5} />
      </div>
      <div style={{ position: "absolute", bottom: "20%", left: "16%", animation: "floaty 9s ease-in-out infinite" }}>
        <Starburst points={22} color="var(--orange)" size={110} inner={0.52} />
      </div>
      <div style={{ position: "absolute", bottom: "16%", right: "14%", animation: "floaty 8s ease-in-out infinite" }}>
        <Starburst points={20} color="var(--pink)" size={92} inner={0.5} />
      </div>
      <img src="/pie-basura.png" alt="" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", pointerEvents: "none" }} />

      <div className="screen" style={{ position: "relative", zIndex: 3 }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: "var(--green-deep)", display: "grid", placeItems: "center", margin: "0 auto 24px", boxShadow: "0 8px 0 oklch(0.45 0.12 143)" }}>
          <ReciLogo size={58} />
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(52px, 9vw, 88px)", color: "#fff", margin: 0, lineHeight: 1 }}>
          Reci<span style={{ fontStyle: "italic", color: "var(--cream)" }}>App</span>
        </h1>
        <p style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 17, color: "oklch(0.95 0.04 130)", letterSpacing: 1, marginTop: 12 }}>
          Recicla. Conecta. Transforma Lima.
        </p>
        <div style={{ width: 30, height: 30, border: "3px solid oklch(1 0 0 / 0.35)", borderTopColor: "#fff", borderRadius: "50%", margin: "30px auto 0", animation: "spin .8s linear infinite" }} />
      </div>
    </motion.div>
  );
}
