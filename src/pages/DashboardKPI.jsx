import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Icon, PageHead } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { resumenAnalytics } from "../api/analytics";

const inputStyle = {
  fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", background: "var(--cream-card)",
  border: "1.5px solid var(--line)", borderRadius: 10, padding: "8px 10px", outline: "none",
};

/* Tarjeta KPI */
function Kpi({ icon, color, value, label, sufijo }) {
  return (
    <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "20px 22px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <span style={{ width: 44, height: 44, borderRadius: 13, background: color, display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={22} stroke="#fff" />
      </span>
      <div style={{ fontFamily: "var(--serif)", fontSize: 36, color: "var(--ink)", lineHeight: 1, marginTop: 14 }}>
        {value}{sufijo && <span style={{ fontSize: 16, fontStyle: "italic", color: "var(--ink-soft)" }}> {sufijo}</span>}
      </div>
      <div style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* Gráfico de barras simple (kg por día) */
function BarChart({ serie }) {
  if (!serie.length) {
    return <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink-soft)" }}>Sin datos en el rango seleccionado.</p>;
  }
  const max = Math.max(...serie.map((p) => p.kg), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, overflowX: "auto", paddingBottom: 4 }} className="no-bar">
      {serie.map((p) => (
        <div key={p.fecha} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 38, flex: "1 0 auto" }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>{p.kg}</span>
          <div title={`${p.fecha}: ${p.kg} kg`} style={{ width: "100%", maxWidth: 40, height: `${Math.round((p.kg / max) * 150) + 4}px`, background: "var(--green)", borderRadius: "6px 6px 0 0" }} />
          <span style={{ fontFamily: "var(--sans)", fontSize: 10.5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{p.fecha.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

/* Distribución horizontal (por estado / tipo) */
function Distribucion({ titulo, datos, color }) {
  const entradas = Object.entries(datos || {});
  const total = entradas.reduce((a, [, v]) => a + v, 0) || 1;
  return (
    <div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)", margin: "0 0 12px" }}>{titulo}</h3>
      {entradas.length === 0 ? (
        <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink-soft)" }}>Sin datos.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entradas.sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)", marginBottom: 3 }}>
                <span style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                <strong style={{ color: "var(--ink)" }}>{v}</strong>
              </div>
              <div style={{ height: 8, background: "var(--cream)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((v / total) * 100)}%`, height: "100%", background: color, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * RECI-67: Dashboard de KPIs del administrador. Consume RECI-66
 * (/api/analytics/resumen) con filtros de fecha y tipo de residuo.
 */
export default function DashboardKPI() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = user?.nombre || user?.name || "admin";

  const [filtros, setFiltros] = useState({ desde: "", hasta: "", tipo_residuo: "" });
  const [aplicados, setAplicados] = useState({ desde: "", hasta: "", tipo_residuo: "" });
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const set = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const cargar = useCallback(async (f) => {
    setCargando(true);
    try {
      setData(await resumenAnalytics(f));
      setError(null);
    } catch {
      setError("No se pudo cargar el resumen de analytics");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(aplicados); }, [cargar, aplicados]);

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="admin" onLogout={() => { logout(); navigate("/login", { replace: true }); }} />
      <main className="screen" style={{ maxWidth: 1040, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Analytics"
          title={<span>Dashboard de <span style={{ color: "var(--green-deep)", fontStyle: "italic" }}>indicadores</span></span>}
          sub="KPIs de recolección, eco-créditos y satisfacción."
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

        {cargando || !data ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>Cargando indicadores…</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
              <Kpi icon="recycle" color="var(--green)" value={data.completadas} label="Recolecciones completadas" />
              <Kpi icon="weight" color="var(--green-deep)" value={data.total_kg_reciclados} sufijo="kg" label="Total reciclado" />
              <Kpi icon="leaf" color="var(--orange, #e8833a)" value={data.eco_creditos_otorgados} label="Eco-créditos otorgados" />
              <Kpi icon="star" color="#e8a13a" value={data.calificacion_promedio ?? "—"} sufijo={data.calificacion_promedio ? "/ 5" : ""} label={`Satisfacción (${data.total_calificaciones} reseñas)`} />
            </div>

            <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: 22, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)", margin: "0 0 16px" }}>Kg reciclados por día</h3>
              <BarChart serie={data.serie_kg_por_dia || []} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: 22 }}>
              <Distribucion titulo="Por estado" datos={data.por_estado} color="var(--green)" />
              <Distribucion titulo="Por tipo de residuo (completadas)" datos={data.por_tipo_residuo} color="var(--orange, #e8833a)" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
