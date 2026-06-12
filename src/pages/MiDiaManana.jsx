import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, StatusBadge, PrimaryButton, GhostButton } from "../components/ui/Primitivos";
import MapaMultiParada from "../components/MapaMultiParada/MapaMultiParada";
import { useAuth } from "../context/AuthContext";
import { planDiaSiguiente, confirmarDia, liberarSolicitud } from "../api/reciclador";
import { MAT, FRANJAS } from "../lib/datos";

const fechaManana = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
};

/* ---------- Tarjeta de una recolección planificada ---------- */
function TarjetaPlan({ s, ocupado, onConfirmar, onLiberar }) {
  const mat = MAT[s.tipo_residuo];
  const franja = FRANJAS.find((f) => f.id === s.franja_horaria);

  return (
    <article style={{ background: "var(--cream-card)", border: "1.5px solid " + (s.estado === "confirmada" ? "var(--green)" : "var(--line)"), borderRadius: 16, padding: 16, boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: mat?.color || "var(--line)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
            {mat?.label || s.tipo_residuo} · {s.cantidad_kg} kg
          </span>
        </div>
        <StatusBadge estado={s.estado} size="sm" />
      </div>

      <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)", margin: "9px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="pin" size={14} stroke="var(--ink-soft)" />{s.direccion}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="clock" size={14} stroke="var(--ink-soft)" />
          {franja ? `${franja.label} (${franja.rango})` : s.franja_horaria}
        </span>
      </div>

      <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
        {s.estado === "asignada" && (
          <PrimaryButton size="sm" type="button" loading={ocupado === "confirmar"} onClick={() => onConfirmar(s)}>
            <Icon name="check" size={15} stroke="#fff" />Confirmar
          </PrimaryButton>
        )}
        <GhostButton color="var(--pink)" onClick={() => onLiberar(s)}>
          <Icon name="x" size={15} stroke="var(--pink)" />
          {ocupado === "liberar" ? "Liberando…" : "Liberar"}
        </GhostButton>
      </div>
    </article>
  );
}

/**
 * RECI-80: "Mi día de mañana".
 * Muestra el plan del día siguiente (RECI-79): el reciclador confirma o
 * libera cada recolección y previsualiza la ruta óptima (A* de RECI-75)
 * con el mapa multi-parada de RECI-76.
 */
export default function MiDiaManana() {
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "reciclador";

  const [plan, setPlan] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState({});   // { [id]: "confirmar" | "liberar" }
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    planDiaSiguiente()
      .then((data) => { setPlan(data || []); setError(null); })
      .catch(() => setError("No se pudo cargar tu plan de mañana"))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const confirmar = async (s) => {
    setOcupado((o) => ({ ...o, [s.id]: "confirmar" }));
    try {
      const actualizada = await confirmarDia(s.id);
      setPlan((p) => p.map((x) => (x.id === s.id ? actualizada : x)));
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo confirmar la solicitud");
    } finally {
      setOcupado((o) => ({ ...o, [s.id]: null }));
    }
  };

  const liberar = async (s) => {
    setOcupado((o) => ({ ...o, [s.id]: "liberar" }));
    try {
      await liberarSolicitud(s.id);
      setPlan((p) => p.filter((x) => x.id !== s.id));
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo liberar la solicitud");
    } finally {
      setOcupado((o) => ({ ...o, [s.id]: null }));
    }
  };

  const confirmadas = useMemo(() => plan.filter((s) => s.estado === "confirmada"), [plan]);
  const pendientes  = useMemo(() => plan.filter((s) => s.estado === "asignada"), [plan]);
  const kgTotales   = useMemo(() => plan.reduce((acc, s) => acc + (s.cantidad_kg || 0), 0), [plan]);

  // La previsualización usa las confirmadas; si aún no hay, todo el plan.
  const paraRuta = (confirmadas.length > 0 ? confirmadas : plan)
    .filter((s) => s.latitud != null && s.longitud != null);

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="reciclador" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 1120, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Planificación"
          title={<span>Mi día de <span style={{ color: "var(--orange)", fontStyle: "italic" }}>mañana</span></span>}
          sub={`${fechaManana()} — confirma las recolecciones que harás o libéralas para otro reciclador.`}
          right={
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { n: plan.length, label: "paradas" },
                { n: confirmadas.length, label: "confirmadas" },
                { n: `${Math.round(kgTotales * 10) / 10} kg`, label: "estimados" },
              ].map((m) => (
                <div key={m.label} style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 14, padding: "8px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--green-deep)" }}>{m.n}</div>
                  <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 11, letterSpacing: 0.4, color: "var(--ink-soft)", textTransform: "uppercase" }}>{m.label}</div>
                </div>
              ))}
            </div>
          }
        />

        {error && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--pink)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--pink)" }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>Cargando tu plan…</div>
        ) : plan.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--cream-card)", border: "1.5px dashed var(--line)", borderRadius: 20, color: "var(--ink-soft)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
              <Icon name="calendar" size={26} stroke="var(--ink-soft)" />
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 15, margin: 0 }}>
              No tienes recolecciones asignadas para mañana.<br />
              Toma solicitudes desde tu panel para armar tu día.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 22, alignItems: "start" }} className="rec-grid">
            {/* columna izq: previsualización de la ruta */}
            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="map" size={22} stroke="var(--green)" />Ruta estimada
              </h2>
              {paraRuta.length > 0 ? (
                <MapaMultiParada solicitudes={paraRuta} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--cream-card)", border: "1.5px dashed var(--line)", borderRadius: 16, fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)" }}>
                  Las solicitudes de mañana no tienen coordenadas para trazar la ruta.
                </div>
              )}
              <p style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", margin: "10px 2px 0" }}>
                La ruta se calcula con {confirmadas.length > 0 ? "tus paradas confirmadas" : "todo tu plan"} usando el optimizador A* multi-punto.
              </p>
            </div>

            {/* columna der: lista de paradas para confirmar/liberar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {pendientes.length > 0 && (
                <p style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: 0 }}>
                  Tienes <strong style={{ color: "var(--orange)" }}>{pendientes.length}</strong> por confirmar — lo que no confirmes puede liberarse para otros recicladores.
                </p>
              )}
              {plan.map((s) => (
                <TarjetaPlan
                  key={s.id}
                  s={s}
                  ocupado={ocupado[s.id]}
                  onConfirmar={confirmar}
                  onLiberar={liberar}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
