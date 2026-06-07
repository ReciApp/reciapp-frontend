import React, { useState, useEffect } from "react";
import { Icon, PrimaryButton, GhostButton, StatusBadge } from "../ui/Primitivos";
import { FRANJAS } from "../../lib/datos";
import { crearSolicitud } from "../../api/solicitudes";
import BarraPasos from "./BarraPasos";
import Paso1Tipo from "./Paso1Tipo";
import Paso2Cantidad from "./Paso2Cantidad";
import Paso3FechaFranja from "./Paso3FechaFranja";
import Paso4Confirmacion from "./Paso4Confirmacion";

function SolicitudCreada({ data, onClose }) {
  const franja = FRANJAS.find((f) => f.id === data.franja);
  return (
    <div className="screen" style={{ textAlign: "center", padding: "10px 0 6px" }}>
      <div style={{ position: "relative", width: 84, height: 84, margin: "0 auto 18px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--green)", display: "grid", placeItems: "center" }}><Icon name="check" size={42} stroke="#fff" sw={2.6} /></div>
      </div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", margin: "0 0 8px" }}>¡Solicitud creada!</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 15, color: "var(--ink-soft)", margin: "0 auto 20px", maxWidth: 340, lineHeight: 1.55 }}>Buscamos un reciclador disponible cerca de <strong style={{ color: "var(--ink)" }}>{data.direccion}</strong>. Te avisaremos cuando alguien la acepte.</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22 }}><StatusBadge estado="pendiente" /><span style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>{data.kg} kg · {franja?.label}</span></div>
      <div><PrimaryButton type="button" onClick={onClose} full>Ver mis solicitudes</PrimaryButton></div>
    </div>
  );
}

export default function NuevaSolicitudModal({ open, onClose, onSubmit }) {
  const [paso, setPaso] = useState(0);
  const [data, setData] = useState({ tipos: [], kg: 5, dia: 0, franja: "manana", direccion: "", lat: null, lon: null });
  const [status, setStatus] = useState("idle");
  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  useEffect(() => {
    if (open) { setPaso(0); setData({ tipos: [], kg: 5, dia: 0, franja: "manana", direccion: "", lat: null, lon: null }); setStatus("idle"); }
  }, [open]);
  if (!open) return null;

  const puedeSeguir = paso === 0 ? data.tipos.length > 0 : paso === 3 ? data.direccion.trim().length > 3 : true;

  const next = async () => {
    if (paso < 3) { setPaso(paso + 1); return; }
    setStatus("loading");
    try {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + data.dia);
      const fecha = hoy.toISOString().split("T")[0];
      await crearSolicitud({
        tipo_residuo: data.tipos[0],
        cantidad_kg: data.kg,
        fecha_recoleccion: fecha,
        franja_horaria: data.franja,
        direccion: data.direccion,
        ...(data.lat !== null && { latitud: data.lat, longitud: data.lon }),
      });
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  const steps = [Paso1Tipo, Paso2Cantidad, Paso3FechaFranja, Paso4Confirmacion];
  const StepComp = steps[paso];

  return (
    <div className="ov-anim" style={{ position: "fixed", inset: 0, zIndex: 100, background: "oklch(0.2 0.02 140 / 0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-anim" style={{ width: "min(560px, 100%)", maxHeight: "94vh", display: "flex", flexDirection: "column", background: "var(--cream-card)", borderRadius: "26px 26px 0 0", boxShadow: "0 -10px 50px -10px oklch(0.2 0.04 130 / 0.4)", overflow: "hidden" }}>
        {/* header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--green)", display: "grid", placeItems: "center" }}><Icon name="truck" size={20} stroke="#fff" /></span>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", margin: 0 }}>Nueva solicitud</h2>
            </div>
            <button type="button" onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--line)", background: "var(--cream)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="x" size={18} stroke="var(--ink-soft)" /></button>
          </div>
          {status !== "done" && <BarraPasos paso={paso} />}
        </div>

        {/* body */}
        <div className="no-bar" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          {status === "done"
            ? <SolicitudCreada data={data} onClose={() => { onSubmit && onSubmit(data); onClose(); }} />
            : <StepComp data={data} set={set} />}
        </div>

        {/* footer */}
        {status !== "done" && (
          <div style={{ padding: "16px 22px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--cream-card)" }}>
            {paso > 0 ? <GhostButton onClick={() => setPaso(paso - 1)}><Icon name="chevronLeft" size={18} stroke="var(--ink-soft)" />Atrás</GhostButton> : <span />}
            <PrimaryButton type="button" loading={status === "loading"} onClick={puedeSeguir ? next : undefined} color={puedeSeguir ? "var(--green)" : "var(--line)"} deep={puedeSeguir ? "var(--green-deep)" : "oklch(0.8 0.02 120)"} size="sm">
              {paso === 3 ? "Confirmar solicitud" : "Siguiente"}{paso < 3 && <Icon name="arrowRight" size={18} stroke="#fff" />}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
