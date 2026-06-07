import React, { useState } from "react";
import { Icon, Avatar } from "../ui/Primitivos";
import { MAT } from "../../lib/datos";
import Temporizador from "./Temporizador";

export default function TarjetaSolicitudEntrante({ s, onAceptar, onRechazar }) {
  const [estado, setEstado] = useState("idle");

  return (
    <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
          <Avatar name={s.ciudadano} size={42} bg="var(--green-soft)" />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>{s.ciudadano}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, color: "var(--green-deep)", background: "color-mix(in oklch, var(--green) 14%, var(--cream))", borderRadius: 999, padding: "2px 9px" }}><Icon name="gps" size={12} stroke="var(--green-deep)" />{s.dist}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="weight" size={15} stroke="var(--ink-soft)" />{s.kg} kg</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="calendar" size={15} stroke="var(--ink-soft)" />{s.franja}</span>
            </div>
          </div>
        </div>
        <Temporizador minutos={s.min || 3} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {(s.tipos || []).map((t) => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 999, padding: "6px 13px 6px 7px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: MAT[t]?.color, display: "grid", placeItems: "center" }}><Icon name={MAT[t]?.icon} size={13} stroke="#fff" /></span>{MAT[t]?.label || t}
          </span>
        ))}
      </div>
      <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: "12px 0 0" }}><Icon name="pin" size={15} stroke="var(--ink-soft)" />{s.direccion}</p>

      {estado === "resuelta" ? (
        <div className="screen" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, color: "var(--green-deep)" }}><Icon name="check" size={17} stroke="var(--green-deep)" />Solicitud aceptada — revisa tu ruta activa.</div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={() => { setEstado("resuelta"); onAceptar && onAceptar(s); }}
            style={{ flex: 1, fontFamily: "var(--serif)", fontSize: 17, color: "#fff", background: "var(--green)", border: "none", borderRadius: 999, padding: 12, cursor: "pointer", boxShadow: "0 4px 0 var(--green-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = "0 2px 0 var(--green-deep)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 var(--green-deep)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 0 var(--green-deep)"; }}>
            <Icon name="check" size={19} stroke="#fff" />Aceptar
          </button>
          <button type="button" onClick={() => { setEstado("resuelta"); onRechazar && onRechazar(s); }}
            style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--ink-soft)", background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 999, padding: "12px 22px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Icon name="x" size={17} stroke="var(--ink-soft)" />Rechazar
          </button>
        </div>
      )}
    </div>
  );
}
