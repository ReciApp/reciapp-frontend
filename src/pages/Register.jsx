import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerCiudadano, registerReciclador } from "../api/auth";
import Particles from "../components/ui/Particles";

const FIELDS_BASE = [
  { name:"nombre",    label:"Nombre completo",            type:"text",     required:true  },
  { name:"correo",    label:"Correo electrónico",          type:"email",    required:true  },
  { name:"dni",       label:"DNI (8 dígitos)",             type:"text",     required:false, maxLength:8 },
  { name:"celular",   label:"Celular",                     type:"tel",      required:false },
  { name:"contrasena",label:"Contraseña (mínimo 8 car.)",  type:"password", required:true  },
  { name:"confirmar", label:"Confirmar contraseña",        type:"password", required:true  },
];
const FIELDS_REC = [
  { name:"zona_cobertura",         label:"Zona de cobertura",               type:"text", required:true },
  { name:"disponibilidad_horaria", label:"Disponibilidad (ej: manana, tarde)", type:"text", required:true },
];

const spring = { type:"spring", stiffness:300, damping:26 };

export default function Register({ tipo = "ciudadano" }) {
  const navigate = useNavigate();
  const isRec = tipo === "reciclador";
  const [form, setForm] = useState({ nombre:"", correo:"", dni:"", celular:"", contrasena:"", confirmar:"", zona_cobertura:"", disponibilidad_horaria:"" });
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (form.contrasena !== form.confirmar) { setError("Las contraseñas no coinciden."); return; }
    if (form.contrasena.length < 8)         { setError("Mínimo 8 caracteres."); return; }
    setLoading(true);
    try {
      const payload = { nombre:form.nombre, correo:form.correo, dni:form.dni||undefined, celular:form.celular||undefined, contrasena:form.contrasena,
        ...(isRec && { zona_cobertura:form.zona_cobertura, disponibilidad_horaria:form.disponibilidad_horaria }) };
      if (isRec) { await registerReciclador(payload); setSuccess("Solicitud enviada. Un administrador la revisará."); }
      else { await registerCiudadano(payload); setSuccess("¡Cuenta creada! Redirigiendo…"); setTimeout(() => navigate("/login"), 1800); }
    } catch (err) { setError(err.response?.data?.detail || "Error al registrar."); }
    finally { setLoading(false); }
  };

  const allFields = isRec ? [...FIELDS_BASE, ...FIELDS_REC] : FIELDS_BASE;
  const accentColor = isRec ? "#60a5fa" : "#a3e635";
  const accentDark  = isRec ? "rgba(96,165,250,.5)" : "rgba(132,204,22,.5)";

  const inputStyle = (name) => ({
    width:"100%", fontFamily:"var(--font-body)", fontSize:"0.9rem",
    background: focused===name ? "rgba(255,255,255,.13)" : "rgba(255,255,255,.07)",
    color:"white", border:`1.5px solid ${focused===name ? accentDark : "rgba(255,255,255,.12)"}`,
    borderRadius:"var(--radius-sm)", padding:"0.7rem 1rem", outline:"none", transition:"all .2s",
    boxShadow: focused===name ? `0 0 0 3px ${isRec?"rgba(96,165,250,.12)":"rgba(132,204,22,.12)"}` : "none",
  });

  return (
    <div style={{ minHeight:"100dvh", position:"relative", overflow:"hidden", background:"linear-gradient(160deg,#050f08 0%,#0d2015 45%,#080e0a 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}><Particles count={50} color="132,204,22" opacity={0.3} /></div>
      <div className="aurora-orb orb-1" style={{ position:"fixed", width:500, height:500, background:`radial-gradient(circle,rgba(132,204,22,.12) 0%,transparent 70%)`, top:"-15%", right:"-10%", filter:"blur(70px)", zIndex:0 }} />
      <div className="aurora-orb orb-2" style={{ position:"fixed", width:400, height:400, background:`radial-gradient(circle,${isRec?"rgba(96,165,250,.1)":"rgba(22,163,74,.1)"} 0%,transparent 70%)`, bottom:"-12%", left:"-8%", filter:"blur(70px)", zIndex:0 }} />

      <motion.div initial={{ opacity:0, y:40, scale:0.94 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ ...spring, delay:.1 }}
        style={{ position:"relative", zIndex:10, width:"100%", maxWidth:480, borderRadius:"var(--radius-lg)", background:"rgba(10,26,16,0.84)", backdropFilter:"blur(64px) saturate(200%)", WebkitBackdropFilter:"blur(64px) saturate(200%)", border:"1px solid rgba(255,255,255,.1)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.12), 0 48px 120px rgba(0,0,0,.6)", overflow:"hidden" }}>

        <div style={{ padding:"2rem 2rem 1.5rem", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(255,255,255,.03)" }}>
          <motion.div animate={{ rotate:[0,5,-5,0] }} transition={{ duration:6, repeat:Infinity, ease:"easeInOut" }}
            style={{ width:52, height:52, borderRadius:14, margin:"0 auto 1rem", background:`linear-gradient(135deg,${accentColor},${isRec?"#3b82f6":"#84cc16"})`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", boxShadow:`0 4px 20px ${accentDark}` }}>
            {isRec ? "🚲" : "♻"}
          </motion.div>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.375rem", letterSpacing:"-0.03em", color:"white" }}>
            {isRec ? "Registro de Reciclador" : "Crear cuenta"}
          </h1>
          <p style={{ color:"rgba(255,255,255,.35)", fontSize:"0.8rem", marginTop:6 }}>
            {isRec ? "Tu solicitud será revisada por el administrador" : "Únete a ReciApp como ciudadano"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"1.5rem 2rem 2rem" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
            {allFields.map((field, i) => (
              <motion.div key={field.name} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ ...spring, delay:0.2 + i*0.04 }}>
                <label style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.72rem", letterSpacing:"0.05em", textTransform:"uppercase", color:"rgba(255,255,255,.4)", display:"block", marginBottom:6 }}>{field.label}</label>
                <input type={field.type} name={field.name} required={field.required} maxLength={field.maxLength}
                  value={form[field.name]} onChange={handleChange}
                  onFocus={()=>setFocused(field.name)} onBlur={()=>setFocused(null)}
                  style={inputStyle(field.name)} />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {error && <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden", background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.25)", borderRadius:"var(--radius-sm)", padding:"0.625rem 1rem", color:"#fca5a5", fontSize:"0.8rem", marginTop:"1rem" }}>{error}</motion.div>}
            {success && <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} style={{ overflow:"hidden", background:"rgba(132,204,22,.12)", border:"1px solid rgba(132,204,22,.25)", borderRadius:"var(--radius-sm)", padding:"0.625rem 1rem", color:"#a3e635", fontSize:"0.8rem", marginTop:"1rem", fontFamily:"var(--font-display)", fontWeight:600 }}>✅ {success}</motion.div>}
          </AnimatePresence>

          <motion.button type="submit" disabled={loading || !!success} whileHover={loading||success?{}:{scale:1.03}} whileTap={loading||success?{}:{scale:.97}}
            style={{ width:"100%", marginTop:"1.5rem", padding:"0.75rem", fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.9375rem", background:`linear-gradient(135deg,${accentColor},${isRec?"#3b82f6":"#84cc16"})`, color:isRec?"white":"var(--forest)", border:"none", borderRadius:"var(--radius-pill)", cursor:"pointer", opacity:loading||success?0.5:1, boxShadow:`0 2px 12px ${accentDark}`, transition:"opacity .2s" }}>
            {loading ? <motion.span animate={{ opacity:[1,.4,1] }} transition={{ duration:.9, repeat:Infinity }}>Registrando…</motion.span> : isRec ? "Enviar solicitud →" : "Crear cuenta →"}
          </motion.button>

          <p style={{ marginTop:"1.25rem", textAlign:"center", fontSize:"0.8rem", color:"rgba(255,255,255,.3)" }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color:"#a3e635", fontWeight:600, textDecoration:"none" }}>Inicia sesión</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
