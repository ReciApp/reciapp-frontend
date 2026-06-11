import React from "react";
import { Icon } from "../ui/Primitivos";

const stepperBtn = { width: 56, height: 56, borderRadius: 18, border: "1.5px solid var(--line)", background: "var(--cream-card)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 3px 0 oklch(0.88 0.03 120)" };

export default function Paso2Cantidad({ data, set }) {
  const kg = data.kg;
  const step = (d) => set({ kg: Math.max(1, Math.min(200, kg + d)) });
  return (
    <div className="screen">
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 25, color: "var(--ink)", margin: "0 0 4px" }}>Cantidad aproximada</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 22px" }}>Estima el peso total de tus materiales.</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginBottom: 24 }}>
        <button type="button" onClick={() => step(-1)} style={stepperBtn}><Icon name="minus" size={22} stroke="var(--green-deep)" /></button>
        <div style={{ textAlign: "center", minWidth: 140 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 72, color: "var(--green-deep)", lineHeight: 1 }}>{kg}</div>
          <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 16, color: "var(--ink-soft)", letterSpacing: 1, textTransform: "uppercase" }}>kilogramos</div>
        </div>
        <button type="button" onClick={() => step(1)} style={stepperBtn}><Icon name="plus" size={22} stroke="var(--green-deep)" /></button>
      </div>

      <input type="range" min="1" max="50" value={Math.min(kg, 50)} onChange={(e) => set({ kg: parseInt(e.target.value, 10) })}
        style={{ width: "100%", accentColor: "var(--green)", height: 6 }} />
      <div style={{ display: "flex", gap: 9, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {[2, 5, 10, 20, 40].map((v) => (
          <button key={v} type="button" onClick={() => set({ kg: v })} style={{
            fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
            border: "1.5px solid " + (kg === v ? "var(--green)" : "var(--line)"), background: kg === v ? "var(--green)" : "var(--cream-card)", color: kg === v ? "#fff" : "var(--ink)",
          }}>{v} kg</button>
        ))}
      </div>
    </div>
  );
}
