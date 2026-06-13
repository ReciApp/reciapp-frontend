import client from "./client";

/**
 * RECI-60: historial de solicitudes (solo lectura) — consume RECI-59.
 * El backend ya filtra por rol (ciudadano ve las suyas, reciclador las suyas,
 * admin todas), así que aquí solo se pasan los filtros opcionales.
 */

const limpiar = (filtros = {}) => {
  const params = {};
  for (const k of ["estado", "tipo_residuo", "desde", "hasta"]) {
    if (filtros[k]) params[k] = filtros[k];
  }
  return params;
};

export const listarHistorial = (filtros = {}) =>
  client.get("/api/historial", { params: limpiar(filtros) }).then((r) => r.data);

/** Descarga el historial filtrado como CSV (respeta el token vía interceptor). */
export const exportarHistorialCsv = async (filtros = {}) => {
  const resp = await client.get("/api/historial/csv", {
    params: limpiar(filtros),
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([resp.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "historial_reciapp.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
