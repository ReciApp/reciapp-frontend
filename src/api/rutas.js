import client from "./client";

/**
 * RECI-76: pide al backend la ruta óptima multi-punto (A* + vecino más
 * cercano con mejora 2-opt) para las solicitudes indicadas.
 *
 * @param {{ origen_lat: number, origen_lon: number, solicitud_ids: number[] }} payload
 * @returns {{ paradas: Array, distancia_total_km: number, eta_total_min: number }}
 */
export const optimizarRuta = (payload) =>
  client.post("/api/rutas/optimizar", payload).then((r) => r.data);
