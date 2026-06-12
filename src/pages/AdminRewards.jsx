import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, Field, PrimaryButton, GhostButton } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { listarRewardsAdmin, crearReward, editarReward, toggleReward } from "../api/rewards";

const FORM_VACIO = { nombre: "", descripcion: "", costo_creditos: "", stock: "" };

/* ---------- Formulario de creación/edición ---------- */
function FormReward({ inicial = FORM_VACIO, titulo, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(inicial);
  const [errores, setErrores] = useState({});

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const validar = () => {
    const err = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio";
    if (!(parseFloat(form.costo_creditos) > 0)) err.costo_creditos = "Debe ser mayor a 0";
    if (!(parseInt(form.stock, 10) >= 0)) err.stock = "Debe ser 0 o más";
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const enviar = (e) => {
    e.preventDefault();
    if (!validar()) return;
    onGuardar({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      costo_creditos: parseFloat(form.costo_creditos),
      stock: parseInt(form.stock, 10),
    });
  };

  return (
    <form onSubmit={enviar} style={{ background: "var(--cream-card)", border: "1.5px solid var(--green-soft)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 4 }}>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)", margin: "0 0 10px" }}>{titulo}</h3>
      <Field label="Nombre" value={form.nombre} onChange={set("nombre")} placeholder="Ej. Vale de despensa S/20" error={errores.nombre} />
      <Field label="Descripción (opcional)" value={form.descripcion} onChange={set("descripcion")} placeholder="Detalle visible en el catálogo" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Costo (eco-créditos)" type="number" inputMode="decimal" value={form.costo_creditos} onChange={set("costo_creditos")} placeholder="50" error={errores.costo_creditos} />
        <Field label="Stock" type="number" inputMode="numeric" value={form.stock} onChange={set("stock")} placeholder="10" error={errores.stock} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <PrimaryButton size="sm" loading={guardando}>
          <Icon name="check" size={15} stroke="#fff" />Guardar
        </PrimaryButton>
        <GhostButton onClick={onCancelar}>Cancelar</GhostButton>
      </div>
    </form>
  );
}

/* ---------- Fila de recompensa ---------- */
function FilaReward({ r, onEditar, onToggle, alternando }) {
  return (
    <article style={{
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      background: "var(--cream-card)", border: "1.5px solid var(--line)",
      borderRadius: 16, padding: "14px 18px", opacity: r.activo ? 1 : 0.6,
      boxShadow: "0 2px 0 oklch(0.88 0.03 120)",
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: r.activo ? "var(--green)" : "var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name="trophy" size={22} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15.5, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
          {r.nombre}
          {!r.activo && (
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-soft)", background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 9px" }}>
              Inactiva
            </span>
          )}
        </div>
        {r.descripcion && (
          <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{r.descripcion}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 18, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", flexShrink: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="leaf" size={15} stroke="var(--green-deep)" />
          <strong style={{ color: "var(--green-deep)" }}>{r.costo_creditos}</strong>&nbsp;créditos
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="clipboard" size={15} stroke="var(--ink-soft)" />
          Stock: <strong style={{ color: r.stock === 0 ? "var(--pink)" : "var(--ink)" }}>{r.stock}</strong>
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <GhostButton onClick={() => onEditar(r)}>
          <Icon name="edit" size={15} stroke="var(--ink-soft)" />Editar
        </GhostButton>
        <GhostButton color={r.activo ? "var(--pink)" : "var(--green-deep)"} onClick={() => onToggle(r)}>
          <Icon name="power" size={15} stroke={r.activo ? "var(--pink)" : "var(--green-deep)"} />
          {alternando ? "…" : r.activo ? "Desactivar" : "Activar"}
        </GhostButton>
      </div>
    </article>
  );
}

/**
 * RECI-62: panel de administración de recompensas.
 * CRUD completo contra /admin/rewards (RECI-61): crear, editar,
 * activar/desactivar y ver stock/costo de cada recompensa del catálogo.
 */
export default function AdminRewards() {
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "admin";

  const [rewards, setRewards] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState(null);   // reward en edición
  const [guardando, setGuardando] = useState(false);
  const [alternando, setAlternando] = useState({}); // { [id]: bool }

  useEffect(() => {
    listarRewardsAdmin()
      .then((data) => { setRewards(data || []); setError(null); })
      .catch(() => setError("No se pudo cargar el catálogo de recompensas"))
      .finally(() => setCargando(false));
  }, []);

  const guardarNueva = async (payload) => {
    setGuardando(true);
    try {
      const creada = await crearReward(payload);
      setRewards((rs) => [creada, ...rs]);
      setCreando(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo crear la recompensa");
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (payload) => {
    setGuardando(true);
    try {
      const actualizada = await editarReward(editando.id, payload);
      setRewards((rs) => rs.map((r) => (r.id === actualizada.id ? actualizada : r)));
      setEditando(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo editar la recompensa");
    } finally {
      setGuardando(false);
    }
  };

  const alternar = async (r) => {
    setAlternando((a) => ({ ...a, [r.id]: true }));
    try {
      const actualizada = await toggleReward(r.id);
      setRewards((rs) => rs.map((x) => (x.id === actualizada.id ? actualizada : x)));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo cambiar el estado");
    } finally {
      setAlternando((a) => ({ ...a, [r.id]: false }));
    }
  };

  const activas = rewards.filter((r) => r.activo).length;

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="admin" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 880, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Gamificación"
          title={<span>Catálogo de <span style={{ color: "var(--orange)", fontStyle: "italic" }}>recompensas</span></span>}
          sub={`${rewards.length} recompensas (${activas} activas) — lo que los ciudadanos pueden canjear con sus eco-créditos.`}
          right={
            !creando && !editando && (
              <PrimaryButton size="sm" type="button" onClick={() => setCreando(true)}>
                <Icon name="plus" size={16} stroke="#fff" />Nueva recompensa
              </PrimaryButton>
            )
          }
        />

        {error && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--pink)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--pink)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {creando && (
            <FormReward
              titulo="Nueva recompensa"
              onGuardar={guardarNueva}
              onCancelar={() => setCreando(false)}
              guardando={guardando}
            />
          )}
          {editando && (
            <FormReward
              key={editando.id}
              titulo={`Editar: ${editando.nombre}`}
              inicial={{
                nombre: editando.nombre,
                descripcion: editando.descripcion || "",
                costo_creditos: String(editando.costo_creditos),
                stock: String(editando.stock),
              }}
              onGuardar={guardarEdicion}
              onCancelar={() => setEditando(null)}
              guardando={guardando}
            />
          )}

          {cargando ? (
            <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>Cargando recompensas…</div>
          ) : rewards.length === 0 && !creando ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--cream-card)", border: "1.5px dashed var(--line)", borderRadius: 20, color: "var(--ink-soft)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                <Icon name="trophy" size={26} stroke="var(--ink-soft)" />
              </div>
              <p style={{ fontFamily: "var(--sans)", fontSize: 15, margin: 0 }}>
                Aún no hay recompensas.<br />Crea la primera para activar el canje de eco-créditos.
              </p>
            </div>
          ) : (
            rewards.map((r) => (
              <FilaReward
                key={r.id}
                r={r}
                onEditar={setEditando}
                onToggle={alternar}
                alternando={!!alternando[r.id]}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
