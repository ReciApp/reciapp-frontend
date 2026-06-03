import { useEffect, useRef } from "react";

/**
 * Mantiene una conexión WebSocket autenticada con el backend.
 * Se reconecta automáticamente con backoff exponencial si la conexión cae.
 *
 * @param {(msg: object) => void} onMessage  Callback con el mensaje ya parseado.
 * @param {boolean} enabled  false para no conectar (ej: usuario no logueado).
 */
export function useWebSocket(onMessage, enabled = true) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(null);

  // Mantener la referencia al callback actualizada sin reconectar
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const wsBase = apiUrl.replace(/^https?/, "ws");
    let delay = 1000;

    const connect = () => {
      const ws = new WebSocket(`${wsBase}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try { onMessageRef.current(JSON.parse(e.data)); } catch {}
      };

      ws.onclose = () => {
        retryRef.current = setTimeout(() => {
          delay = Math.min(delay * 2, 30000);
          connect();
        }, delay);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [enabled]);

  return wsRef;
}
