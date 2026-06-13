import client from "./client";

/**
 * RECI-71: chat con EcoBot — consume el endpoint de RECI-70.
 *
 * @param {string} mensaje
 * @param {{role: 'user'|'assistant', content: string}[]} historial
 */
export const enviarMensajeChat = (mensaje, historial = []) =>
  client.post("/api/chatbot", { mensaje, historial }).then((r) => r.data);
