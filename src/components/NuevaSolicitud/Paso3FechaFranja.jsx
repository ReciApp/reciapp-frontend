import React from "react";
import { Icon } from "../ui/Primitivos";
import { FRANJAS } from "../../lib/datos";

export default function Paso3FechaFranja({ data, set }) {
  const dias = [];
  const hoy = new Date();
  const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoy); d.setDate(hoy.getDate() + i);
    dias.push({ key: i, dow: i === 0 ? "Hoy" : i === 1 ? "Mañana" : DOW[d.getDay()], num: d.getDate() });
  }
  return (
    <div className="screen">
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 25, color: "var(--ink)", margin: "0 0 4px" }}>¿Cuándo te recogemos?</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 18px" }}>Elige el día y la franja horaria.</p>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, marginBottom: 22 }} className="no-bar">
        {dias.map((d) => (
          <button key={d.key} type="button" onClick={() => set({ dia: d.key })} style={{
            flexShrink: 0, width: 74, padding: "12px 0", borderRadius: 16, cursor: "pointer", textAlign: "center",
            border: "1.5px solid " + (data.dia === d.key ? "var(--green)" : "var(--line)"), background: data.dia === d.key ? "var(--green)" : "var(--cream-card)",
            boxShadow: data.dia === d.key ? "0 4px 0 var(--green-deep)" : "0 2px 0 oklch(0.88 0.03 120)",
          }}>
            <div style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 12.5, color: data.dia === d.key ? "oklch(0.95 0.03 120)" : "var(--ink-soft)" }}>{d.dow}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: data.dia === d.key ? "#fff" : "var(--ink)", lineHeight: 1.1 }}>{d.num}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {FRANJAS.map((fr) => {
          const on = data.franja === fr.id;
          return (
            <button key={fr.id} type="button" onClick={() => set({ franja: fr.id })} style={{
              display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "14px 16px", borderRadius: 16, cursor: "pointer",
              border: "1.5px solid " + (on ? "var(--green)" : "var(--line)"), background: on ? "color-mix(in oklch, var(--green) 12%, var(--cream-card))" : "var(--cream-card)",
            }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: on ? "var(--green)" : "var(--cream)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={fr.icon} size={20} stroke={on ? "#fff" : "var(--ink-soft)"} /></span>
              <span>
                <span style={{ display: "block", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{fr.label}</span>
                <span style={{ display: "block", fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)" }}>{fr.rango}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
