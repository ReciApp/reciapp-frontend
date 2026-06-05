import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subirEvidencia } from "../../api/evidencias";

export default function FormularioEvidencia({ solicitud, onEvidenciaSubida }) {
  const [pesoKg, setPesoKg]   = useState("");
  const [foto, setFoto]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [exito, setExito]     = useState(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef();

  const handleFoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file); setPreview(URL.createObjectURL(file)); setError("");
  };

  const handleSubmit = async () => {
    if (!foto)   { setError("Selecciona una fotografía"); return; }
    const peso = parseFloat(pesoKg);
    if (!pesoKg || isNaN(peso) || peso <= 0) { setError("Ingresa un peso mayor a 0 kg"); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("solicitud_id", solicitud.id);
      fd.append("peso_kg", peso);
      fd.append("foto", foto);
      const ev = await subirEvidencia(fd);
      setExito(ev);
      if (navigator.vibrate) navigator.vibrate([40, 20, 80]);
      onEvidenciaSubida?.(ev);
    } catch (e) { setError(e.response?.data?.detail || "Error al subir la evidencia"); }
    finally { setLoading(false); }
  };

  if (exito) return (
    <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
      transition={{ type:"spring", stiffness:300, damping:22 }}
      style={{ marginTop:"1rem", background:"rgba(132,204,22,.1)", border:"1px solid rgba(132,204,22,.25)", borderRadius:"var(--radius)", padding:"1.25rem", textAlign:"center" }}>
      <p style={{ fontSize:"2rem", marginBottom:6 }}>📸✅</p>
      <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.9rem", color:"#a3e635" }}>Evidencia registrada</p>
      <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.5)", marginTop:4 }}>
        {exito.peso_kg} kg · <span style={{ color:"#a3e635", fontWeight:600 }}>+{exito.eco_creditos} eco-créditos</span>
      </p>
      <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.3)", marginTop:4 }}>Esperando confirmación del ciudadano…</p>
    </motion.div>
  );

  return (
    <div style={{ marginTop:"1rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,.08)" }}>
      <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.875rem", color:"rgba(255,255,255,.7)", marginBottom:"0.875rem" }}>
        📸 Registrar evidencia
      </p>

      {/* Photo picker */}
      <motion.div onClick={() => inputRef.current?.click()}
        whileHover={{ scale:1.01 }} whileTap={{ scale:.99 }}
        style={{
          cursor:"pointer", borderRadius:"var(--radius-sm)", overflow:"hidden",
          border:`2px dashed ${preview ? "rgba(132,204,22,.5)" : "rgba(255,255,255,.15)"}`,
          background: preview ? "rgba(132,204,22,.06)" : "rgba(255,255,255,.04)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          minHeight:110, marginBottom:"0.75rem", transition:"all .2s",
        }}>
        {preview
          ? <img src={preview} alt="preview" style={{ maxHeight:120, objectFit:"cover", borderRadius:6 }} />
          : <>
              <span style={{ fontSize:"2rem", marginBottom:6 }}>📷</span>
              <p style={{ fontFamily:"var(--font-display)", fontSize:"0.78rem", color:"rgba(255,255,255,.45)", fontWeight:600 }}>Toca para tomar foto</p>
              <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,.25)", marginTop:2 }}>JPG · PNG · WEBP</p>
            </>
        }
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display:"none" }} onChange={handleFoto} capture="environment" />
      </motion.div>

      {/* Weight input */}
      <div style={{ position:"relative", marginBottom:"0.625rem" }}>
        <input type="number" min="0.1" step="0.1" value={pesoKg}
          onChange={e => { setPesoKg(e.target.value); setError(""); }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Peso real recolectado"
          style={{
            width:"100%", fontFamily:"var(--font-body)", fontSize:"0.9rem",
            background: focused ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.07)",
            color:"white",
            border:`1.5px solid ${focused ? "rgba(132,204,22,.5)" : "rgba(255,255,255,.12)"}`,
            borderRadius:"var(--radius-sm)", padding:"0.7rem 2.5rem 0.7rem 1rem",
            outline:"none", transition:"all .2s",
            boxShadow: focused ? "0 0 0 3px rgba(132,204,22,.1)" : "none",
          }} />
        <span style={{ position:"absolute", right:"0.875rem", top:"50%", transform:"translateY(-50%)", fontSize:"0.8rem", color:"rgba(255,255,255,.35)", fontFamily:"var(--font-display)", fontWeight:600 }}>kg</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            style={{ color:"#fca5a5", fontSize:"0.78rem", overflow:"hidden", marginBottom:"0.5rem" }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button onClick={handleSubmit} disabled={loading}
        whileHover={loading ? {} : { scale:1.02 }} whileTap={loading ? {} : { scale:.98 }}
        className="btn-lime" style={{ width:"100%", fontSize:"0.875rem", opacity:loading?0.6:1 }}>
        {loading
          ? <motion.span animate={{ opacity:[1,.4,1] }} transition={{ duration:.8, repeat:Infinity }}>Subiendo…</motion.span>
          : "Enviar evidencia →"}
      </motion.button>
    </div>
  );
}
