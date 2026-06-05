import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subirEvidencia } from "../../api/evidencias";

export default function FormularioEvidencia({ solicitud, onEvidenciaSubida }) {
  const [pesoKg, setPesoKg] = useState("");
  const [foto, setFoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [exito, setExito]   = useState(null);
  const inputRef = useRef();

  const handleFoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file); setPreview(URL.createObjectURL(file)); setError("");
  };

  const handleSubmit = async () => {
    if (!foto) { setError("Selecciona una fotografía"); return; }
    const peso = parseFloat(pesoKg);
    if (!pesoKg || isNaN(peso) || peso <= 0) { setError("Ingresa un peso mayor a 0 kg"); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("solicitud_id", solicitud.id);
      fd.append("peso_kg", peso);
      fd.append("foto", foto);
      const ev = await subirEvidencia(fd);
      setExito(ev); if (navigator.vibrate) navigator.vibrate([40,20,80]); onEvidenciaSubida?.(ev);
    } catch (e) { setError(e.response?.data?.detail || "Error al subir"); }
    finally { setLoading(false); }
  };

  if (exito) return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      style={{ marginTop:"1rem", padding:"0.875rem", background:"var(--accent-lt)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", borderLeft:"3px solid var(--accent)" }}>
      <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--accent)" }}>Evidencia registrada</p>
      <p style={{ fontSize:"0.8125rem", color:"var(--ink-2)", marginTop:4 }}>{exito.peso_kg} kg · {exito.eco_creditos} eco-créditos calculados</p>
      <p style={{ fontSize:"0.75rem", color:"var(--ink-3)", marginTop:2 }}>Esperando confirmación del ciudadano…</p>
    </motion.div>
  );

  return (
    <div style={{ marginTop:"1rem", paddingTop:"1rem", borderTop:"1px solid var(--border)" }}>
      <p className="label" style={{ marginBottom:"0.875rem" }}>Registrar evidencia</p>

      {/* Photo */}
      <div onClick={() => inputRef.current?.click()}
        style={{ cursor:"pointer", border:`1px dashed ${preview ? "var(--accent)" : "var(--border-2)"}`, borderRadius:"var(--r-md)", background: preview ? "var(--accent-lt)" : "var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:100, marginBottom:"0.75rem" }}>
        {preview
          ? <img src={preview} alt="preview" style={{ maxHeight:100, objectFit:"cover", borderRadius:4 }} />
          : <><p style={{ fontSize:"0.8125rem", color:"var(--ink-3)" }}>Toca para seleccionar foto</p><p style={{ fontSize:"0.75rem", color:"var(--ink-3)" }}>JPG · PNG · WEBP</p></>
        }
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }} onChange={handleFoto} capture="environment" />
      </div>

      {/* Weight */}
      <div style={{ position:"relative", marginBottom:"0.625rem" }}>
        <input type="number" min="0.1" step="0.1" value={pesoKg}
          onChange={e => { setPesoKg(e.target.value); setError(""); }}
          placeholder="Peso real recolectado"
          className="field" style={{ paddingRight:"2.5rem" }}
        />
        <span style={{ position:"absolute", right:"0.875rem", top:"50%", transform:"translateY(-50%)", fontSize:"0.8125rem", color:"var(--ink-3)", fontWeight:500 }}>kg</span>
      </div>

      <AnimatePresence>
        {error && <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ fontSize:"0.8125rem", color:"var(--danger)", marginBottom:"0.5rem" }}>{error}</motion.p>}
      </AnimatePresence>

      <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ width:"100%" }}>
        {loading ? "Subiendo…" : "Enviar evidencia"}
      </button>
    </div>
  );
}
