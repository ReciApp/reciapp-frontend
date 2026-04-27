import client from "./client";

export const login = async (correo, contrasena) => {
  const { data } = await client.post("/auth/login", { correo, contrasena });
  localStorage.setItem("token", data.access_token);
  client.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
  return data;
};

export const registerCiudadano = async (payload) => {
  const { data } = await client.post("/auth/register", payload);
  return data;
};

export const registerReciclador = async (payload) => {
  const { data } = await client.post("/auth/register/reciclador", payload);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  delete client.defaults.headers.common["Authorization"];
};
