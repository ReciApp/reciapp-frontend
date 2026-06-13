import React, { useState } from "react";
import { Icon, PrimaryButton, GhostButton } from "../ui/Primitivos";
import { calificarServicio } from "../../api/calificaciones";

const ETIQUETAS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

/* Estrella individual con relleno animado */
function Estrella({ activa, hover, onClick, onHover, onLeave }) {
  const color = activa || hover ? "var(--orange, #e8a13a)" : "var(--line)";
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label="estrella"
      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0, transition: "transform .1s", transform: hover ? "scale(1.12)" : "none" }}
    >
      <svg width={40} height={40} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1.2} strokeLinejoin="round">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
      </svg>
    </button>
  );
}

/**
 * RECI-58: modal de calificación post-servicio.
 * El ciudadano puntúa de 1 a 5 estrellas y deja un comentario opcional para
 * una solicitud completada. Al enviar, llama a RECI-57 y avisa al padre.
 */
export default function ModalCalificacion({ open, solicitud, onClose, onCalificada }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [hoverPunt, setHoverPunt] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const solicitudId = solicitud?._raw?.id ?? solicitud?.id;
  const recicladorNombre = solicitud?.reciclador && solicitud.reciclador !== "—" ? solicitud.reciclador : null;
  const visible = hoverPunt || puntuacion;

  const enviar = async () => {
    if (!puntuacion) { setError("Selecciona al menos una estrella"); return; }
    setEnviando(true);
    try {
      const resultado = await calificarServicio({
        solicitud_id: solicitudId,
        puntuacion,
        comentario: comentario.trim() || null,
      });
      onCalificada?.(resultado);
      onClose?.();
    } catch (err) {
      const detalle = err.response?.data?.detail;
      setError(detalle || "No se pudo registrar tu calificación");
      if (err.response?.status === 409 && detalle?.includes("ya fue calificada")) {
        onCalificada?.({ solicitud_id: solicitudId, yaCalificada: true });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "oklch(0.2 0.03 130 / 0.55)", display: "grid", placeItems: "center", zIndex: 60, padding: 18 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--cream-card)", borderRadius: 22, padding: "28px 26px", width: "min(440px, 100%)", boxShadow: "0 24px 60px -24px oklch(0.2 0.04 130 / 0.6)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 23, color: "var(--ink)", margin: 0 }}>Califica el servicio</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="x" size={20} stroke="var(--ink-soft)" />
          </button>
        </div>
        <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink-soft)", margin: "0 0 18px" }}>
          {recicladorNombre
            ? <>¿Cómo fue tu recolección con <strong>{recicladorNombre}</strong>?</>
            : "Cuéntanos cómo fue tu experiencia de recolección."}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Estrella
              key={n}
              activa={n <= puntuacion}
              hover={n <= hoverPunt}
              onClick={() => { setPuntuacion(n); setError(null); }}
              onHover={() => setHoverPunt(n)}
              onLeave={() => setHoverPunt(0)}
            />
          ))}
        </div>
        <div style={{ textAlign: "center", height: 22, marginBottom: 14, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, color: "var(--orange, #e8a13a)" }}>
          {ETIQUETAS[visible] || ""}
        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={500}
          placeholder="Comentario (opcional)…"
          rows={3}
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 12, padding: "10px 12px", outline: "none" }}
        />

        {error && (
          <div style={{ marginTop: 12, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--pink)" }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <PrimaryButton type="button" size="sm" loading={enviando} onClick={enviar}>
            <Icon name="star" size={16} stroke="#fff" />Enviar calificación
          </PrimaryButton>
          <GhostButton onClick={onClose}>Ahora no</GhostButton>
        </div>
      </div>
    </div>
  );
}
