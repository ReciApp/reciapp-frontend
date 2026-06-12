import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, StatusBadge } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { listarBacklog } from "../api/reciclador";
import { MAT, ESTADOS } from "../lib/datos";

// Columnas del tablero, al estilo Jira: cada estado del flujo es una columna.
const COLUMNAS = [
  { id: "asignada",               titulo: "Asignadas",     hint: "Por aceptar o planificar" },
  { id: "confirmada",             titulo: "Confirmadas",   hint: "Comprometidas para mañana" },
  { id: "en_camino",              titulo: "En curso",      hint: "Ruta activa" },
  { id: "pendiente_confirmacion", titulo: "Por confirmar", hint: "Esperando al ciudadano" },
  { id: "completada",             titulo: "Completadas",   hint: "Cerradas con éxito" },
];

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

/* ---------- Línea de tiempo de transiciones (trazabilidad RECI-77) ---------- */
function Historial({ items }) {
  if (!items?.length) return null;
  return (
    <ol style={{ listStyle: "none", margin: "10px 0 0", padding: "10px 0 0", borderTop: "1px dashed var(--line)" }}>
      {items.map((h) => (
        <li key={h.id} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "3px 0", fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-soft)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ESTADOS[h.estado_nuevo]?.color || "var(--line)", flexShrink: 0, position: "relative", top: -1 }} />
          <span style={{ flex: 1 }}>
            {h.estado_anterior ? <>{ESTADOS[h.estado_anterior]?.label || h.estado_anterior} → </> : "Creada como "}
            <strong style={{ color: "var(--ink)" }}>{ESTADOS[h.estado_nuevo]?.label || h.estado_nuevo}</strong>
          </span>
          <span style={{ flexShrink: 0, fontSize: 11.5 }}>{fmtFecha(h.fecha)}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Tarjeta tipo Jira ---------- */
function TarjetaBacklog({ s }) {
  const [abierta, setAbierta] = useState(false);
  const mat = MAT[s.tipo_residuo];

  return (
    <article style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 12, color: "var(--ink-soft)", letterSpacing: 0.4 }}>
          RECI-{s.id}
        </span>
        <StatusBadge estado={s.estado} size="sm" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px" }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: mat?.color || "var(--line)", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
          {mat?.label || s.tipo_residuo} · {s.cantidad_kg} kg
        </span>
      </div>

      <div style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="pin" size={13} stroke="var(--ink-soft)" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.direccion}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="calendar" size={13} stroke="var(--ink-soft)" />
          {s.fecha_recoleccion} · {s.franja_horaria}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        style={{
          marginTop: 8, border: "none", background: "none", cursor: "pointer",
          fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, color: "var(--green-deep)",
          display: "inline-flex", alignItems: "center", gap: 5, padding: 0,
        }}
      >
        <Icon name={abierta ? "minus" : "plus"} size={12} stroke="var(--green-deep)" />
        {abierta ? "Ocultar actividad" : `Actividad (${s.historial?.length ?? 0})`}
      </button>
      {abierta && <Historial items={s.historial} />}
    </article>
  );
}

/**
 * RECI-78: backlog tipo Jira del reciclador.
 * Tablero por estados que consume GET /api/reciclador/solicitudes (RECI-77),
 * con filtro por fecha y trazabilidad de transiciones por tarjeta.
 */
export default function BacklogReciclador() {
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "reciclador";

  const [solicitudes, setSolicitudes] = useState([]);
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    listarBacklog(fecha ? { fecha } : {})
      .then((data) => { setSolicitudes(data || []); setError(null); })
      .catch(() => setError("No se pudo cargar tu backlog"))
      .finally(() => setCargando(false));
  }, [fecha]);

  const porColumna = useMemo(() => {
    const grupos = Object.fromEntries(COLUMNAS.map((c) => [c.id, []]));
    for (const s of solicitudes) {
      if (grupos[s.estado]) grupos[s.estado].push(s);
    }
    return grupos;
  }, [solicitudes]);

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="reciclador" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 1120, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Backlog"
          title={<span>Tu <span style={{ color: "var(--orange)", fontStyle: "italic" }}>tablero</span> de trabajo</span>}
          sub="Todas tus solicitudes organizadas por estado, con su historial completo."
          right={
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13.5, color: "var(--ink-soft)" }}>
              <Icon name="calendar" size={16} stroke="var(--ink-soft)" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ fontFamily: "var(--sans)", fontSize: 14, padding: "8px 12px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--cream-card)", color: "var(--ink)" }}
              />
              {fecha && (
                <button type="button" onClick={() => setFecha("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--pink)", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13 }}>
                  Limpiar
                </button>
              )}
            </label>
          }
        />

        {error && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--pink)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--pink)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, alignItems: "start" }}>
          {COLUMNAS.map((col) => (
            <section key={col.id} style={{ background: "color-mix(in oklch, var(--green) 4%, var(--cream))", border: "1.5px solid var(--line)", borderRadius: 16, padding: 10, minHeight: 180 }}>
              <header style={{ padding: "4px 6px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <h2 style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--ink)", margin: 0 }}>
                    {col.titulo}
                  </h2>
                  <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, color: "var(--ink-soft)", background: "var(--cream-card)", border: "1px solid var(--line)", borderRadius: 999, padding: "1px 9px" }}>
                    {porColumna[col.id].length}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 11.5, color: "var(--ink-soft)", margin: "2px 0 0" }}>{col.hint}</p>
              </header>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cargando ? (
                  <div style={{ textAlign: "center", padding: "26px 8px", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)" }}>Cargando…</div>
                ) : porColumna[col.id].length === 0 ? (
                  <div style={{ textAlign: "center", padding: "26px 8px", border: "1.5px dashed var(--line)", borderRadius: 12, fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)" }}>
                    Sin tarjetas
                  </div>
                ) : (
                  porColumna[col.id].map((s) => <TarjetaBacklog key={s.id} s={s} />)
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
