import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { getPendingRecicladores, validarReciclador } from "../api/users";
import Particles from "../components/ui/Particles";

// ── Aurora orbs ───────────────────────────────────────────────────────────────
function AuroraOrbs() {
  return (
    <>
      <div style={{
        position: "fixed", top: "-10%", left: "-5%", width: 600, height: 600,
        borderRadius: "50%", background: "rgba(251,191,36,.08)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-1" />
      <div style={{
        position: "fixed", bottom: "-15%", right: "-10%", width: 700, height: 700,
        borderRadius: "50%", background: "rgba(132,204,22,.07)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-2" />
      <div style={{
        position: "fixed", top: "40%", left: "60%", width: 400, height: 400,
        borderRadius: "50%", background: "rgba(251,191,36,.05)", filter: "blur(70px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-3" />
    </>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: delay || 0 }}
      style={{
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <span style={{ fontSize: "2rem" }}>{icon}</span>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: "0.78rem",
        color: "rgba(255,255,255,.5)", letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 800,
        color: color || "white", lineHeight: 1,
      }}>
        {value}
      </span>
    </motion.div>
  );
}

// ── Reciclador row ────────────────────────────────────────────────────────────
function RecicladorRow({ reciclador, onAprobar, onRechazar, loadingId }) {
  const inicial = (reciclador.nombre || "?").charAt(0).toUpperCase();
  const busy = loadingId === reciclador.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      style={{
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: "var(--radius)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,rgba(251,191,36,.5),rgba(132,204,22,.4))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem",
        color: "white", border: "1.5px solid rgba(251,191,36,.3)",
      }}>
        {inicial}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          color: "white", fontSize: "0.95rem",
        }}>
          {reciclador.nombre}
        </p>
        <p style={{
          color: "rgba(255,255,255,.45)", fontSize: "0.8rem", marginTop: "0.15rem",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {reciclador.email || reciclador.correo}
        </p>
        {reciclador.zona_cobertura && (
          <p style={{ color: "rgba(163,230,53,.7)", fontSize: "0.75rem", marginTop: "0.1rem" }}>
            📍 {reciclador.zona_cobertura}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAprobar(reciclador.id)}
          disabled={busy}
          className="btn-lime"
          style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", opacity: busy ? 0.5 : 1 }}
        >
          {busy ? "..." : "✓ Aprobar"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRechazar(reciclador.id)}
          disabled={busy}
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.82rem",
            padding: "0.45rem 1rem", borderRadius: "var(--radius-pill)",
            background: "rgba(239,68,68,.12)", border: "1.5px solid rgba(239,68,68,.3)",
            color: "#f87171", cursor: "pointer", opacity: busy ? 0.5 : 1, transition: "all .2s",
          }}
        >
          ✕ Rechazar
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      style={{
        position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
        background: type === "success" ? "rgba(132,204,22,.15)" : "rgba(239,68,68,.15)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `1.5px solid ${type === "success" ? "rgba(132,204,22,.4)" : "rgba(239,68,68,.4)"}`,
        borderRadius: "var(--radius-pill)", padding: "0.75rem 1.5rem",
        color: "white", fontFamily: "var(--font-display)", fontWeight: 600,
        fontSize: "0.9rem", zIndex: 9999, whiteSpace: "nowrap",
        boxShadow: type === "success"
          ? "0 0 24px rgba(132,204,22,.25)"
          : "0 0 24px rgba(239,68,68,.25)",
      }}
    >
      {msg}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminHome() {
  const [recicladores, setRecicladores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    getPendingRecicladores()
      .then(setRecicladores)
      .catch(() => showToast("Error al cargar recicladores", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleAprobar = async (id) => {
    setLoadingId(id);
    try {
      await validarReciclador(id, "aprobado");
      setRecicladores((prev) => prev.filter((r) => r.id !== id));
      showToast("✓ Reciclador aprobado correctamente", "success");
    } catch {
      showToast("Error al aprobar el reciclador", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRechazar = async (id) => {
    setLoadingId(id);
    try {
      await validarReciclador(id, "rechazado");
      setRecicladores((prev) => prev.filter((r) => r.id !== id));
      showToast("Reciclador rechazado", "error");
    } catch {
      showToast("Error al rechazar el reciclador", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#0b1f12", color: "white", position: "relative" }}>
      <AuroraOrbs />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Particles count={40} color="251,191,36" opacity={0.3} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            style={{ marginBottom: "2.5rem" }}
          >
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem,4vw,2.6rem)",
              fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: "0.4rem",
            }}>
              Panel de administración
            </h1>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.95rem", fontFamily: "var(--font-body)" }}>
              Gestiona los recicladores pendientes de validación
            </p>
          </motion.div>

          {/* Stats grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "1rem", marginBottom: "2.5rem",
          }}>
            <StatCard icon="⏳" label="Pendientes" value={loading ? "—" : recicladores.length} color="#fbbf24" delay={0.05} />
            <StatCard icon="✅" label="Sistema" value="Activo" color="#a3e635" delay={0.1} />
            <StatCard icon="🌱" label="Plataforma" value="OK" color="#4ade80" delay={0.15} />
          </div>

          {/* Lista */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "1.2rem", color: "white",
              }}>
                Recicladores pendientes
              </h2>
              {recicladores.length > 0 && (
                <span style={{
                  background: "rgba(251,191,36,.2)", border: "1px solid rgba(251,191,36,.4)",
                  color: "#fbbf24", fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: "0.78rem", padding: "0.2rem 0.65rem", borderRadius: "var(--radius-pill)",
                }}>
                  {recicladores.length}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "rgba(255,255,255,.4)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                <p>Cargando...</p>
              </div>
            ) : recicladores.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "var(--radius)", padding: "4rem 2rem", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📭</div>
                <p style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  color: "rgba(255,255,255,.6)", fontSize: "1.1rem",
                }}>
                  Sin recicladores pendientes
                </p>
                <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  Todos han sido procesados
                </p>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <AnimatePresence>
                  {recicladores.map((r) => (
                    <RecicladorRow
                      key={r.id}
                      reciclador={r}
                      onAprobar={handleAprobar}
                      onRechazar={handleRechazar}
                      loadingId={loadingId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
