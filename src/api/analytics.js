import client from "./client";

/**
 * Analytics (solo admin).
 * RECI-67 (dashboard KPI) consume /resumen; RECI-69 (mapa de calor) consume
 * /heatmap. Ambos comparten los mismos filtros (RECI-66 / RECI-68).
 */

const limpiar = (filtros = {}) => {
  const params = {};
  for (const k of ["desde", "hasta", "tipo_residuo"]) {
    if (filtros[k]) params[k] = filtros[k];
  }
  return params;
};

export const resumenAnalytics = (filtros = {}) =>
  client.get("/api/analytics/resumen", { params: limpiar(filtros) }).then((r) => r.data);

export const heatmapAnalytics = (filtros = {}) =>
  client.get("/api/analytics/heatmap", { params: limpiar(filtros) }).then((r) => r.data);
