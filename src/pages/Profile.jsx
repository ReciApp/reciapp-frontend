import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateMe } from "../api/users";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Particles from "../components/ui/Particles";

const ROL_LABEL = { ciudadano:"Ciudadano", reciclador:"Reciclador", admin:"Administrador" };
const ROL_COLOR = { ciudadano:"#a3e635", reciclador:"#60a5fa", admin:"#f59e0b" };

export default function Profile() {
  const { user, login: setUser } = useAuth();
  const [form, setForm] = useState({ nombre:"", celular:"", zona_cobertura:"", disponibilidad_horaria:"" });
  const [msg, setMsg]   = useState({ type:"", text:"" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    if (user) setForm({ nombre:user.nombre||"", celular:user.celular||"", zona_cobertura:user.zona_cobertura||"", disponibilidad_horaria:user.disponibilidad_horaria||"" });
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg({ type:"", text:"" }); setLoading(true);
    try { const updated = await updateMe(form); setUser(updated); setMsg({ type:"success", text:"Perfil actualizado correctamente." }); }
    catch (err) { setMsg({ type:"error", text:err.response?.data?.detail || "Error al actualizar." }); }
    finally { setLoading(false); }
  };

  const inputDark = (name) => ({
    width:"100%", fontFamily:"var(--font-body)", fontSize:"0.9375rem",
    background: focused===name ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.07)",
    color:"white", border:`1.5px solid ${focused===name ? "rgba(132,204,22,.5)" : "rgba(255,255,255,.12)"}`,
    borderRadius:"var(--radius-sm)", padding:"0.75rem 1rem", outline:"none", transition:"all .2s",
    boxShadow: focused===name ? "0 0 0 3px rgba(132,204,22,.1)" : "none",
  });

  return (
    <div style={{ minHeight:"100dvh", background:"#0b1f12", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}><Particles count={30} color="132,204,22" opacity={0.2} /></div>
      <div className="aurora-orb orb-1" style={{ position:"fixed", width:450, height:450, background:"radial-gradient(circle,rgba(132,204,22,.1) 0%,transparent 70%)", top:"-8%", right:"-8%", zIndex:0, filter:"blur(60px)" }} />
      <div className="aurora-orb orb-3" style={{ position:"fixed", width:350, height:350, background:"radial-gradient(circle,rgba(96,165,250,.08) 0%,transparent 70%)", bottom:"10%", left:"-5%", zIndex:0, filter:"blur(60px)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
        <Navbar />
        <main style={{ maxWidth:520, margin:"0 auto", padding:"2.5rem 1.25rem 5rem" }}>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ type:"spring", stiffness:260, damping:22 }} style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", margin:"0 auto 1rem", background:`linear-gradient(135deg,${ROL_COLOR[user?.rol]||"#a3e635"},rgba(255,255,255,.2))`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:800, fontSize:"2rem", color:"#14532d", boxShadow:`0 0 0 4px rgba(255,255,255,.08),0 0 32px ${ROL_COLOR[user?.rol]||"#a3e635"}40`, border:"2px solid rgba(255,255,255,.15)" }}>
              {user?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.375rem", color:"white", letterSpacing:"-0.025em" }}>{user?.nombre}</h1>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:6 }}>
              <span className="badge badge-completada" style={{ background:`${ROL_COLOR[user?.rol]||"#a3e635"}20`, color:ROL_COLOR[user?.rol]||"#a3e635", border:`1px solid ${ROL_COLOR[user?.rol]||"#a3e635"}40` }}>{ROL_LABEL[user?.rol]}</span>
              <span style={{ color:"rgba(255,255,255,.3)", fontSize:"0.8rem" }}>{user?.correo}</span>
            </div>
            {user?.eco_creditos !== undefined && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(132,204,22,.1)", border:"1px solid rgba(132,204,22,.25)", borderRadius:"var(--radius-pill)", padding:"6px 16px", marginTop:"1rem" }}>
                <span>🌿</span>
                <span style={{ fontFamily:"var(--font-display)", fontWeight:800, color:"#a3e635", fontSize:"1rem" }}>{user.eco_creditos}</span>
                <span style={{ color:"rgba(255,255,255,.4)", fontSize:"0.8rem" }}>eco-créditos</span>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }}
            style={{ background:"rgba(255,255,255,.06)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"var(--radius-lg)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.1), 0 24px 60px rgba(0,0,0,.3)", overflow:"hidden" }}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.9rem", color:"rgba(255,255,255,.7)" }}>Editar información</p>
            </div>
            <form onSubmit={handleSubmit} style={{ padding:"1.5rem" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"1.125rem" }}>
                {[{name:"nombre",label:"Nombre completo",type:"text",req:true},{name:"celular",label:"Celular",type:"tel",ph:"+51 999 999 999"}].map(f => (
                  <div key={f.name}>
                    <label style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.72rem", letterSpacing:"0.05em", textTransform:"uppercase", color:"rgba(255,255,255,.4)", display:"block", marginBottom:6 }}>{f.label}</label>
                    <input type={f.type||"text"} name={f.name} required={f.req} value={form[f.name]} onChange={handleChange} placeholder={f.ph}
                      onFocus={()=>setFocused(f.name)} onBlur={()=>setFocused(null)} style={inputDark(f.name)} />
                  </div>
                ))}
                {user?.rol === "reciclador" && (
                  <>
                    {[{name:"zona_cobertura",label:"Zona de cobertura",ph:"Ej: Miraflores, San Isidro"},{name:"disponibilidad_horaria",label:"Disponibilidad horaria",ph:"Ej: manana, tarde"}].map(f => (
                      <div key={f.name}>
                        <label style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.72rem", letterSpacing:"0.05em", textTransform:"uppercase", color:"rgba(255,255,255,.4)", display:"block", marginBottom:6 }}>{f.label}</label>
                        <input type="text" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.ph}
                          onFocus={()=>setFocused(f.name)} onBlur={()=>setFocused(null)} style={inputDark(f.name)} />
                      </div>
                    ))}
                  </>
                )}
              </div>
              <AnimatePresence>
                {msg.text && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                    style={{ marginTop:"1rem", background:msg.type==="success"?"rgba(132,204,22,.1)":"rgba(239,68,68,.1)", border:`1px solid ${msg.type==="success"?"rgba(132,204,22,.25)":"rgba(239,68,68,.25)"}`, borderRadius:"var(--radius-sm)", padding:"0.625rem 1rem", color:msg.type==="success"?"#a3e635":"#fca5a5", fontSize:"0.8125rem", overflow:"hidden" }}>
                    {msg.text}
                  </motion.div>
                )}
              </AnimatePresence>
              <button type="submit" disabled={loading} className="btn-lime" style={{ width:"100%", marginTop:"1.5rem", fontSize:"0.9375rem" }}>
                {loading ? <motion.span animate={{ opacity:[1,.4,1] }} transition={{ duration:.9, repeat:Infinity }}>Guardando…</motion.span> : "Guardar cambios"}
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
