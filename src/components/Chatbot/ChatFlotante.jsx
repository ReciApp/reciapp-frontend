import React, { useState, useRef, useEffect } from "react";
import { Icon } from "../ui/Primitivos";
import { enviarMensajeChat } from "../../api/chatbot";

const SALUDO = {
  role: "assistant",
  content: "¡Hola! Soy EcoBot 🌱 ¿En qué te ayudo con tu reciclaje hoy?",
};

const MAX_CONTEXTO = 10; // últimos turnos enviados como historial

/**
 * RECI-71: chat flotante con EcoBot. Burbuja fija abajo a la derecha que abre
 * un panel de conversación contra RECI-70 (/api/chatbot).
 */
export default function ChatFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([SALUDO]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [noDisponible, setNoDisponible] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto, enviando]);

  const enviar = async (e) => {
    e?.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    const nuevos = [...mensajes, { role: "user", content: contenido }];
    setMensajes(nuevos);
    setTexto("");
    setEnviando(true);
    try {
      const historial = nuevos
        .filter((m) => m !== SALUDO)
        .slice(-MAX_CONTEXTO - 1, -1)
        .map(({ role, content }) => ({ role, content }));
      const { respuesta } = await enviarMensajeChat(contenido, historial);
      setMensajes((m) => [...m, { role: "assistant", content: respuesta }]);
    } catch (err) {
      if (err.response?.status === 503) {
        setNoDisponible(true);
        setMensajes((m) => [...m, { role: "assistant", content: "El asistente no está disponible por ahora. Intenta más tarde." }]);
      } else {
        setMensajes((m) => [...m, { role: "assistant", content: "Ups, no pude responder en este momento. ¿Lo intentamos de nuevo?" }]);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Burbuja */}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-label="Abrir chat de ayuda"
        style={{
          position: "fixed", bottom: 22, right: 22, zIndex: 70,
          width: 58, height: 58, borderRadius: "50%", border: "none", cursor: "pointer",
          background: "var(--green)", boxShadow: "0 8px 22px -8px oklch(0.4 0.1 150 / 0.7)",
          display: "grid", placeItems: "center", transition: "transform .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
      >
        <Icon name={abierto ? "x" : "leaf"} size={26} stroke="#fff" />
      </button>

      {/* Panel */}
      {abierto && (
        <div style={{
          position: "fixed", bottom: 92, right: 22, zIndex: 70,
          width: "min(360px, calc(100vw - 32px))", height: "min(520px, calc(100vh - 130px))",
          display: "flex", flexDirection: "column",
          background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20,
          boxShadow: "0 24px 60px -24px oklch(0.2 0.04 130 / 0.55)", overflow: "hidden",
        }}>
          {/* Encabezado */}
          <div style={{ background: "var(--green)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--green-deep)", display: "grid", placeItems: "center" }}>
              <Icon name="leaf" size={20} stroke="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "#fff", lineHeight: 1.1 }}>EcoBot</div>
              <div style={{ fontFamily: "var(--sans)", fontSize: 11.5, color: "oklch(0.92 0.05 130)" }}>Asistente de ReciApp</div>
            </div>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "var(--cream)" }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "82%" }}>
                <div style={{
                  fontFamily: "var(--sans)", fontSize: 14, lineHeight: 1.45, padding: "9px 13px", borderRadius: 14,
                  background: m.role === "user" ? "var(--green)" : "var(--cream-card)",
                  color: m.role === "user" ? "#fff" : "var(--ink)",
                  border: m.role === "user" ? "none" : "1.5px solid var(--line)",
                  borderBottomRightRadius: m.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: m.role === "user" ? 14 : 4,
                  whiteSpace: "pre-wrap",
                }}>{m.content}</div>
              </div>
            ))}
            {enviando && (
              <div style={{ alignSelf: "flex-start", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", padding: "4px 6px" }}>
                EcoBot está escribiendo…
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Entrada */}
          <form onSubmit={enviar} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--line)", background: "var(--cream-card)" }}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              disabled={noDisponible}
              placeholder={noDisponible ? "Chat no disponible" : "Escribe tu mensaje…"}
              maxLength={2000}
              style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 999, padding: "9px 14px", outline: "none" }}
            />
            <button type="submit" disabled={enviando || noDisponible || !texto.trim()}
              style={{ width: 42, height: 42, borderRadius: "50%", border: "none", flexShrink: 0, cursor: enviando || noDisponible ? "default" : "pointer", background: "var(--green)", display: "grid", placeItems: "center", opacity: enviando || noDisponible || !texto.trim() ? 0.5 : 1 }}>
              <Icon name="arrowRight" size={19} stroke="#fff" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
