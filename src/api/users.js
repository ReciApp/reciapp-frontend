import client from "./client";

export const getMe = async () => {
  const { data } = await client.get("/api/usuarios/me");
  return data;
};

export const getUsuario = async (id) => {
  const { data } = await client.get(`/api/usuarios/${id}`);
  return data;
};

export const updateMe = async (payload) => {
  const { data } = await client.put("/api/usuarios/me", payload);
  return data;
};

export const getPendingRecicladores = async () => {
  const { data } = await client.get("/api/usuarios/admin/recicladores-pendientes");
  return data;
};

export const validarReciclador = async (id, accion) => {
  const { data } = await client.put(`/api/usuarios/admin/recicladores/${id}/validar`, { accion });
  return data;
};
