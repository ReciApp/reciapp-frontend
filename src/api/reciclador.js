import client from "./client";

/**
 * RECI-78: backlog del reciclador — sus solicitudes con la trazabilidad
 * completa de estados (endpoint de RECI-77).
 *
 * @param {{ estado?: string, fecha?: string }} filtros
 */
export const listarBacklog = (filtros = {}) => {
  const params = {};
  if (filtros.estado) params.estado = filtros.estado;
  if (filtros.fecha) params.fecha = filtros.fecha;
  return client.get("/api/reciclador/solicitudes", { params }).then((r) => r.data);
};

/**
 * RECI-80: planificación del día siguiente (endpoints de RECI-79).
 */
export const planDiaSiguiente = () =>
  client.get("/api/reciclador/dia-siguiente").then((r) => r.data);

export const confirmarDia = (id) =>
  client.put(`/api/reciclador/solicitudes/${id}/confirmar-dia`).then((r) => r.data);

export const liberarSolicitud = (id) =>
  client.put(`/api/reciclador/solicitudes/${id}/liberar`).then((r) => r.data);
