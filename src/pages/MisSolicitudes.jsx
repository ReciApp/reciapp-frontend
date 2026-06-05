import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { listarSolicitudes } from "../api/solicitudes";
import { getUsuario } from "../api/users";
import { useWebSocket } from "../hooks/useWebSocket";
import MapaTracking from "../components/MapaTracking/MapaTracking";
import PanelConfirmacion from "../components/ConfirmacionRecoleccion/PanelConfirmacion";
import Particles from "../components/ui/Particles";

// ── Aurora orbs ───────────────────────────────────────────────────────────────
function AuroraOrbs() {
  return (
    <>
      <div style={{
        position: "fixed", top: "-5%", right: "-5%", width: 560, height: 560,
        borderRadius: "50%", background: "rgba(132,204,22,.08)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-1" />
      <div style={{
        position: "fixed", bottom: "-10%", left: "-8%", width: 650, height: 650,
        borderRadius: "50%", background: "rgba(74,222,128,.06)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-2" />
      <div style={{
        position: "fixed", top: "50%", left: "40%", width: 350, height: 350,
        borderRadius: "50%", background: "rgba(96,165,250,.06)", filter: "blur(70px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-3" />
    </>
  );
}

// ── Estado config ─────────────────────────────────────────────────────────────
const ESTADO = {
  pendiente:              { badgeClass: "badge-pendiente",              icono: "⏳", label: "Pendiente" },
  asignada:               { badgeClass: "badge-asignada",               icono: "👷", label: "Asignada" },
  en_camino:              { badgeClass: "badge-en_camino",              icono: "🚛", label: "En camino" },
  pendiente_confirmacion: { badgeClass: "badge-pendiente_confirmacion", icono: "⏰", label: "Confirmar" },
  completada:             { badgeClass: "badge-completada",             icono: "✅", label: "Completada" },
  cancelada:              { badgeClass: "badge-cancelada",              icono: "❌", label: "Cancelada" },
};

const TIPO_ICONO = {
  plastico: "🧴", papel: "📄", vidrio: "🍶",
  metal: "🔩", organico: "🍃", electronico: "💻",
};

const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };

// ── Detail helper ─────────────────────────────────────────────────────────────
function Detail({ label, value }) {
  return (
    <div>
      <span style={{ color: "rgba(255,255,255,.4)", fontSize: "0.75rem", fontFamily: "var(--font-body)" }}>
        {label}
      </span>
      <p style={{ color: "rgba(255,255,255,.9)", fontWeight: 600, fontSize: "0.88rem", marginTop: "0.1rem" }}>
        {value}
      </p>
    </div>
  );
}

// ── SolicitudCard ─────────────────────────────────────────────────────────────
function SolicitudCard({ solicitud, recicladorCache, onFetchReciclador, posicionReciclador, onActualizar }) {
  const [abierta, setAbierta] = useState(false);
  const cfg = ESTADO[solicitud.estado] || ESTADO.pendiente;
  const reciclador = solicitud.reciclador_id ? recicladorCache[solicitud.reciclador_id] : null;

  const handleAbrir = () => {
    const next = !abierta;
    setAbierta(next);
    if (next && solicitud.reciclador_id && !recicladorCache[solicitud.reciclador_id]) {
      onFetchReciclador(solicitud.reciclador_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      {/* Cabecera */}
      <button
        onClick={handleAbrir}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.1rem 1.4rem", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>
            {TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}
          </span>
          <div>
            <p style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              color: "white", fontSize: "0.95rem", textTransform: "capitalize",
            }}>
              {solicitud.tipo_residuo} · {solicitud.cantidad_kg} kg
            </p>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
              {solicitud.fecha_recoleccion} · {FRANJA_LABEL[solicitud.franja_horaria]}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className={`badge ${cfg.badgeClass}`}>
            {cfg.icono} {cfg.label}
          </span>
          <span style={{ color: "rgba(255,255,255,.35)", fontSize: "0.8rem" }}>
            {abierta ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Detalle expandible */}
      <AnimatePresence>
        {abierta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: "1px solid rgba(255,255,255,.08)",
              padding: "1.25rem 1.4rem",
              display: "flex", flexDirection: "column", gap: "1rem",
            }}>
              {/* Grid de datos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1rem" }}>
                <Detail label="Cantidad" value={`${solicitud.cantidad_kg} kg`} />
                <Detail label="Dirección" value={solicitud.direccion} />
                <Detail label="Seguimiento" value={
                  <span style={{ fontFamily: "monospace", color: "rgba(163,230,53,.85)", fontSize: "0.8rem", wordBreak: "break-all" }}>
                    {solicitud.numero_seguimiento}
                  </span>
                } />
                <Detail label="Estado" value={`${cfg.icono} ${cfg.label}`} />
              </div>

              {/* Mapa tracking */}
              {solicitud.estado === "en_camino" && (
                <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <MapaTracking solicitud={solicitud} posicionReciclador={posicionReciclador} />
                </div>
              )}

              {/* Panel confirmacion */}
              {solicitud.estado === "pendiente_confirmacion" && (
                <PanelConfirmacion solicitud={solicitud} onConfirmada={onActualizar} />
              )}

              {/* Reciclador */}
              {solicitud.reciclador_id && (
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,.08)",
                  paddingTop: "0.9rem", marginTop: "0.25rem",
                }}>
                  <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    color: "rgba(255,255,255,.7)", fontSize: "0.85rem", marginBottom: "0.6rem",
                  }}>
                    👷 Reciclador asignado
                  </p>
                  {reciclador === undefined ? (
                    <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.8rem" }}>Cargando datos...</p>
                  ) : reciclador ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem" }}>
                      <Detail label="Nombre" value={reciclador.nombre} />
                      {reciclador.celular && <Detail label="Celular" value={reciclador.celular} />}
                      {reciclador.zona_cobertura && <Detail label="Zona" value={reciclador.zona_cobertura} />}
                      {reciclador.disponibilidad_horaria && (
                        <Detail label="Horario" value={reciclador.disponibilidad_horaria} />
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.8rem" }}>
                      No se pudo cargar la información.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recicladorCache, setRecicladorCache] = useState({});
  const [posicionesReciclador, setPosicionesReciclador] = useState({});
  const notifRef = useRef([]);

  useEffect(() => {
    listarSolicitudes()
      .then(setSolicitudes)
      .catch(() => setError("No se pudo cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, []);

  const fetchReciclador = useCallback((recicladorId) => {
    setRecicladorCache((prev) => {
      if (prev[recicladorId] !== undefined) return prev;
      getUsuario(recicladorId)
        .then((data) => setRecicladorCache((c) => ({ ...c, [recicladorId]: data })))
        .catch(() => setRecicladorCache((c) => ({ ...c, [recicladorId]: null })));
      return { ...prev, [recicladorId]: undefined };
    });
  }, []);

  const handleActualizar = useCallback((solicitudActualizada) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === solicitudActualizada.id ? solicitudActualizada : s))
    );
  }, []);

  const handleWsMessage = useCallback((msg) => {
    setSolicitudes((prev) => {
      const idx = prev.findIndex((s) => s.id === msg.solicitud_id);
      if (idx === -1) return prev;
      const updated = [...prev];

      if (msg.tipo === "solicitud_asignada") {
        updated[idx] = { ...updated[idx], estado: "asignada", reciclador_id: msg.reciclador_id };
        notifRef.current.push(msg.reciclador_id);
      } else if (msg.tipo === "solicitud_en_camino") {
        updated[idx] = { ...updated[idx], estado: "en_camino" };
      } else if (msg.tipo === "solicitud_reasignando") {
        updated[idx] = { ...updated[idx], estado: "pendiente", reciclador_id: null };
      } else if (msg.tipo === "evidencia_registrada") {
        updated[idx] = { ...updated[idx], estado: "pendiente_confirmacion" };
      } else if (msg.tipo === "eco_creditos_acreditados") {
        updated[idx] = { ...updated[idx], estado: "completada" };
      }
      return updated;
    });

    if (msg.tipo === "posicion_reciclador") {
      setPosicionesReciclador((prev) => ({
        ...prev,
        [msg.solicitud_id]: { lat: msg.lat, lon: msg.lon, etaMin: msg.eta_min },
      }));
    }
  }, []);

  useEffect(() => {
    const ids = notifRef.current.splice(0);
    ids.forEach(fetchReciclador);
  }, [solicitudes, fetchReciclador]);

  useWebSocket(handleWsMessage, !loading);

  return (
    <div style={{ minHeight: "100dvh", background: "#0b1f12", color: "white", position: "relative" }}>
      <AuroraOrbs />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Particles count={40} color="132,204,22" opacity={0.3} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}
          >
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem,4vw,2.4rem)",
                fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: "0.5rem",
              }}>
                Mis solicitudes
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse-dot" />
                <span style={{ color: "rgba(255,255,255,.45)", fontSize: "0.85rem", fontFamily: "var(--font-body)" }}>
                  Actualizaciones en tiempo real
                </span>
              </div>
            </div>
            <Link to="/ciudadano" style={{
              color: "rgba(163,230,53,.8)", fontSize: "0.85rem",
              textDecoration: "none", fontFamily: "var(--font-display)", fontWeight: 600,
              marginTop: "0.35rem",
            }}>
              ← Inicio
            </Link>
          </motion.div>

          {/* Leyenda de estados */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}
          >
            {Object.entries(ESTADO).map(([key, { badgeClass, icono, label }]) => (
              <span key={key} className={`badge ${badgeClass}`} style={{ fontSize: "0.72rem" }}>
                {icono} {label}
              </span>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "rgba(255,255,255,.4)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
              <p>Cargando solicitudes...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)",
              borderRadius: "var(--radius)", padding: "1rem 1.25rem",
              color: "#f87171", fontSize: "0.9rem",
            }}>
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && solicitudes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "var(--radius)", padding: "5rem 2rem", textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📋</div>
              <p style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                color: "rgba(255,255,255,.6)", fontSize: "1.1rem",
              }}>
                Aún no tienes solicitudes
              </p>
              <Link to="/ciudadano" style={{
                color: "rgba(163,230,53,.8)", fontSize: "0.85rem",
                textDecoration: "none", display: "inline-block", marginTop: "0.75rem",
              }}>
                Crear tu primera solicitud →
              </Link>
            </motion.div>
          )}

          {/* Lista */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <AnimatePresence>
              {solicitudes.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.05 }}
                >
                  <SolicitudCard
                    solicitud={s}
                    recicladorCache={recicladorCache}
                    onFetchReciclador={fetchReciclador}
                    posicionReciclador={posicionesReciclador[s.id] ?? null}
                    onActualizar={handleActualizar}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
