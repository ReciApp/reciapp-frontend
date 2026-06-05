import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROL_HOME = { ciudadano:"/ciudadano", reciclador:"/reciclador", admin:"/admin" };
const ROL_COLOR = { ciudadano:"#a3e635", reciclador:"#60a5fa", admin:"#f59e0b" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login", { replace:true }); };

  return (
    <nav className="glass-dark" style={{ position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(255,255,255,0.1)", borderRadius:0 }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 1.25rem", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link to={user ? (ROL_HOME[user.rol]||"/") : "/"} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#a3e635,#84cc16)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:"0 2px 8px rgba(132,204,22,.5),inset 0 1px 0 rgba(255,255,255,.4)", animation:"glow-pulse 3s ease-in-out infinite" }}>♻</div>
          <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.05rem", letterSpacing:"-0.03em", color:"white" }}>
            Reci<span style={{ color:"#a3e635" }}>App</span>
          </span>
        </Link>
        {user && (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Link to="/perfil" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${ROL_COLOR[user.rol]||"#a3e635"},rgba(255,255,255,.2))`, border:"1.5px solid rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.8rem", color:"var(--forest)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.4)" }}>
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontFamily:"var(--font-display)", fontWeight:500, fontSize:"0.8125rem", color:"rgba(255,255,255,.85)" }}>{user.nombre.split(" ")[0]}</span>
            </Link>
            <button onClick={handleLogout} className="glass" style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.75rem", color:"rgba(255,255,255,.7)", border:"1px solid rgba(255,255,255,.18)", borderRadius:"var(--radius-pill)", padding:"5px 14px", cursor:"pointer", background:"rgba(255,255,255,.08)", backdropFilter:"blur(20px)", transition:"all .2s" }}
              onMouseEnter={e=>{e.target.style.color="white";e.target.style.background="rgba(255,255,255,.16)";}}
              onMouseLeave={e=>{e.target.style.color="rgba(255,255,255,.7)";e.target.style.background="rgba(255,255,255,.08)";}}>
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
