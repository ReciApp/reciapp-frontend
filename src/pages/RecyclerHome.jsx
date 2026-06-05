import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { listarSolicitudes, obtenerSolicitud } from "../api/solicitudes";
import TarjetaSolicitudEntrante from "../components/PanelReciclador/TarjetaSolicitudEntrante";
import FormularioEvidencia from "../components/PanelReciclador/FormularioEvidencia";
import MapaNavegacion from "../components/MapaNavegacion/MapaNavegacion";
import Particles from "../components/ui/Particles";

// ── Aurora orbs ───────────────────────────────────────────────────────────────
function AuroraOrbs() {
  return (
    <>
      <div style={{
        position: "fixed", top: "-8%", left: "-5%", width: 580, height: 580,
        borderRadius: "50%", background: "rgba(96,165,250,.09)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-1" />
      <div style={{
        position: "fixed", bottom: "-12%", right: "-8%", width: 650, height: 650,
        borderRadius: "50%", background: "rgba(132,204,22,.07)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-2" />
      <div style={{
        position: "fixed", top: "45%", left: "55%", width: 380, height: 380,
        borderRadius: "50%", background: "rgba(167,139,250,.07)", filter: "blur(70px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-3" />
    </>
  );
}

const TIPO_ICONO = {
  plastico: "🧴", papel: "📄", vidrio: "🍶",
  metal: "🔩", organico: "🍃", electronico: "💻",
};
const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ title, count, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
      <h2 style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: "1.1rem", color: "white",
      }}>
        {title}
      </h2>
      {count != null && count > 0 && (
        <span style={{
          background: color || "rgba(96,165,250,.2)",
          border: `1px solid ${color ? color.replace(".2)", ".5)") : "rgba(96,165,250,.4)"}`,
          color: "white", fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "0.75rem", padding: "0.18rem 0.6rem", borderRadius: "var(--radius-pill)",
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── TarjetaEnCamino ───────────────────────────────────────────────────────────
function TarjetaEnCamino({ solicitud, wsRef, rutaData }) {
  const [mostrarEvidencia, setMostrarEvidencia] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(167,139,250,.3)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "1.1rem 1.4rem",
        display: "flex", alignItems: "center", gap: "0.9rem",
      }}>
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: "1.8rem", lineHeight: 1 }}
        >
          {TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}
        </motion.span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            color: "white", fontSize: "0.95rem", textTransform: "capitalize",
          }}>
            {solicitud.tipo_residuo} · {solicitud.cantidad_kg} kg
          </p>
          <p style={{
            color: "rgba(255,255,255,.45)", fontSize: "0.78rem",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {solicitud.direccion}
          </p>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.75rem", marginTop: "0.1rem" }}>
            {solicitud.fecha_recoleccion} · {FRANJA_LABEL[solicitud.franja_horaria]}
          </p>
        </div>
        <span style={{
          background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.4)",
          color: "#c4b5fd", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "0.78rem", padding: "0.3rem 0.8rem", borderRadius: "var(--radius-pill)",
          flexShrink: 0,
        }}>
          🚛 En camino
        </span>
      </div>

      {/* Mapa */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <MapaNavegacion solicitud={solicitud} wsRef={wsRef} rutaData={rutaData} />
      </div>

      {/* Evidencia toggle */}
      <div style={{
        padding: "0.75rem 1.4rem",
        borderTop: "1px solid rgba(255,255,255,.08)",
      }}>
        <button
          onClick={() => setMostrarEvidencia((v) => !v)}
          style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.85rem",
            background: "rgba(132,204,22,.1)", border: "1px solid rgba(132,204,22,.3)",
            color: "#a3e635", borderRadius: "var(--radius-pill)",
            padding: "0.45rem 1.1rem", cursor: "pointer", transition: "all .2s",
          }}
        >
          {mostrarEvidencia ? "▲ Ocultar evidencia" : "📷 Registrar evidencia"}
        </button>
        <AnimatePresence>
          {mostrarEvidencia && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden", marginTop: "0.75rem" }}
            >
              <FormularioEvidencia solicitud={solicitud} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── TarjetaEsperandoConfirmacion ──────────────────────────────────────────────
function TarjetaEsperandoConfirmacion({ solicitud }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(255,237,213,.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(251,146,60,.3)",
        borderRadius: "var(--radius)",
        padding: "1.1rem 1.4rem",
        display: "flex", alignItems: "center", gap: "0.9rem",
      }}
    >
      <span style={{ fontSize: "1.8rem" }}>{TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          color: "white", fontSize: "0.95rem", textTransform: "capitalize",
        }}>
          {solicitud.tipo_residuo} · {solicitud.cantidad_kg} kg
        </p>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: "0.78rem", marginTop: "0.1rem" }}>
          Esperando que el ciudadano confirme la recolección
        </p>
      </div>
      <span style={{
        background: "rgba(251,146,60,.15)", border: "1px solid rgba(251,146,60,.4)",
        color: "#fb923c", fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: "0.78rem", padding: "0.3rem 0.8rem", borderRadius: "var(--radius-pill)",
        flexShrink: 0,
      }}>
        ⏰ Por confirmar
      </span>
    </motion.div>
  );
}

