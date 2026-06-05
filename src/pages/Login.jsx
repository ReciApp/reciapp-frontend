import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../api/auth";
import { getMe } from "../api/users";
import { useAuth } from "../context/AuthContext";
import Particles from "../components/ui/Particles";
import MagneticButton from "../components/ui/MagneticButton";
import LiquidGlass from "../components/ui/LiquidGlass";

const ROLE_REDIRECT = { ciudadano:"/ciudadano", reciclador:"/reciclador", admin:"/admin" };
const spring = { type:"spring", stiffness:300, damping:28 };

export default function Login() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const [form, setForm]   = useState({ correo:"", contrasena:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await login(form.correo, form.contrasena);
      const user = await getMe();
      setUser(user);
      navigate(ROLE_REDIRECT[user.rol] || "/perfil", { replace:true });
    } catch (err) { setError(err.response?.data?.detail || "Credenciales incorrectas."); }
    finally { setLoading(false); }
  };

  const inputStyle = (field) => ({
    width:"100%", fontFamily:"var(--font-body)", fontSize:"0.9375rem",
    background: focused===field ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.07)",
    color:"white", border:`1.5px solid ${focused===field ? "rgba(132,204,22,.55)" : "rgba(255,255,255,.12)"}`,
    borderRadius:"var(--radius-sm)", padding:"0.8rem 1rem", outline:"none", transition:"all .25s",
    boxShadow: focused===field ? "0 0 0 3px rgba(132,204,22,.12)" : "none",
  });

  return (
    <div style={{ minHeight:"100dvh", position:"relative", overflow:"hidden", background:"linear-gradient(160deg,#050f08 0%,#0d2015 45%,#0a1a10 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}>
      <Particles count={70} color="132,204,22" opacity={0.5} />
      <div className="aurora-orb orb-1" style={{ position:"absolute", width:600, height:600, background:"radial-gradient(circle,rgba(132,204,22,.14) 0%,transparent 70%)", top:"-15%", right:"-10%", filter:"blur(70px)", zIndex:0 }} />
      <div className="aurora-orb orb-2" style={{ position:"absolute", width:500, height:500, background:"radial-gradient(circle,rgba(22,163,74,.1) 0%,transparent 70%)", bottom:"-12%", left:"-8%", filter:"blur(70px)", zIndex:0 }} />

      <motion.div initial={{ opacity:0, y:40, scale:0.94 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ ...spring, delay:.1 }} style={{ position:"relative", zIndex:10, width:"100%", maxWidth:420 }}>
        <LiquidGlass borderRadius={24} blur={48} ior={1.62} tint="rgba(8,22,12,0.78)" specular={true} style={{ width:"100%", boxShadow:"0 48px 120px rgba(0,0,0,.6)" }}>

          <div style={{ padding:"2.25rem 2rem 1.75rem", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.03)" }}>
            <div style={{ width:60, height:60, borderRadius:18, background:"linear-gradient(135deg,#a3e635,#84cc16)", boxShadow:"0 4px 20px rgba(132,204,22,.6),inset 0 1px 0 rgba(255,255,255,.4)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:"1.75rem", marginBottom:"1rem", animation:"glow-pulse 3s ease-in-out infinite" }}>♻</div>
            <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.625rem", letterSpacing:"-0.03em", color:"white" }}>
              Reci<span style={{ color:"#a3e635" }}>App</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,.55)", fontSize:"0.875rem", marginTop:6 }}>Reciclaje inteligente en Lima</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding:"1.75rem 2rem 2rem" }}>
            {["correo","contrasena"].map((field, i) => (
              <motion.div key={field} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ ...spring, delay:0.35 + i*0.08 }} style={{ marginBottom:"1rem" }}>
                <label style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.72rem", letterSpacing:"0.05em", textTransform:"uppercase", color:"rgba(255,255,255,.4)", display:"block", marginBottom:7 }}>
                  {field === "correo" ? "Correo electrónico" : "Contraseña"}
                </label>
                <input type={field==="contrasena"?"password":"email"} name={field} required value={form[field]} onChange={handleChange}
                  onFocus={()=>setFocused(field)} onBlur={()=>setFocused(null)}
                  placeholder={field==="correo"?"tu@correo.com":"••••••••"} style={inputStyle(field)} />
              </motion.div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                  style={{ overflow:"hidden", background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.25)", borderRadius:"var(--radius-sm)", padding:"0.625rem 1rem", color:"#fca5a5", fontSize:"0.8rem", marginBottom:"1rem" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ ...spring, delay:.55 }}>
              <MagneticButton type="submit" disabled={loading} className="btn-lime" style={{ width:"100%", fontSize:"0.9375rem", marginTop:4 }}>
                {loading ? <motion.span animate={{ opacity:[1,.4,1] }} transition={{ duration:1, repeat:Infinity }}>Ingresando…</motion.span> : "Iniciar sesión →"}
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.7 }} style={{ marginTop:"1.5rem", textAlign:"center", fontSize:"0.8rem", color:"rgba(255,255,255,.35)" }}>
              <p>¿Sin cuenta? <Link to="/register" style={{ color:"#a3e635", fontWeight:600, textDecoration:"none" }}>Regístrate como ciudadano</Link></p>
              <p style={{ marginTop:8 }}>¿Eres reciclador? <Link to="/register/reciclador" style={{ color:"#86efac", fontWeight:600, textDecoration:"none" }}>Solicita tu registro</Link></p>
            </motion.div>
          </form>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}
