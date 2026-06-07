import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon, PrimaryButton, Starburst } from "../components/ui/Primitivos";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="paper-tex" style={{ position: "relative", minHeight: "100vh", background: "var(--cream)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <div style={{ position: "absolute", top: "16%", left: "16%", animation: "floaty 8s ease-in-out infinite" }}>
        <Starburst points={18} color="var(--yellow)" size={70} inner={0.5} style={{ opacity: 0.8 }} />
      </div>
      <div style={{ position: "absolute", bottom: "20%", right: "18%", animation: "floaty 10s ease-in-out infinite" }}>
        <Starburst points={20} color="var(--pink)" size={86} inner={0.5} style={{ opacity: 0.8 }} />
      </div>

      <div className="screen" style={{ position: "relative", zIndex: 2, maxWidth: 460 }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(110px, 22vw, 200px)", color: "var(--green)", margin: 0, lineHeight: 0.9, letterSpacing: -4 }}>404</h1>
          <span style={{ position: "absolute", top: "8%", right: "-6%", animation: "floaty 6s ease-in-out infinite" }}>
            <Icon name="recycle" size={54} stroke="var(--orange)" sw={2.2} />
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(26px, 4vw, 34px)", color: "var(--ink)", margin: "10px 0 8px" }}>
          Esta página se fue al <span style={{ color: "var(--green)", fontStyle: "italic" }}>contenedor</span> equivocado
        </h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: 16, color: "var(--ink-soft)", margin: "0 0 26px", lineHeight: 1.55 }}>
          No encontramos lo que buscabas. Reciclemos esta ruta y volvamos al inicio.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PrimaryButton type="button" onClick={() => navigate(-1)}>
            <Icon name="home" size={19} stroke="#fff" />Volver al inicio
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