// ── TarjetaCompletada ─────────────────────────────────────────────────────────
function TarjetaCompletada({ solicitud }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(132,204,22,.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(132,204,22,.2)",
        borderRadius: "var(--radius)",
        padding: "1rem 1.4rem",
        display: "flex", alignItems: "center", gap: "0.9rem",
        opacity: 0.85,
      }}
    >
      <span style={{ fontSize: "1.6rem" }}>{TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          color: "rgba(255,255,255,.8)", fontSize: "0.9rem", textTransform: "capitalize",
        }}>
          {solicitud.tipo_residuo} · {solicitud.cantidad_kg} kg
        </p>
        <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.75rem", marginTop: "0.1rem" }}>
          {solicitud.fecha_recoleccion} · {FRANJA_LABEL[solicitud.franja_horaria]}
        </p>
      </div>
      <span className="badge badge-completada" style={{ flexShrink: 0, fontSize: "0.72rem" }}>
        ✅ Completada
      </span>
    </motion.div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function RecyclerHome() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rutasActivas, setRutasActivas] = useState({});

  useEffect(() => {
    listarSolicitudes()
      .then(setSolicitudes)
      .catch(() => setError("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, []);

  const handleWsMessage = useCallback(async (msg) => {
    if (msg.tipo === "nueva_solicitud") {
      try {
        const solicitud = await obtenerSolicitud(msg.solicitud_id);
        setSolicitudes((prev) => {
          if (prev.some((s) => s.id === solicitud.id)) return prev;
          return [solicitud, ...prev];
        });
      } catch {}
    } else if (msg.tipo === "ruta_actualizada") {
      setRutasActivas((prev) => ({
        ...prev,
        [msg.solicitud_id]: {
          ruta: msg.ruta, distanciaKm: msg.distancia_km, etaMin: msg.eta_min,
        },
      }));
    } else if (msg.tipo === "recoleccion_completada") {
      setSolicitudes((prev) =>
        prev.map((s) => s.id === msg.solicitud_id ? { ...s, estado: "completada" } : s)
      );
    }
  }, []);

  const wsRef = useWebSocket(handleWsMessage, !loading);

  const handleAceptada = (updated) => {
    setSolicitudes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleRechazada = (id) => {
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  };

  const entrantes             = solicitudes.filter((s) => s.estado === "asignada");
  const enCamino              = solicitudes.filter((s) => s.estado === "en_camino");
  const esperandoConfirmacion = solicitudes.filter((s) => s.estado === "pendiente_confirmacion");
  const completadas           = solicitudes.filter((s) => s.estado === "completada");

  return (
    <div style={{ minHeight: "100dvh", background: "#0b1f12", color: "white", position: "relative" }}>
      <AuroraOrbs />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Particles count={40} color="96,165,250" opacity={0.25} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", marginBottom: "2rem",
            }}
          >
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem,4vw,2.4rem)",
                fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: "0.5rem",
              }}>
                Panel del reciclador
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse-dot" />
                <span style={{ color: "rgba(255,255,255,.5)", fontSize: "0.85rem", fontFamily: "var(--font-body)" }}>
                  Hola, {user?.nombre || "reciclador"}
                </span>
              </div>
            </div>
            <Link to="/perfil" style={{
              color: "rgba(163,230,53,.8)", fontSize: "0.85rem",
              textDecoration: "none", fontFamily: "var(--font-display)", fontWeight: 600,
              marginTop: "0.35rem",
            }}>
              Mi perfil
            </Link>
          </motion.div>

          {/* Validación pendiente */}
          {user?.estado_validacion === "pendiente" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.3)",
                borderRadius: "var(--radius)", padding: "1rem 1.25rem",
                color: "#fbbf24", fontSize: "0.9rem", marginBottom: "1.75rem",
                fontFamily: "var(--font-body)",
              }}
            >
              ⚠️ Tu cuenta está pendiente de validación. El administrador debe aprobarte antes de recibir solicitudes.
            </motion.div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "rgba(255,255,255,.4)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
              <p>Cargando...</p>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)",
              borderRadius: "var(--radius)", padding: "1rem 1.25rem",
              color: "#f87171", fontSize: "0.9rem", marginBottom: "1.5rem",
            }}>
              {error}
            </div>
          )}

          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

              {/* ── Solicitudes entrantes ── */}
              <section>
                <SectionTitle title="Solicitudes entrantes" count={entrantes.length} color="rgba(96,165,250,.2)" />
                {entrantes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)",
                      borderRadius: "var(--radius)", padding: "3rem 2rem", textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
                    <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.9rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                      Sin solicitudes pendientes
                    </p>
                    <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                      Te notificaremos en tiempo real cuando llegue una nueva.
                    </p>
                  </motion.div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <AnimatePresence>
                      {entrantes.map((s) => (
                        <TarjetaSolicitudEntrante
                          key={s.id}
                          solicitud={s}
                          onAceptada={handleAceptada}
                          onRechazada={handleRechazada}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>

              {/* ── En camino ── */}
              {enCamino.length > 0 && (
                <section>
                  <SectionTitle title="En camino" count={enCamino.length} color="rgba(167,139,250,.2)" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {enCamino.map((s) => (
                      <TarjetaEnCamino
                        key={s.id}
                        solicitud={s}
                        wsRef={wsRef}
                        rutaData={rutasActivas[s.id] ?? null}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Esperando confirmación ── */}
              {esperandoConfirmacion.length > 0 && (
                <section>
                  <SectionTitle title="Esperando confirmación" count={esperandoConfirmacion.length} color="rgba(251,146,60,.2)" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {esperandoConfirmacion.map((s) => (
                      <TarjetaEsperandoConfirmacion key={s.id} solicitud={s} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Completadas ── */}
              {completadas.length > 0 && (
                <section>
                  <SectionTitle title="Completadas" count={completadas.length} color="rgba(132,204,22,.2)" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {completadas.map((s) => (
                      <TarjetaCompletada key={s.id} solicitud={s} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
