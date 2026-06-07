import React, { useState, useEffect } from "react";
import { Icon, PrimaryButton } from "../ui/Primitivos";

export default function PanelConfirmacion({ open, solicitud, onClose, onConfirm }) {
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) setDone(false); }, [open]);
  if (!open || !solicitud) return null;

  return (
    <div onClick={onClose} className="ov-anim" style={{ position: "fixed", inset: 0, zIndex: 100, background: "oklch(0.2 0.02 140 / 0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-anim" style={{ width: "min(440px, 100%)", background: "var(--cream-card)", borderRadius: 24, padding: 26, boxShadow: "0 30px 70px -20px oklch(0.2 0.04 130 / 0.5)" }}>
        {done ? (
          <div className="screen" style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green)", display: "grid", placeItems: "center", margin: "4px auto 16px" }}><Icon name="check" size={34} stroke="#fff" sw={2.6} /></div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 6px" }}>¡Gracias por reciclar!</h3>
            <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 20px" }}>Confirmaste la recolección. Sumaste <strong style={{ color: "var(--green-deep)" }}>+{(solicitud.kg || solicitud.cantidad_kg || 0) * 2} eco-créditos</strong>.</p>
            <PrimaryButton type="button" onClick={onClose} full>Listo</PrimaryButton>
          </div>
        ) : (
          <div className="screen">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 23, color: "var(--ink)", margin: 0, lineHeight: 1.14 }}>Confirmar recepción</h3>
              <button type="button" onClick={onClose} style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", border: "1.5px solid var(--line)", background: "var(--cream)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="x" size={17} stroke="var(--ink-soft)" /></button>
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 18px" }}>¿El reciclador <strong style={{ color: "var(--ink)" }}>{solicitud.reciclador || solicitud.reciclador_nombre || "asignado"}</strong> recogió tus materiales correctamente?</p>

            <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center", background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 16, padding: 14 }}>
              <div style={{ width: 84, height: 84, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "oklch(0.88 0.02 120)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><Icon name="camera" size={26} stroke="var(--ink-soft)" /></div>
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, oklch(0.82 0.03 120) 0 8px, oklch(0.86 0.02 120) 8px 16px)", opacity: 0.5 }} />
              </div>
              <div>
                <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--ink-soft)" }}>Evidencia del reciclador</span>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--green-deep)", marginTop: 4 }}>{solicitud.kg || solicitud.cantidad_kg || 0} kg</div>
                <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)" }}>recolectados</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PrimaryButton type="button" onClick={() => { onConfirm && onConfirm(solicitud); setDone(true); }} full>Sí, confirmar recepción</PrimaryButton>
              <button type="button" onClick={onClose} style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, color: "var(--pink)", background: "transparent", border: "none", cursor: "pointer", padding: 8 }}>Reportar un problema</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
