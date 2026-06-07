import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import NuevaSolicitudModal from "../components/NuevaSolicitud/NuevaSolicitudModal";
import { Icon, MapaPlaceholder, Starburst, MaterialCard } from "../components/ui/Primitivos";
import { MATERIALES } from "../lib/datos";
import { crearSolicitud } from "../api/solicitudes";

function MiniStat({ value, unit, label, color }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 120, background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontFamily: "var(--serif)", fontSize: 30, color: color || "var(--ink)", lineHeight: 1 }}>{value}</span>{unit && <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 700, color: "var(--ink-soft)" }}>{unit}</span>}</div>
      <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)", margin: "5px 0 0", fontWeight: 500 }}>{label}</p>
    </div>
  );
}

function DashCard({ badgeBg, icon, title, sub, accent, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "relative", textAlign: "left", cursor: "pointer", width: "100%", background: "var(--cream-card)", border: "1.5px solid " + (hover ? (accent || "var(--green)") : "var(--line)"), borderRadius: 20, padding: "20px 20px 22px", display: "flex", flexDirection: "column", gap: 14, minHeight: 150, boxShadow: hover ? "0 12px 26px -16px oklch(0.3 0.04 130 / 0.55)" : "0 2px 0 oklch(0.88 0.03 120)", transform: hover ? "translateY(-3px)" : "none", transition: "transform .15s, box-shadow .15s, border-color .15s" }}>
      <span style={{ width: 46, height: 46, borderRadius: 13, background: badgeBg, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={22} stroke="#fff" /></span>
      <div style={{ marginTop: "auto" }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--ink)", lineHeight: 1.1, whiteSpace: "nowrap" }}>{title}</span>
        <p style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: "5px 0 0" }}>{sub}</p>
      </div>
      <span style={{ position: "absolute", top: 22, right: 20, color: hover ? (accent || "var(--green)") : "var(--line)", transition: "color .15s, transform .15s", transform: hover ? "translateX(2px)" : "none" }}><Icon name="arrowRight" size={18} sw={2.2} /></span>
    </button>
  );
}

