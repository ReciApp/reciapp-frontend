import React from "react";
import { MaterialCard } from "../ui/Primitivos";
import { MATERIALES } from "../../lib/datos";

export default function Paso1Tipo({ data, set }) {
  const toggle = (id) => {
    const next = data.tipos.includes(id) ? data.tipos.filter((t) => t !== id) : [...data.tipos, id];
    set({ tipos: next });
  };
  return (
    <div className="screen">
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 25, color: "var(--ink)", margin: "0 0 4px" }}>¿Qué vas a reciclar?</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 18px" }}>Elige uno o varios tipos de residuo.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 12 }}>
        {MATERIALES.map((m) => <MaterialCard key={m.id} mat={m} selected={data.tipos.includes(m.id)} onClick={() => toggle(m.id)} />)}
      </div>
    </div>
  );
}
