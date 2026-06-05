import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { crearSolicitud } from "../../api/solicitudes";
import BarraPasos from "./BarraPasos";
import Paso1Tipo from "./Paso1Tipo";
import Paso2Cantidad from "./Paso2Cantidad";
import Paso3FechaFranja from "./Paso3FechaFranja";
import Paso4Confirmacion from "./Paso4Confirmacion";
import LiquidGlass from "../ui/LiquidGlass";

const FORM_INICIAL = {
  tipo_residuo: "",
  cantidad_kg: "",
  fecha_recoleccion: "",
  franja_horaria: "",
  direccion: "",
  latitud: null,
  longitud: null,
};

// Slide variants: dir 1 = forward (slide left-in), -1 = back (slide right-in)
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// ── Success screen ─────────────────────────────────────────────────────────────
function PantallaExito({ solicitud, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      style={{ textAlign: "center", padding: "2.5rem 1rem" }}
    >
      {/* Icon with glow pulse */}
      <motion.div
        animate={{ boxShadow: ["0 0 20px rgba(132,204,22,.35)", "0 0 48px rgba(132,204,22,.65)", "0 0 20px rgba(132,204,22,.35)"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 1.5rem",
          background: "rgba(132,204,22,.12)", border: "2px solid rgba(132,204,22,.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem",
        }}
      >
        ♻
      </motion.div>

      <h3 style={{
        fontFamily: "var(--font-display)", fontSize: "1.5rem",
        fontWeight: 800, color: "white", marginBottom: "0.6rem",
      }}>
        ¡Solicitud enviada!
      </h3>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Te notificaremos cuando un reciclador sea asignado.
      </p>

      {/* Tracking number */}
      <div style={{
        background: "rgba(132,204,22,.08)", border: "1px solid rgba(132,204,22,.2)",
        borderRadius: "var(--radius-sm)", padding: "0.65rem 1rem",
        marginBottom: "2rem", display: "inline-block",
      }}>
        <span style={{ color: "rgba(255,255,255,.5)", fontSize: "0.75rem", display: "block", marginBottom: "0.25rem" }}>
          Número de seguimiento
        </span>
        <span style={{
          fontFamily: "monospace", color: "#a3e635",
          fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em",
        }}>
          {solicitud?.numero_seguimiento}
        </span>
      </div>

      <br />
      <motion.button
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className="btn-lime"
        style={{ fontSize: "0.95rem", padding: "0.7rem 2rem" }}
      >
        Cerrar
      </motion.button>
    </motion.div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────
export default function NuevaSolicitudModal({ onClose, onCreada }) {
  const [paso, setPaso] = useState(1);
  const [dir, setDir] = useState(1); // slide direction
  const [form, setForm] = useState(FORM_INICIAL);
  const [exito, setExito] = useState(null);       // optimistic placeholder
  const [errorServidor, setErrorServidor] = useState("");

  const onChange = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const next = () => {
    setDir(1);
    setPaso((p) => p + 1);
  };

  const back = () => {
    setDir(-1);
    setPaso((p) => p - 1);
  };

  const handleSubmit = async () => {
    setErrorServidor("");

    // Optimistic: show success immediately with a placeholder tracking number
    const optimistic = {
      numero_seguimiento: "RCAP-" + Date.now().toString(36).toUpperCase(),
    };
    setExito(optimistic);

    const payload = {
      tipo_residuo:      form.tipo_residuo,
      cantidad_kg:       parseFloat(form.cantidad_kg),
      fecha_recoleccion: form.fecha_recoleccion,
      franja_horaria:    form.franja_horaria,
      direccion:         form.direccion.trim(),
      latitud:           form.latitud,
      longitud:          form.longitud,
    };

    // API call in background
    try {
      const solicitud = await crearSolicitud(payload);
      // Update with real data
      setExito(solicitud);
      onCreada?.(solicitud);
    } catch (err) {
      // Revert optimistic
      setExito(null);
      setErrorServidor(
        err?.response?.data?.detail || "Error al crear la solicitud. Intenta de nuevo."
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
          background: "rgba(2,8,5,.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          style={{ width: "100%", maxWidth: 520 }}
        >
          <LiquidGlass
            borderRadius={20}
            blur={16}
            tint="rgba(11,31,18,.88)"
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              maxHeight: "90dvh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1.4rem 1.6rem 1rem",
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "1.2rem", color: "white",
              }}>
                Nueva solicitud de recolección
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "50%", width: 32, height: 32, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: "0.9rem",
                  transition: "all .2s",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "1.4rem 1.6rem 1.6rem" }}>
              {exito ? (
                <PantallaExito solicitud={exito} onClose={onClose} />
              ) : (
                <>
                  <BarraPasos actual={paso} />

                  {errorServidor && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)",
                        borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem",
                        color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem",
                      }}
                    >
                      {errorServidor}
                    </motion.div>
                  )}

                  {/* Animated step content */}
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div
                        key={paso}
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 340, damping: 30 }}
                      >
                        {paso === 1 && <Paso1Tipo form={form} onChange={onChange} onNext={next} />}
                        {paso === 2 && <Paso2Cantidad form={form} onChange={onChange} onNext={next} onBack={back} />}
                        {paso === 3 && <Paso3FechaFranja form={form} onChange={onChange} onNext={next} onBack={back} />}
                        {paso === 4 && (
                          <Paso4Confirmacion
                            form={form}
                            onChange={onChange}
                            onBack={back}
                            onSubmit={handleSubmit}
                            loading={false}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </LiquidGlass>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