export default function CitizenHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);

  const nombre = user?.nombre?.split(" ")[0] || "ciudadano";

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleCrearSolicitud = async (data) => {
    try {
      await crearSolicitud({
        tipo_residuo: data.tipos[0],
        cantidad_kg: data.kg,
        franja_horaria: data.franja,
        direccion: data.direccion,
      });
    } catch { /* el modal ya muestra éxito optimista */ }
    navigate("/ciudadano/solicitudes");
  };

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <Navbar user={nombre} role="ciudadano" onLogout={handleLogout} />
      <main className="screen" style={{ maxWidth: 1120, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 40px", position: "relative", flex: 1 }}>
        <img src="/bolsas.png" alt="" style={{ position: "absolute", top: "1%", left: "-8%", width: 200, height: "auto", opacity: 0.45, transform: "scaleX(-1) rotate(6deg)", zIndex: 0, pointerEvents: "none", animation: "floaty 13s ease-in-out infinite" }} />

        {/* hero */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <div style={{ flex: "1 1 380px", minWidth: 280 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, whiteSpace: "nowrap", background: "var(--green-deep)", color: "#fff", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", padding: "8px 15px", borderRadius: 999 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--yellow)", boxShadow: "0 0 0 3px oklch(0.83 0.15 90 / 0.3)" }} />Lima · Reciclaje activo
            </span>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(38px, 5.2vw, 60px)", color: "var(--ink)", margin: "16px 0 0", lineHeight: 1.03, letterSpacing: -0.5 }}>Hola, <span style={{ color: "var(--green)", fontStyle: "italic" }}>{nombre}</span> <span style={{ fontStyle: "normal" }}>👋</span></h1>
            <p style={{ fontFamily: "var(--sans)", fontSize: 18, color: "var(--ink-soft)", margin: "10px 0 0" }}>¿Qué deseas reciclar hoy?</p>
          </div>
          <div style={{ flex: "0 1 320px", minWidth: 270, position: "relative", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 22, padding: "20px 22px", boxShadow: "0 3px 0 oklch(0.88 0.03 120)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--green-soft)", display: "grid", placeItems: "center" }}><Icon name="leaf" size={21} stroke="#fff" /></span>
                <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-soft)" }}>Eco-créditos</span>
              </div>
              <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--orange)", background: "oklch(0.72 0.17 55 / 0.14)", padding: "3px 8px", borderRadius: 999 }}>Próximamente</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}><span style={{ fontFamily: "var(--serif)", fontSize: 46, color: "var(--green-deep)", lineHeight: 1 }}>{user?.eco_creditos ?? 0}</span><span style={{ fontFamily: "var(--sans)", fontSize: 15, fontWeight: 600, color: "var(--ink-soft)" }}>créditos</span></div>
            <div style={{ height: 9, borderRadius: 999, background: "oklch(0.88 0.03 120)", marginTop: 14, overflow: "hidden" }}><div style={{ width: "62%", height: "100%", borderRadius: 999, background: "var(--green)" }} /></div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", margin: "9px 0 0" }}>Te faltan <strong style={{ color: "var(--ink)" }}>30</strong> para tu próximo cupón.</p>
          </div>
        </div>

        {/* mini stats */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24 }}>
          <MiniStat value="48" unit="kg" label="Reciclados este mes" color="var(--green-deep)" />
          <MiniStat value="9" label="Recolecciones" color="var(--orange)" />
          <MiniStat value="Brote" label="Tu nivel ReciApp" color="var(--green)" />
          <MiniStat value="#7" label="Ranking del barrio" color="var(--pink)" />
        </div>

        {/* mapa + nueva solicitud */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 18, marginTop: 22 }}>
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "0 6px 0 var(--green-deep)" }}>
            <MapaPlaceholder height={300} label="Recicladores cerca de ti" radius={0} />
            <button type="button" onClick={() => setModal(true)} style={{ position: "absolute", left: 18, bottom: 18, fontFamily: "var(--serif)", fontSize: 18, color: "#fff", background: "var(--green)", border: "none", borderRadius: 999, padding: "13px 24px", cursor: "pointer", boxShadow: "0 4px 0 var(--green-deep)", display: "inline-flex", alignItems: "center", gap: 10 }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = "0 2px 0 var(--green-deep)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 var(--green-deep)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 var(--green-deep)"; }}>
              <Icon name="plus" size={20} stroke="#fff" sw={2.6} />Nueva solicitud
            </button>
          </div>

          <div style={{ position: "relative", overflow: "hidden", background: "var(--green)", borderRadius: 24, boxShadow: "0 6px 0 var(--green-deep)", padding: 26, display: "flex", flexDirection: "column" }}>
            <img src="/bolsas.png" alt="" style={{ position: "absolute", right: "-12%", top: "-14%", width: 200, height: "auto", opacity: 0.55, zIndex: 0, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "-8%", bottom: "-22%", zIndex: 0, pointerEvents: "none", animation: "floaty 9s ease-in-out infinite" }}><Starburst points={20} color="var(--yellow)" size={110} inner={0.52} style={{ opacity: 0.85 }} /></div>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: "var(--green-deep)", display: "grid", placeItems: "center" }}><Icon name="truck" size={24} stroke="#fff" /></span>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "#fff", margin: "14px 0 0", lineHeight: 1.06 }}>Solicitar recolección</h2>
              <p style={{ fontFamily: "var(--sans)", fontSize: 15, color: "oklch(0.95 0.03 120)", margin: "8px 0 0", lineHeight: 1.5 }}>Un reciclador pasa por tus materiales sin que salgas de casa.</p>
            </div>
            <button type="button" onClick={() => setModal(true)} style={{ position: "relative", zIndex: 2, marginTop: 20, alignSelf: "flex-start", fontFamily: "var(--serif)", fontSize: 17, color: "var(--green-deep)", background: "var(--cream)", border: "none", borderRadius: 999, padding: "12px 24px", cursor: "pointer", boxShadow: "0 4px 0 oklch(0.78 0.04 100)", display: "inline-flex", alignItems: "center", gap: 9 }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = "0 2px 0 oklch(0.78 0.04 100)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 oklch(0.78 0.04 100)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 oklch(0.78 0.04 100)"; }}>
              Programar ahora <span>→</span>
            </button>
          </div>
        </div>

        {/* accesos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 16 }}>
          <DashCard accent="var(--orange)" badgeBg="var(--orange)" icon="clipboard" title="Mis solicitudes" sub="Rastrea tus recolecciones" onClick={() => navigate("/ciudadano/solicitudes")} />
          <DashCard accent="var(--yellow)" badgeBg="var(--yellow)" icon="pin" title="Centros de acopio" sub="Encuentra puntos cercanos" />
          <DashCard accent="var(--pink)" badgeBg="var(--pink)" icon="user" title="Mi perfil" sub="Datos y configuración" onClick={() => navigate("/perfil")} />
        </div>

        {/* materiales */}
        <div style={{ marginTop: 34 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(22px, 2.6vw, 28px)", color: "var(--ink)", margin: "0 0 4px" }}>¿Qué puedes <span style={{ color: "var(--green)", fontStyle: "italic" }}>reciclar</span>?</h3>
          <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 16px" }}>Separa por tipo y suma eco-créditos por cada entrega.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: 12 }}>
            {MATERIALES.map((m) => <MaterialCard key={m.id} mat={m} onClick={() => setModal(true)} />)}
          </div>
        </div>
      </main>

      <footer style={{ background: "var(--green)", textAlign: "center", padding: "22px 20px 26px", marginTop: 30 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: "clamp(20px, 2.4vw, 26px)", color: "#fff" }}>♻ Juntos por una <span style={{ color: "var(--cream)", fontStyle: "italic" }}>Lima</span> más limpia</span>
      </footer>

      <NuevaSolicitudModal open={modal} onClose={() => setModal(false)} onSubmit={handleCrearSolicitud} />
    </div>
  );
}
