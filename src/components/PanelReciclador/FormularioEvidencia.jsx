import React, { useState, useRef } from "react";
import { Icon, Field, PrimaryButton } from "../ui/Primitivos";
import { subirEvidencia } from "../../api/evidencias";

export default function FormularioEvidencia({ solicitudId, onComplete }) {
  const [fotoFile, setFotoFile] = useState(null);
  const [peso, setPeso] = useState("");
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  if (done) {
    return (
      <div className="screen" style={{ background: "var(--cream-card)", border: "1.5px solid var(--green-soft)", borderRadius: 20, padding: 26, textAlign: "center" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--green)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon name="check" size={30} stroke="#fff" sw={2.6} /></div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: 23, color: "var(--ink)", margin: "0 0 6px" }}>¡Recolección completada!</h3>
        <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: 0 }}>El ciudadano confirmará la recepción y se sumará a tu historial.</p>
      </div>
    );
  }

  const completar = async () => {
    if (solicitudId && fotoFile) {
      try {
        const fd = new FormData();
        fd.append("solicitud_id", solicitudId);
        fd.append("peso_kg", parseFloat(peso) || 0);
        fd.append("foto", fotoFile);
        await subirEvidencia(fd);
      } catch {}
    }
    setDone(true);
    onComplete && onComplete({ peso });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFotoFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) setFotoFile(file);
  };

  return (
    <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, padding: 22, boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--ink)", margin: "0 0 4px" }}>Registrar evidencia</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 16px" }}>Sube una foto y el peso real recolectado.</p>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
      <button type="button" onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{ width: "100%", border: "2px dashed " + (drag ? "var(--green)" : fotoFile ? "var(--green-soft)" : "var(--line)"), background: drag ? "color-mix(in oklch, var(--green) 8%, var(--cream))" : "var(--cream)", borderRadius: 16, padding: "26px 18px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "border-color .15s, background .15s" }}>
        {fotoFile ? (
          <>
            <div style={{ position: "relative", width: 120, height: 90, borderRadius: 12, overflow: "hidden", background: "oklch(0.86 0.04 145)" }}>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, oklch(0.8 0.05 145) 0 10px, oklch(0.85 0.04 145) 10px 20px)" }} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "var(--green)", display: "grid", placeItems: "center" }}><Icon name="check" size={14} stroke="#fff" sw={3} /></span>
            </div>
            <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13.5, color: "var(--green-deep)" }}>{fotoFile.name} · toca para cambiar</span>
          </>
        ) : (
          <>
            <span style={{ width: 50, height: 50, borderRadius: 14, background: "var(--cream-card)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center" }}><Icon name="camera" size={24} stroke="var(--green-deep)" /></span>
            <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>Arrastra o toca para subir</span>
            <span style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)" }}>JPG, PNG o WEBP · máx 5 MB</span>
          </>
        )}
      </button>

      <div style={{ marginTop: 16 }}>
        <Field label="Peso real recolectado" inputMode="decimal" value={peso} onChange={(v) => setPeso(v.replace(/[^\d.]/g, ""))} placeholder="0.0" trailing={<span style={{ paddingRight: 14, fontFamily: "var(--sans)", fontWeight: 700, color: "var(--ink-soft)" }}>kg</span>} />
      </div>

      <div style={{ marginTop: 18 }}>
        <PrimaryButton type="button" full color={fotoFile && peso ? "var(--green)" : "var(--line)"} deep={fotoFile && peso ? "var(--green-deep)" : "oklch(0.8 0.02 120)"} onClick={fotoFile && peso ? completar : undefined}>
          <Icon name="check" size={19} stroke="#fff" />Completar recolección
        </PrimaryButton>
      </div>
    </div>
  );
}
