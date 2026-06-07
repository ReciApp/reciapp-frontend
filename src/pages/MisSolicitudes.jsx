import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PanelConfirmacion from "../components/ConfirmacionRecoleccion/PanelConfirmacion";
import { Icon, PageHead, StatusBadge, Avatar, PrimaryButton, GhostButton } from "../components/ui/Primitivos";
import { MAT } from "../lib/datos";
import { listarSolicitudes, confirmarSolicitud } from "../api/solicitudes";
import { useWebSocket } from "../hooks/useWebSocket";

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "activas", label: "Activas" },
  { id: "pendiente_confirmacion", label: "Por confirmar" },
  { id: "completada", label: "Completadas" },
  { id: "cancelada", label: "Canceladas" },
];
const ACTIVOS = ["pendiente", "asignada", "en_camino"];

function SolicitudCard({ s, onConfirm, onTrack }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: "var(--cream-card)", border: "1.5px solid " + (hover ? "var(--green-soft)" : "var(--line)"), borderRadius: 20, padding: "18px 20px", boxShadow: hover ? "0 12px 26px -16px oklch(0.3 0.04 130 / 0.5)" : "0 2px 0 oklch(0.88 0.03 120)", transition: "border-color .15s, box-shadow .15s" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14, minWidth: 0, flex: "1 1 auto" }}>
          <div style={{ display: "flex", flexShrink: 0 }}>
            {s.tipos.slice(0, 3).map((t, i) => (
              <span key={t} style={{ width: 44, height: 44, borderRadius: 13, background: MAT[t]?.color, display: "grid", placeItems: "center", marginLeft: i ? -12 : 0, border: "2.5px solid var(--cream-card)", color: "#fff" }}><Icon name={MAT[t]?.icon} size={20} stroke="#fff" /></span>
            ))}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>{s.tipos.map((t) => MAT[t]?.label).join(", ")}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)", background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 9px" }}>{s.id}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 7, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="weight" size={15} stroke="var(--ink-soft)" />{s.kg} kg</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="calendar" size={15} stroke="var(--ink-soft)" />{s.fecha} · {s.franja}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0 }}><Icon name="pin" size={15} stroke="var(--ink-soft)" /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{s.direccion}</span></span>
            </div>
          </div>
        </div>
        <StatusBadge estado={s.estado} />
      </div>

      {(s.reciclador && s.reciclador !== "—") || s.estado === "pendiente_confirmacion" || s.estado === "en_camino" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {s.reciclador && s.reciclador !== "—" && <>
              <Avatar name={s.reciclador} size={32} bg="var(--green-soft)" />
              <span style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)" }}><strong>{s.reciclador}</strong>{s.estado === "en_camino" && s.eta ? <span style={{ color: "var(--ink-soft)" }}> · llega en {s.eta}</span> : ""}</span>
            </>}
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {s.estado === "en_camino" && <GhostButton onClick={onTrack}><Icon name="gps" size={16} stroke="var(--green-deep)" />Seguir en vivo</GhostButton>}
            {s.estado === "pendiente_confirmacion" && <PrimaryButton type="button" size="sm" onClick={onConfirm}><Icon name="check" size={17} stroke="#fff" />Confirmar recepción</PrimaryButton>}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MisSolicitudes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("todas");
  const [conf, setConf] = useState(null);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef([]);

  const nombre = user?.nombre?.split(" ")[0] || "ciudadano";
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  useEffect(() => {
    listarSolicitudes()
      .then((data) => {
        // normaliza shape de la API al shape del diseño
        const normalizado = data.map((s) => ({
          id: s.numero_seguimiento || s.id,
          tipos: [s.tipo_residuo],
          kg: s.cantidad_kg,
          fecha: s.fecha_recoleccion,
          franja: s.franja_horaria,
          direccion: s.direccion,
          estado: s.estado,
          reciclador: s.reciclador_nombre || "—",
          _raw: s,
        }));
        setLista(normalizado);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleWsMessage = useCallback((msg) => {
    setLista((prev) => prev.map((s) => {
      if (s._raw?.id !== msg.solicitud_id) return s;
      if (msg.tipo === "solicitud_asignada") return { ...s, estado: "asignada" };
      if (msg.tipo === "solicitud_en_camino") return { ...s, estado: "en_camino" };
      if (msg.tipo === "evidencia_registrada") return { ...s, estado: "pendiente_confirmacion" };
      if (msg.tipo === "eco_creditos_acreditados") return { ...s, estado: "completada" };
      return s;
    }));
  }, []);

  useWebSocket(handleWsMessage, !loading);

  const confirmar = async (sol) => {
    try {
      await confirmarSolicitud(sol._raw?.id || sol.id);
    } catch { /* optimistic update igual */ }
    setLista((l) => l.map((s) => s.id === sol.id ? { ...s, estado: "completada" } : s));
    setConf(null);
  };

  const filtered = lista.filter((s) =>
    filtro === "todas" ? true : filtro === "activas" ? ACTIVOS.includes(s.estado) : s.estado === filtro);

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={nombre} role="ciudadano" onLogout={handleLogout} />
      <main className="screen" style={{ maxWidth: 920, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead eyebrow="Tus recolecciones" title="Mis solicitudes" sub="Sigue el estado de cada recojo en tiempo real."
          right={<PrimaryButton type="button" size="sm" onClick={() => navigate("/ciudadano")}><Icon name="plus" size={18} stroke="#fff" />Nueva</PrimaryButton>} />

        {/* filtros */}
        <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }} className="no-bar">
          {FILTROS.map((f) => {
            const on = filtro === f.id;
            const count = f.id === "todas" ? lista.length : f.id === "activas" ? lista.filter((s) => ACTIVOS.includes(s.estado)).length : lista.filter((s) => s.estado === f.id).length;
            return (
              <button key={f.id} type="button" onClick={() => setFiltro(f.id)} style={{ flexShrink: 0, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, padding: "9px 16px", borderRadius: 999, cursor: "pointer", border: "1.5px solid " + (on ? "var(--green)" : "var(--line)"), background: on ? "var(--green)" : "var(--cream-card)", color: on ? "#fff" : "var(--ink)", display: "inline-flex", alignItems: "center", gap: 7 }}>
                {f.label}<span style={{ fontSize: 12, opacity: 0.8, background: on ? "oklch(1 0 0 / 0.22)" : "var(--cream)", borderRadius: 999, padding: "1px 7px" }}>{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-soft)" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--line)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ fontFamily: "var(--sans)", fontSize: 15.5 }}>Cargando solicitudes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-soft)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--cream-card)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon name="clipboard" size={28} stroke="var(--ink-soft)" /></div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 15.5 }}>No tienes solicitudes en esta categoría.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((s) => (
              <SolicitudCard key={s.id} s={s} onConfirm={() => setConf(s)}
                onTrack={() => navigate(`/ciudadano/solicitudes/${s._raw?.id || s.id}/seguimiento`)} />
            ))}
          </div>
        )}
      </main>

      <PanelConfirmacion open={!!conf} solicitud={conf?._raw || conf} onClose={() => setConf(null)} onConfirm={() => confirmar(conf)} />
    </div>
  );
}
