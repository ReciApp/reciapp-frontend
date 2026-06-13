import client from "./client";

/**
 * RECI-58: calificación del servicio — consume el endpoint de RECI-57.
 *
 * @param {{ solicitud_id: number, puntuacion: number, comentario?: string }} data
 */
export const calificarServicio = (data) =>
  client.post("/api/calificaciones", data).then((r) => r.data);
