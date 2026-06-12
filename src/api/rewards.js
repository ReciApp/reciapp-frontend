import client from "./client";

/**
 * RECI-62: administración de recompensas (endpoints de RECI-61).
 */
export const listarRewardsAdmin = () =>
  client.get("/admin/rewards").then((r) => r.data);

export const crearReward = (data) =>
  client.post("/admin/rewards", data).then((r) => r.data);

export const editarReward = (id, data) =>
  client.put(`/admin/rewards/${id}`, data).then((r) => r.data);

export const toggleReward = (id) =>
  client.patch(`/admin/rewards/${id}/toggle`).then((r) => r.data);

/** Catálogo público de recompensas activas (cualquier usuario autenticado). */
export const catalogoRewards = () =>
  client.get("/api/rewards").then((r) => r.data);
