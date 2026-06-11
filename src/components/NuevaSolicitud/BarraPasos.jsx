import React from "react";
import { Icon } from "../ui/Primitivos";

export const PASOS = ["Tipo", "Cantidad", "Fecha", "Confirmar"];

export default function BarraPasos({ paso, total = 4 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
      {PASOS.map((label, i) => {
        const done = i < paso, active = i === paso;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
                background: done ? "var(--green)" : active ? "var(--green)" : "var(--cream)", color: done || active ? "#fff" : "var(--ink-soft)",
                border: "2px solid " + (done || active ? "var(--green)" : "var(--line)"), fontFamily: "var(--serif)", fontSize: 16,
                boxShadow: active ? "0 0 0 4px oklch(0.66 0.15 142 / 0.2)" : "none", transition: "all .2s" }}>
                {done ? <Icon name="check" size={17} stroke="#fff" sw={3} /> : i + 1}
              </span>
              <span style={{ fontFamily: "var(--sans)", fontWeight: active ? 700 : 600, fontSize: 11.5, color: done || active ? "var(--ink)" : "var(--ink-soft)" }}>{label}</span>
            </div>
            {i < total - 1 && <span style={{ flex: 1, height: 3, borderRadius: 2, margin: "0 6px", marginBottom: 18, background: i < paso ? "var(--green)" : "var(--line)", transition: "background .2s" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
