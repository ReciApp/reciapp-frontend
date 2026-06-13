import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, Card, PrimaryButton, GhostButton } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { miWallet, canjearReward } from "../api/wallet";
import { catalogoRewards } from "../api/rewards";

const fmtFecha = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
};

/* ---------- Movimiento del historial ---------- */
function FilaMovimiento({ t }) {
  const esCredito = t.tipo === "acreditacion";
  return (
    <article style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "var(--cream-card)", border: "1.5px solid var(--line)",
      borderRadius: 14, padding: "12px 16px",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
        background: esCredito ? "var(--green)" : "var(--orange, #e8833a)",
      }}>
        <Icon name={esCredito ? "leaf" : "trophy"} size={19} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>
          {t.descripcion || (esCredito ? "Acreditación por reciclaje" : "Canje de recompensa")}
        </div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", marginTop: 1 }}>
          {fmtFecha(t.fecha)}
          {t.voucher && <> · Voucher <strong>{t.voucher}</strong></>}
        </div>
      </div>
      <div style={{
        fontFamily: "var(--sans)", fontWeight: 800, fontSize: 16, flexShrink: 0,
        color: esCredito ? "var(--green-deep)" : "var(--pink)",
      }}>
        {esCredito ? "+" : "−"}{Math.abs(t.monto)}
      </div>
    </article>
  );
}

/* ---------- Recompensa canjeable ---------- */
function FilaCatalogo({ r, saldo, onCanjear, canjeando }) {
  const alcanza = saldo >= r.costo_creditos && r.stock > 0;
  return (
    <article style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "var(--cream-card)", border: "1.5px solid var(--line)",
      borderRadius: 14, padding: "12px 16px", opacity: r.stock > 0 ? 1 : 0.55,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--green)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name="trophy" size={19} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{r.nombre}</div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", marginTop: 1 }}>
          <strong style={{ color: "var(--green-deep)" }}>{r.costo_creditos}</strong> créditos · Stock {r.stock}
        </div>
      </div>
      <PrimaryButton size="sm" type="button" loading={canjeando} onClick={() => onCanjear(r)}
        color={alcanza ? "var(--green)" : "var(--line)"} deep={alcanza ? "var(--green-deep)" : "var(--line)"}>
        {alcanza ? "Canjear" : r.stock === 0 ? "Sin stock" : "Te faltan"}
      </PrimaryButton>
    </article>
  );
}

/**
 * RECI-56: "Mis Eco-créditos" del ciudadano.
 * Muestra saldo, historial paginado de movimientos (RECI-55) y el catálogo
 * de recompensas canjeables.
 */
export default function MisEcoCreditos() {
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "Ciudadano";

  const [wallet, setWallet] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [canjeando, setCanjeando] = useState({});

  const cargar = useCallback(async (pag) => {
    setCargando(true);
    try {
      const [w, cat] = await Promise.all([miWallet(pag), catalogoRewards()]);
      setWallet(w);
      setCatalogo(cat || []);
      setError(null);
    } catch {
      setError("No se pudo cargar tu wallet de eco-créditos");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(pagina); }, [cargar, pagina]);

  const canjear = async (r) => {
    if ((wallet?.saldo || 0) < r.costo_creditos) {
      setError(`Te faltan ${r.costo_creditos - (wallet?.saldo || 0)} créditos para "${r.nombre}"`);
      return;
    }
    setCanjeando((c) => ({ ...c, [r.id]: true }));
    try {
      const canje = await canjearReward(r.id);
      setAviso(`¡Canjeado! Voucher ${canje.voucher}. Saldo restante: ${canje.saldo_restante} créditos.`);
      setError(null);
      setPagina(1);
      await cargar(1);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo canjear la recompensa");
    } finally {
      setCanjeando((c) => ({ ...c, [r.id]: false }));
    }
  };

  const saldo = wallet?.saldo ?? 0;
  const transacciones = wallet?.transacciones || [];
  const totalPaginas = wallet?.total_paginas || 1;

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="ciudadano" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 880, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Gamificación"
          title={<span>Mis <span style={{ color: "var(--green-deep)", fontStyle: "italic" }}>eco-créditos</span></span>}
          sub="Gana créditos reciclando y canjéalos por recompensas."
        />

        {/* Tarjeta de saldo */}
        <Card pad={26} style={{ marginBottom: 18, background: "var(--green-deep)", border: "none", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "oklch(1 0 0 / 0.15)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="leaf" size={30} stroke="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: "oklch(0.92 0.05 130)", fontWeight: 600 }}>Saldo disponible</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 40, color: "#fff", lineHeight: 1.05 }}>
              {saldo} <span style={{ fontSize: 18, fontStyle: "italic" }}>créditos</span>
            </div>
          </div>
        </Card>

        {aviso && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--green)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--green-deep)" }}>
            {aviso}
          </div>
        )}
        {error && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--pink)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--pink)" }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>Cargando tu wallet…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
            {/* Catálogo canjeable */}
            <section>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--ink)", margin: "0 0 12px" }}>Recompensas para canjear</h3>
              {catalogo.length === 0 ? (
                <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", fontSize: 14 }}>Aún no hay recompensas disponibles.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {catalogo.map((r) => (
                    <FilaCatalogo key={r.id} r={r} saldo={saldo} onCanjear={canjear} canjeando={!!canjeando[r.id]} />
                  ))}
                </div>
              )}
            </section>

            {/* Historial de movimientos */}
            <section>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--ink)", margin: "0 0 12px" }}>Historial de movimientos</h3>
              {transacciones.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--cream-card)", border: "1.5px dashed var(--line)", borderRadius: 18, color: "var(--ink-soft)", fontFamily: "var(--sans)", fontSize: 14 }}>
                  Todavía no tienes movimientos. ¡Recicla para ganar tus primeros créditos!
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {transacciones.map((t) => <FilaMovimiento key={t.id} t={t} />)}
                  </div>
                  {totalPaginas > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 16 }}>
                      <GhostButton onClick={() => setPagina((p) => Math.max(1, p - 1))} >
                        <Icon name="chevronLeft" size={15} stroke="var(--ink-soft)" />Anterior
                      </GhostButton>
                      <span style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>
                        Página {pagina} de {totalPaginas}
                      </span>
                      <GhostButton onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>
                        Siguiente<Icon name="chevronRight" size={15} stroke="var(--ink-soft)" />
                      </GhostButton>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
