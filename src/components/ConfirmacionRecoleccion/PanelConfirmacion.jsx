  import { useState, useEffect, useRef } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import { obtenerEvidencias } from "../../api/evidencias";
  import { confirmarSolicitud } from "../../api/solicitudes";
  import { useConfetti } from "../ui/useConfetti";

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  export default function PanelConfirmacion({ solicitud, onConfirmada }) {
    const [evidencias, setEvidencias]   = useState([]);
    const [loadingEv, setLoadingEv]     = useState(true);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");
    const [confirmado, setConfirmado]   = useState(false);
    const [ecoGanados, setEcoGanados]   = useState(null);
    const btnRef = useRef(null);
    const { burst } = useConfetti();

    useEffect(() => {
      obtenerEvidencias(solicitud.id)
        .then(setEvidencias).catch(() => {}).finally(() => setLoadingEv(false));
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

    if (confirmado) {
      return ( 
        <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
          transition={{ type:"spring", stiffness:300, damping:22 }}
          style={{ marginTop:"0.875rem", background:"rgba(132,204,22,.1)", border:"1px solid rgba(132,204,22,.3)", borderRadius:"var(--radius)", padding:"1.25rem", 
  textAlign:"center" }}>
          <p style={{ fontSize:"2rem", marginBottom:8 }}>🎉</p>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"0.9rem", color:"#a3e635" }}>¡Recolección confirmada!</p>
          <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,.5)", marginTop:4 }}>
            Has ganado <span style={{ color:"#a3e635", fontWeight:700 }}>{ecoGanados} eco-créditos</span> en tu wallet.
          </p>
        </motion.div> 
      );
    }

    return (
      <div style={{ marginTop:"0.875rem", background:"rgba(251,146,60,.07)", border:"1px solid rgba(251,146,60,.25)", borderRadius:"var(--radius)", padding:"1rem" }}>
        <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.8rem", color:"rgba(251,146,60,.9)", marginBottom:"0.875rem" }}>
          📷 Evidencia registrada — confírmala para recibir tus eco-créditos
        </p>
  
        {loadingEv ? (
          <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,.3)" }}>Cargando evidencia…</p>
        ) : evidencias.length === 0 ? (
          <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,.3)" }}>Sin evidencias disponibles.</p>
        ) : (
          <>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.625rem", marginBottom:"0.875rem" }}>
              {evidencias.map((ev) => (
                <motion.div key={ev.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                  style={{ display:"flex", gap:"0.75rem", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)", borderRadius:"var(--radius-sm)", 
  padding:"0.75rem", alignItems:"center" }}>
                  <img src={`${API_BASE}${ev.foto_url}`} alt="Evidencia"
                    style={{ width:64, height:64, objectFit:"cover", borderRadius:8, flexShrink:0, background:"rgba(255,255,255,.05)" }}
                    onError={e => e.target.style.display="none"} />
                  <div>
                    <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.875rem", color:"white", textTransform:"capitalize" }}>{ev.tipo_residuo}</p>
                    <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.4)", marginTop:2 }}>Peso real: {ev.peso_kg} kg</p>
                    <p style={{ fontSize:"0.8rem", color:"#a3e635", fontWeight:700, marginTop:3 }}>+{ev.eco_creditos} eco-créditos</p>
                  </div>
                </motion.div>   
              ))}

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(132,204,22,.08)", border:"1px solid rgba(132,204,22,.2)", 
  borderRadius:"var(--radius-sm)", padding:"0.625rem 0.875rem" }}>
                <span style={{ fontSize:"0.8rem", color:"rgba(255,255,255,.5)" }}>Total a recibir</span>
                <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem", color:"#a3e635" }}>
                  +{evidencias.reduce((s, e) => s + e.eco_creditos, 0)} eco-créditos 🌿
                </span>
              </div>  
            </div>
          </>
        )}

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
              style={{ color:"#fca5a5", fontSize:"0.78rem", overflow:"hidden", marginBottom:"0.5rem" }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button ref={btnRef} onClick={handleConfirmar}
          disabled={loading || loadingEv || evidencias.length === 0}
          whileHover={loading ? {} : { scale:1.02 }} whileTap={loading ? {} : { scale:.98 }}
          style={{
            width:"100%", padding:"0.7rem",
            fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.875rem",
            background:"linear-gradient(135deg,rgba(251,146,60,.8),rgba(234,88,12,.9))",
            color:"white", border:"none", borderRadius:"var(--radius-sm)",
            cursor: loading || loadingEv || evidencias.length===0 ? "not-allowed" : "pointer",
            opacity: loading || loadingEv || evidencias.length===0 ? 0.5 : 1,
            boxShadow:"0 2px 12px rgba(251,146,60,.3)", transition:"opacity .2s",
          }}>
          {loading
            ? <motion.span animate={{ opacity:[1,.4,1] }} transition={{ duration:.8, repeat:Infinity }}>Confirmando…</motion.span>
            : "✅ Confirmar recolección"}
        </motion.button>
      </div>
    );
  }
