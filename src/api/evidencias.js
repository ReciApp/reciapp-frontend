import client from "./client";

export const subirEvidencia = (formData) =>
  client.post("/api/evidencias", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const obtenerEvidencias = (solicitudId) =>
  client.get(`/api/evidencias/${solicitudId}`).then((r) => r.data);
