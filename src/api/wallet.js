import client from "./client";

/**
 * RECI-56: "Mis Eco-créditos" — consume el wallet de RECI-55.
 */

/** Saldo + historial paginado de movimientos (10 por página). */
export const miWallet = (pagina = 1) =>
  client.get("/api/wallets/me", { params: { pagina } }).then((r) => r.data);

/** Canjear una recompensa del catálogo: descuenta saldo y devuelve voucher. */
export const canjearReward = (rewardId) =>
  client.post(`/api/wallets/me/canjear/${rewardId}`).then((r) => r.data);
