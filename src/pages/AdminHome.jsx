import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, Avatar } from "../components/ui/Primitivos";
import { MAT, ESTADOS, ACTIVIDAD } from "../lib/datos";
import { useAuth } from "../context/AuthContext";
import { getPendingRecicladores, validarReciclador } from "../api/users";

function Kpi({ icon, color, value, label, delta }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "20px 22px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ width: 44, height: 44, borderRadius: 13, background: color, display: "grid", placeItems: "center" }}><Icon name={icon} size={22} stroke="#fff" /></span>
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 38, color: "var(--ink)", lineHeight: 1, marginTop: 14 }}>{value}</div>
      <div style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>{label}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, color: "var(--green-deep)" }}><Icon name="arrowRight" size={13} stroke="var(--green-deep)" style={{ transform: "rotate(-45deg)" }} />{delta}</div>
    </div>
  );
}

function RecicladorPendiente({ r, onResolve }) {
  const [estado, setEstado] = useState("idle");
  const nombre = r.nombre || r.name || r.correo || "Reciclador";
  return (
    <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 13, minWidth: 0 }}>
          <Avatar name={nombre} size={48} bg="var(--orange)" />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)" }}>{nombre}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 9px" }}>#{r.id}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginTop: 8, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>
              {r.correo && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="shield" size={14} stroke="var(--ink-soft)" />{r.correo}</span>}
              {r.celular && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="phone" size={14} stroke="var(--ink-soft)" />{r.celular}</span>}
              {r.zona_cobertura && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="pin" size={14} stroke="var(--ink-soft)" />{r.zona_cobertura}</span>}
              {r.disponibilidad_horaria && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="clock" size={14} stroke="var(--ink-soft)" />{r.disponibilidad_horaria}</span>}
            </div>
          </div>
        </div>
      </div>

      {estado === "idle" ? (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={() => { setEstado("aprobado"); setTimeout(() => onResolve(r.id, "aprobado"), 700); }}
            style={{ flex: 1, fontFamily: "var(--serif)", fontSize: 17, color: "#fff", background: "var(--green)", border: "none", borderRadius: 999, padding: 11, cursor: "pointer", boxShadow: "0 4px 0 var(--green-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = "0 2px 0 var(--green-deep)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 var(--green-deep)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 var(--green-deep)"; }}>
            <Icon name="check" size={19} stroke="#fff" />Aprobar
          </button>
          <button type="button" onClick={() => { setEstado("rechazado"); setTimeout(() => onResolve(r.id, "rechazado"), 700); }}
            style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--pink)", background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 999, padding: "11px 22px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Icon name="x" size={17} stroke="var(--pink)" />Rechazar
          </button>
        </div>
      ) : (
        <div className="screen" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, color: estado === "aprobado" ? "var(--green-deep)" : "var(--pink)" }}>
          <Icon name={estado === "aprobado" ? "check" : "x"} size={17} stroke={estado === "aprobado" ? "var(--green-deep)" : "var(--pink)"} />
          {estado === "aprobado" ? "Reciclador aprobado." : "Solicitud rechazada."}
        </div>
      )}
    </div>
  );
}

const DISTRIBUCION = [["plastico", 34], ["papel", 26], ["carton", 18], ["vidrio", 12], ["metal", 7], ["organico", 3]];

export default function AdminHome() {
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "admin";

  const [pend, setPend] = useState([]);

  useEffect(() => {
    getPendingRecicladores()
      .then((data) => setPend(data || []))
      .catch(() => setPend([]));
  }, []);

  const resolver = async (id, accion) => {
    try { await validarReciclador(id, accion); } catch {}
    setPend((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="admin" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 1120, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead eyebrow="Panel administrador" title={<span>Centro de <span style={{ color: "var(--green)", fontStyle: "italic" }}>control</span></span>} sub="Métricas globales y validación de recicladores." />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 26 }}>
          <Kpi icon="user" color="var(--green)" value="1,284" label="Ciudadanos" delta="+48 esta semana" />
          <Kpi icon="truck" color="var(--orange)" value="96" label="Recicladores" delta="+6 esta semana" />
          <Kpi icon="recycle" color="var(--blue)" value="3,712" label="Recolecciones" delta="+214 este mes" />
          <Kpi icon="weight" color="var(--green-deep)" value="8.4 t" label="Material reciclado" delta="+0.6 t este mes" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 22, alignItems: "start" }} className="admin-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: 0 }}>Recicladores por validar</h2>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "#fff", background: "var(--orange)", borderRadius: 999, padding: "2px 11px" }}>{pend.length}</span>
            </div>
            {pend.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, color: "var(--ink-soft)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Icon name="check" size={26} stroke="var(--green)" /></div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 15 }}>No hay solicitudes de validación pendientes.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {pend.map((r) => <RecicladorPendiente key={r.id} r={r} onResolve={resolver} />)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 14px" }}>Actividad reciente</h2>
              <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "8px 18px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
                {ACTIVIDAD.map((a, i) => {
                  const e = ESTADOS[a.estado];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < ACTIVIDAD.length - 1 ? "1px solid var(--line)" : "none" }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: e.color, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={e.icon} size={17} stroke={e.fg} /></span>
                      <span style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)" }}>{a.txt}</span>
                      <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{a.t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 14px" }}>Material por tipo</h2>
              <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)", display: "flex", flexDirection: "column", gap: 12 }}>
                {DISTRIBUCION.map(([t, pct]) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 70, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{MAT[t]?.label}</span>
                    <span style={{ flex: 1, height: 10, borderRadius: 999, background: "oklch(0.9 0.02 120)", overflow: "hidden" }}><span style={{ display: "block", width: pct + "%", height: "100%", borderRadius: 999, background: MAT[t]?.color }} /></span>
                    <span style={{ width: 38, textAlign: "right", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
