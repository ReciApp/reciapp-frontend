import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import NuevaSolicitudModal from "../components/NuevaSolicitud/NuevaSolicitudModal";
import Particles from "../components/ui/Particles";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import LiquidGlass from "../components/ui/LiquidGlass";

const ACTIONS = [
  { modal:true,  icon:"🗓", title:"Solicitar recolección", desc:"Programa un retiro ahora",    border:"rgba(132,204,22,.3)", orb:"rgba(132,204,22,.2)" },
  { to:"/ciudadano/solicitudes", icon:"📋", title:"Mis solicitudes", desc:"Rastrea tus recolecciones", border:"rgba(96,165,250,.3)",  orb:"rgba(96,165,250,.18)" },
  { disabled:true, icon:"🌿", title:"Eco-créditos", desc:"Próximamente", border:"rgba(255,255,255,.08)", orb:"rgba(255,255,255,.04)" },
  { to:"/perfil", icon:"👤", title:"Mi perfil", desc:"Datos y configuración", border:"rgba(163,230,53,.25)", orb:"rgba(163,230,53,.14)" },
];

const containerVariants = { hidden:{}, show:{ transition:{ staggerChildren:0.09 } } };
const cardVariants = { hidden:{ opacity:0, y:28, scale:0.94 }, show:{ opacity:1, y:0, scale:1, transition:{ type:"spring", stiffness:280, damping:24 } } };

export default function CitizenHome() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ minHeight:"100dvh", background:"linear-gradient(160deg,#060e09 0%,#0d2015 50%,#080e0a 100%)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}><Particles count={50} color="132,204,22" opacity={0.35} /></div>
      <div className="aurora-orb orb-1" style={{ position:"fixed", width:700, height:700, background:"radial-gradient(circle,rgba(132,204,22,.1) 0%,transparent 70%)", top:"-20%", right:"-15%", filter:"blur(80px)", zIndex:0 }} />
      <div className="aurora-orb orb-2" style={{ position:"fixed", width:600, height:600, background:"radial-gradient(circle,rgba(22,163,74,.08) 0%,transparent 70%)", bottom:"-15%", left:"-12%", filter:"blur(80px)", zIndex:0 }} />
      <div style={{ position:"relative", zIndex:10 }}>
        <Navbar />
        <div style={{ maxWidth:680, margin:"0 auto", padding:"2.5rem 1.25rem 5rem" }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ type:"spring", stiffness:240, damping:22, delay:.1 }} style={{ marginBottom:"2.5rem" }}>
            <div className="float-badge" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(132,204,22,.1)", border:"1px solid rgba(132,204,22,.22)", borderRadius:"var(--radius-pill)", padding:"5px 14px", marginBottom:"1rem" }}>
              <div className="pulse-dot" />
              <span style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.72rem", color:"#a3e635", letterSpacing:"0.05em", textTransform:"uppercase" }}>Lima · Reciclaje activo</span>
            </div>
            <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"clamp(2rem,6vw,3.25rem)", letterSpacing:"-0.04em", lineHeight:1.1, color:"white" }}>
              Hola, <span className="text-shimmer">{user?.nombre?.split(" ")[0]}</span> 👋
            </h1>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:"1rem", marginTop:"0.5rem" }}>¿Qué deseas reciclar hoy?</p>
            {user?.eco_creditos !== undefined && (
              <motion.div initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:"spring", stiffness:320, damping:22, delay:.35 }}
                className="glass" style={{ display:"inline-flex", alignItems:"center", gap:10, borderRadius:"var(--radius-pill)", padding:"8px 20px", marginTop:"1.25rem" }}>
                <span style={{ fontSize:"1.1rem" }}>🌿</span>
                <AnimatedCounter value={user.eco_creditos} decimals={1} style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.15rem", color:"#a3e635" }} />
                <span style={{ color:"rgba(255,255,255,.45)", fontSize:"0.8rem" }}>eco-créditos</span>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
            {ACTIONS.map((a, i) => {
              const inner = (
                <motion.div variants={cardVariants}
                  whileHover={a.disabled?{}:{y:-6,scale:1.03,transition:{type:"spring",stiffness:400,damping:20}}}
                  whileTap={a.disabled?{}:{scale:.97}}
                  style={{ opacity:a.disabled?.4:1 }}>
                  <LiquidGlass borderRadius={16} blur={36} ior={1.5} tint="rgba(255,255,255,0.06)" specular={!a.disabled}
                    style={{ padding:"1.5rem", border:`1px solid ${a.border}`, cursor:a.disabled?"default":"pointer", position:"relative" }}>
                    <div style={{ position:"absolute", top:-24, right:-24, width:100, height:100, borderRadius:"50%", background:a.orb, filter:"blur(24px)", pointerEvents:"none" }} />
                    <motion.span animate={{ rotate:[0,8,-8,0] }} transition={{ duration:5+i, repeat:Infinity, ease:"easeInOut", delay:i*0.4 }} style={{ fontSize:"2rem", display:"block", marginBottom:"0.875rem" }}>{a.icon}</motion.span>
                    <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.9375rem", color:"white", letterSpacing:"-0.01em" }}>{a.title}</p>
                    <p style={{ color:"rgba(255,255,255,.4)", fontSize:"0.78rem", marginTop:4 }}>{a.desc}</p>
                  </LiquidGlass>
                </motion.div>
              );
              if (a.modal) return <button key={i} onClick={()=>setShowModal(true)} style={{ all:"unset", cursor:"pointer", display:"block" }}>{inner}</button>;
              if (a.disabled) return <div key={i}>{inner}</div>;
              return <Link key={i} to={a.to} style={{ textDecoration:"none" }}>{inner}</Link>;
            })}
          </motion.div>
        </div>
      </div>
      {showModal && <NuevaSolicitudModal onClose={()=>setShowModal(false)} onCreada={()=>{}} />}
    </div>
  );
}
