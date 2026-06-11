import React, { useState } from "react";
import { Icon, Avatar } from "../ui/Primitivos";
import { MAT } from "../../lib/datos";

export default function TarjetaSolicitudDisponible({ s, onTomar }) {
  const [estado, setEstado] = useState("idle");

  const tomar = async () => {
    setEstado("cargando");
    const ok = await onTomar?.(s);
    if (!ok) setEstado("idle");
  };

  return (
    <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
        <Avatar name={s.ciudadano} size={42} bg="var(--orange-soft, var(--green-soft))" />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>{s.ciudadano}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="weight" size={15} stroke="var(--ink-soft)" />{s.kg} kg</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="calendar" size={15} stroke="var(--ink-soft)" />{s.franja}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {(s.tipos || []).map((t) => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 999, padding: "6px 13px 6px 7px", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: MAT[t]?.color, display: "grid", placeItems: "center" }}><Icon name={MAT[t]?.icon} size={13} stroke="#fff" /></span>{MAT[t]?.label || t}
          </span>
        ))}
      </div>
      <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: "12px 0 0" }}><Icon name="pin" size={15} stroke="var(--ink-soft)" />{s.direccion}</p>

      <button type="button" disabled={estado === "cargando"} onClick={tomar}
        style={{ width: "100%", marginTop: 16, fontFamily: "var(--serif)", fontSize: 17, color: "#fff", background: "var(--orange)", border: "none", borderRadius: 999, padding: 12, cursor: estado === "cargando" ? "default" : "pointer", opacity: estado === "cargando" ? 0.7 : 1, boxShadow: "0 4px 0 oklch(0.6 0.15 50)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="truck" size={18} stroke="#fff" />{estado === "cargando" ? "Tomando…" : "Tomar esta solicitud"}
      </button>
    </div>
  );
}
