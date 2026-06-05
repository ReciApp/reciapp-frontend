import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { obtenerEvidencias } from "../../api/evidencias";
import { confirmarSolicitud } from "../../api/solicitudes";
import { useConfetti } from "../ui/useConfetti";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PanelConfirmacion({ solicitud, onConfirmada }) {
  const [evidencias, setEvidencias] = useState([]);
  const [loadingEv, setLoadingEv]   = useState(true);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [ecoGanados, setEcoGanados] = useState(null);
  const btnRef = useRef(null);
  const { burst } = useConfetti();

  useEffect(() => {
    obtenerEvidencias(solicitud.id).then(setEvidencias).catch(()=>{}).finally(()=>setLoadingEv(false));
  }, [solicitud.id]);

  const handleConfirmar = async () => {
    setLoading(true); setError("");
    try {
      await confirmarSolicitud(solicitud.id);
      const total = evidencias.reduce((s, e) => s + e.eco_creditos, 0);
      setEcoGanados(total); setConfirmado(true); onConfirmada?.(solicitud.id, total);
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        burst({ x:(r.left + r.width/2)/window.innerWidth, y:r.top/window.innerHeight });
      } else burst();
    } catch (e) { setError(e.response?.data?.detail || "Error al confirmar"); }
    finally { setLoading(false); }
  };

  if (confirmado) return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      style={{ marginTop:"0.875rem", padding:"1rem", background:"var(--accent-lt)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", borderLeft:"3px solid var(--accent)" }}>
      <p style={{ fontWeight:600, color:"var(--accent)", fontSize:"0.9rem" }}>¡Recolección confirmada!</p>
      <p style={{ fontSize:"0.8125rem", color:"var(--ink-2)", marginTop:4 }}>
        Has ganado <strong style={{ color:"var(--accent)" }}>{ecoGanados} eco-créditos</strong> en tu wallet.
      </p>
    </motion.div>
  );

  return (
    <div style={{ marginTop:"0.875rem", padding:"1rem", background:"var(--warn-lt)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", borderLeft:"3px solid var(--warn)" }}>
      <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--warn)", marginBottom:"0.75rem" }}>
        Evidencia registrada — confírmala para recibir tus eco-créditos.
      </p>

      {loadingEv ? (
        <p style={{ fontSize:"0.8125rem", color:"var(--ink-3)" }}>Cargando evidencia…</p>
      ) : evidencias.length === 0 ? (
        <p style={{ fontSize:"0.8125rem", color:"var(--ink-3)" }}>Sin evidencias disponibles.</p>
      ) : (
        <div style={{ marginBottom:"0.875rem" }}>
          {evidencias.map(ev => (
            <div key={ev.id} style={{ display:"flex", gap:"0.75rem", marginBottom:"0.625rem", padding:"0.625rem", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r)" }}>
              <img src={`${API_BASE}${ev.foto_url}`} alt="Evidencia"
                style={{ width:56, height:56, objectFit:"cover", borderRadius:"var(--r)", flexShrink:0, background:"var(--bg)" }}
                onError={e => e.target.style.display="none"} />
              <div>
                <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--ink)", textTransform:"capitalize" }}>{ev.tipo_residuo}</p>
                <p style={{ fontSize:"0.75rem", color:"var(--ink-3)", marginTop:1 }}>Peso real: {ev.peso_kg} kg</p>
                <p style={{ fontSize:"0.8125rem", color:"var(--accent)", fontWeight:600, marginTop:2 }}>+{ev.eco_creditos} eco-créditos</p>
              </div>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"0.5rem 0", borderTop:"1px solid var(--border)" }}>
            <span className="label">Total a recibir</span>
            <span style={{ fontWeight:700, color:"var(--accent)", fontSize:"0.9375rem" }}>{evidencias.reduce((s,e) => s+e.eco_creditos, 0)} eco-créditos</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ fontSize:"0.8125rem", color:"var(--danger)", marginBottom:"0.5rem" }}>{error}</motion.p>}
      </AnimatePresence>

      <button ref={btnRef} onClick={handleConfirmar} disabled={loading || loadingEv || evidencias.length===0}
        className="btn btn-primary" style={{ width:"100%" }}>
        {loading ? "Confirmando…" : "Confirmar recolección"}
      </button>
    </div>
  );
}
