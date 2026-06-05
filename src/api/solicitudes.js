import client from "./client";

export const crearSolicitud = (data) =>
  client.post("/api/solicitudes", data).then((r) => r.data);

export const listarSolicitudes = () =>
  client.get("/api/solicitudes").then((r) => r.data);

export const obtenerSolicitud = (id) =>
  client.get(`/api/solicitudes/${id}`).then((r) => r.data);

export const aceptarSolicitud = (id) =>
  client.put(`/api/solicitudes/${id}/aceptar`).then((r) => r.data);

export const rechazarSolicitud = (id) =>
  client.put(`/api/solicitudes/${id}/rechazar`).then((r) => r.data);

export const confirmarSolicitud = (id) =>
  client.put(`/api/solicitudes/${id}/confirmar`).then((r) => r.data);
