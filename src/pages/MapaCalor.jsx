import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { Icon, PageHead } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { heatmapAnalytics } from "../api/analytics";

const PUENTE_PIEDRA = [-11.87, -77.07];

const inputStyle = {
  fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", background: "var(--cream-card)",
  border: "1.5px solid var(--line)", borderRadius: 10, padding: "8px 10px", outline: "none",
};

/** Color cálido según intensidad relativa (0..1): verde → amarillo → rojo. */
function colorIntensidad(t) {
  if (t < 0.5) {
    // verde a amarillo
    const k = t / 0.5;
    return `rgb(${Math.round(60 + 195 * k)}, ${Math.round(160 + 40 * k)}, 60)`;
  }
  // amarillo a rojo
  const k = (t - 0.5) / 0.5;
  return `rgb(255, ${Math.round(200 - 160 * k)}, 50)`;
}

/**
 * RECI-69: mapa de calor de recolecciones (Leaflet). Consume RECI-68
 * (/api/analytics/heatmap). Cada punto se dibuja como un círculo cálido cuyo
 * radio y color escalan con el peso (kg); el solapamiento genera el efecto
 * de "zonas calientes".
 */
export default function MapaCalor() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = user?.nombre || user?.name || "admin";

  const [filtros, setFiltros] = useState({ desde: "", hasta: "", tipo_residuo: "" });
  const [aplicados, setAplicados] = useState({ desde: "", hasta: "", tipo_residuo: "" });
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const set = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const cargar = useCallback(async (f) => {
    setCargando(true);
    try {
      const data = await heatmapAnalytics(f);
      setPuntos((data || []).filter((p) => p.lat != null && p.lon != null));
      setError(null);
    } catch {
      setError("No se pudo cargar el mapa de calor");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(aplicados); }, [cargar, aplicados]);

  const maxPeso = useMemo(() => Math.max(...puntos.map((p) => p.peso || 0), 1), [puntos]);
  const totalKg = useMemo(() => puntos.reduce((a, p) => a + (p.peso || 0), 0), [puntos]);

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="admin" onLogout={() => { logout(); navigate("/login", { replace: true }); }} />
      <main className="screen" style={{ maxWidth: 1040, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Analytics"
          title={<span>Mapa de <span style={{ color: "var(--orange, #e8833a)", fontStyle: "italic" }}>calor</span></span>}
          sub="Concentración geográfica de las recolecciones completadas."
        />

        {/* Filtros */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Desde<input type="date" value={filtros.desde} onChange={set("desde")} style={inputStyle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Hasta<input type="date" value={filtros.hasta} onChange={set("hasta")} style={inputStyle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Tipo de residuo
            <select value={filtros.tipo_residuo} onChange={set("tipo_residuo")} style={inputStyle}>
              <option value="">Todos</option>
              {["plastico", "papel", "vidrio", "metal", "organico", "electronicos", "carton"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => setAplicados(filtros)} style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, color: "#fff", background: "var(--green)", border: "none", borderRadius: 999, padding: "9px 18px", cursor: "pointer", boxShadow: "0 3px 0 var(--green-deep)", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Icon name="search" size={15} stroke="#fff" />Aplicar
          </button>
        </div>

        {error && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--pink)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--pink)" }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink-soft)" }}>
          <span><strong style={{ color: "var(--ink)" }}>{puntos.length}</strong> recolecciones</span>
          <span><strong style={{ color: "var(--ink)" }}>{Math.round(totalKg * 100) / 100}</strong> kg en el mapa</span>
        </div>

        <div style={{ position: "relative", height: 520, borderRadius: 20, overflow: "hidden", border: "1.5px solid var(--line)" }}>
          {cargando && (
            <div style={{ position: "absolute", inset: 0, zIndex: 500, display: "grid", placeItems: "center", background: "oklch(1 0 0 / 0.5)", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>
              Cargando mapa…
            </div>
          )}
          <MapContainer center={PUENTE_PIEDRA} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {puntos.map((p, i) => {
              const t = (p.peso || 0) / maxPeso;
              const color = colorIntensidad(t);
              return (
                <CircleMarker
                  key={i}
                  center={[p.lat, p.lon]}
                  radius={14 + t * 26}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 0 }}
                >
                  <Tooltip>{p.peso} kg</Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Leyenda */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)" }}>
          <span>Menos kg</span>
          <div style={{ flex: "0 0 180px", height: 10, borderRadius: 999, background: "linear-gradient(90deg, rgb(60,160,60), rgb(255,200,50), rgb(255,40,50))" }} />
          <span>Más kg</span>
        </div>
      </main>
    </div>
  );
}
