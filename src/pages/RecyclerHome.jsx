import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, Avatar, GhostButton } from "../components/ui/Primitivos";
import TarjetaSolicitudEntrante from "../components/PanelReciclador/TarjetaSolicitudEntrante";
import TarjetaSolicitudDisponible from "../components/PanelReciclador/TarjetaSolicitudDisponible";
import FormularioEvidencia from "../components/PanelReciclador/FormularioEvidencia";
import MapaNavegacion from "../components/MapaNavegacion/MapaNavegacion";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { listarSolicitudes, listarDisponibles, aceptarSolicitud, rechazarSolicitud, tomarSolicitud } from "../api/solicitudes";

const normalizeEntrante = (s) => ({
  id: s.id,
  ciudadano: s.ciudadano_nombre || s.ciudadano?.nombre || "Ciudadano",
  dist: s.distancia ? `${s.distancia} km` : "cercano",
  kg: s.cantidad_kg ?? s.kg ?? 0,
  franja: s.franja_horaria || s.franja || "",
  tipos: s.tipo_residuo ? [s.tipo_residuo] : (s.tipos || []),
  direccion: s.direccion || "",
  min: s.fecha_asignacion
    ? Math.max(1, Math.round((new Date(s.fecha_asignacion).getTime() + 5 * 60000 - Date.now()) / 60000))
    : 3,
  _raw: s,
});


export default function RecyclerHome() {
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "reciclador";

  const [disponible, setDisponible] = useState(true);
  const [disponibles, setDisponibles] = useState([]);
  const [entrantes, setEntrantes] = useState([]);
  const [enCamino, setEnCamino] = useState([]);
  const [activaIdx, setActivaIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rutaData, setRutaData] = useState({});

  useEffect(() => {
    listarSolicitudes()
      .then((data) => {
        const asignadas = (data || [])
          .filter((s) => s.estado === "asignada")
          .map(normalizeEntrante);
        setEntrantes(asignadas);
        const enCaminoList = (data || [])
          .filter((s) => s.estado === "en_camino")
          .map(normalizeEntrante);
        setEnCamino(enCaminoList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    listarDisponibles()
      .then((data) => setDisponibles((data || []).map(normalizeEntrante)))
      .catch(() => {});
  }, []);

  const handleWsMessage = useCallback((msg) => {
    if (msg.tipo === "ruta_actualizada") {
      const { solicitud_id, ruta, distancia_km, eta_min } = msg;
      setRutaData((prev) => ({
        ...prev,
        [solicitud_id]: { ruta, distanciaKm: distancia_km, etaMin: eta_min },
      }));
      setEnCamino((prev) =>
        prev.map((s) => s.id === solicitud_id ? { ...s, eta: `${eta_min} min` } : s)
      );
    }
    if (msg.tipo === "solicitud_disponible") {
      setDisponibles((prev) =>
        prev.some((s) => s.id === msg.solicitud_id)
          ? prev
          : [normalizeEntrante({ ...msg, id: msg.solicitud_id }), ...prev]
      );
    }
    if (msg.tipo === "solicitud_no_disponible") {
      setDisponibles((prev) => prev.filter((s) => s.id !== msg.solicitud_id));
    }
  }, []);

  // El WebSocket arranca solo cuando la carga inicial termina
  const wsRef = useWebSocket(handleWsMessage, !loading);

  const tomar = async (s) => {
    try {
      const actualizada = await tomarSolicitud(s.id);
      setDisponibles((d) => d.filter((x) => x.id !== s.id));
      setEnCamino((prev) => {
        const next = [...prev, { ...normalizeEntrante(actualizada), eta: "Calculando…" }];
        setActivaIdx(next.length - 1);
        return next;
      });
      return true;
    } catch (err) {
      // 409: alguien más la tomó primero — la quitamos de la lista igual
      if (err.response?.status === 409) setDisponibles((d) => d.filter((x) => x.id !== s.id));
      return false;
    }
  };

  const aceptar = async (s) => {
    try { await aceptarSolicitud(s.id); } catch {}
    setEntrantes((e) => e.filter((x) => x.id !== s.id));
    setEnCamino((prev) => {
      const next = [...prev, { ...s, eta: "Calculando…" }];
      setActivaIdx(next.length - 1);
      return next;
    });
  };

  const rechazar = async (s) => {
    try { await rechazarSolicitud(s.id); } catch {}
    setEntrantes((e) => e.filter((x) => x.id !== s.id));
  };

  const activa = enCamino[activaIdx] ?? null;
  const activaDisplay = activa || {
    id: null, ciudadano: "—", tipos: [], kg: 0, direccion: "Sin ruta activa", eta: "—",
  };

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="reciclador" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 1120, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead eyebrow="Panel del reciclador" title={<span>Hola, <span style={{ color: "var(--orange)", fontStyle: "italic" }}>{userName}</span></span>} sub="Acepta recolecciones y registra tu ruta del día."
          right={
            <button type="button" onClick={() => setDisponible(!disponible)} style={{ display: "inline-flex", alignItems: "center", gap: 11, background: disponible ? "var(--green)" : "var(--cream-card)", border: "1.5px solid " + (disponible ? "var(--green)" : "var(--line)"), borderRadius: 999, padding: "8px 8px 8px 18px", cursor: "pointer", boxShadow: disponible ? "0 4px 0 var(--green-deep)" : "0 2px 0 oklch(0.88 0.03 120)" }}>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14.5, color: disponible ? "#fff" : "var(--ink-soft)" }}>{disponible ? "Disponible" : "No disponible"}</span>
              <span style={{ width: 44, height: 26, borderRadius: 999, background: disponible ? "var(--green-deep)" : "var(--line)", position: "relative", transition: "background .2s" }}><span style={{ position: "absolute", top: 3, left: disponible ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px oklch(0 0 0 / 0.3)" }} /></span>
            </button>
          } />


        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 22, alignItems: "start" }} className="rec-grid">
          {/* columna izq: ruta activa + evidencia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 0 4px oklch(0.66 0.15 142 / 0.25)" }} />Ruta activa
                {enCamino.length > 0 && (
                  <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "#fff", background: "var(--green)", borderRadius: 999, padding: "2px 10px" }}>{enCamino.length}</span>
                )}
              </h2>

              {enCamino.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {enCamino.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActivaIdx(i)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13,
                        padding: "7px 14px", borderRadius: 999, cursor: "pointer",
                        border: "1.5px solid " + (i === activaIdx ? "var(--green)" : "var(--line)"),
                        background: i === activaIdx ? "var(--green)" : "var(--cream-card)",
                        color: i === activaIdx ? "#fff" : "var(--ink-soft)",
                        boxShadow: i === activaIdx ? "0 3px 0 var(--green-deep)" : "0 2px 0 oklch(0.88 0.03 120)",
                        transition: "all .15s",
                      }}
                    >
                      <Avatar name={s.ciudadano} size={20} bg={i === activaIdx ? "var(--green-deep)" : "var(--green-soft)"} />
                      <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.ciudadano}</span>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--green-soft)", borderRadius: 20, padding: 16, boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
                {/* Mapa Leaflet con GPS + ruta A* */}
                <MapaNavegacion
                  solicitud={activa?._raw ?? null}
                  wsRef={wsRef}
                  rutaData={activa ? (rutaData[activa.id] ?? null) : null}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Avatar name={activaDisplay.ciudadano} size={40} bg="var(--green-soft)" />
                    <div>
                      <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{activaDisplay.ciudadano}</div>
                      <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)" }}>{activaDisplay.direccion}</div>
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--green)", color: "#fff", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, padding: "7px 13px", borderRadius: 999 }}>
                    <Icon name="clock" size={15} stroke="#fff" />ETA {activaDisplay.eta || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                  <GhostButton onClick={() => {}}><Icon name="phone" size={16} stroke="var(--ink-soft)" />Llamar</GhostButton>
                  <GhostButton onClick={() => {}}><Icon name="gps" size={16} stroke="var(--ink-soft)" />Abrir GPS</GhostButton>
                </div>
              </div>
            </div>
            <FormularioEvidencia solicitudId={activa?.id ?? null} onComplete={() => {}} />
          </div>

          {/* columna der: solicitudes disponibles para tomar + asignadas automáticamente */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="clipboard" size={22} stroke="var(--orange)" />Solicitudes disponibles
                <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "#fff", background: "var(--orange)", borderRadius: 999, padding: "2px 10px" }}>{disponibles.length}</span>
              </h2>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>Elige la que más te convenga — al tomarla, empieza tu ruta.</p>
              {!disponible ? (
                <div style={{ textAlign: "center", padding: "50px 20px", background: "var(--cream-card)", border: "1.5px dashed var(--line)", borderRadius: 20, color: "var(--ink-soft)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Icon name="power" size={26} stroke="var(--ink-soft)" /></div>
                  <p style={{ fontFamily: "var(--sans)", fontSize: 15 }}>Estás <strong>no disponible</strong>.<br />Actívate para ver solicitudes.</p>
                </div>
              ) : disponibles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 20, color: "var(--ink-soft)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Icon name="check" size={26} stroke="var(--green)" /></div>
                  <p style={{ fontFamily: "var(--sans)", fontSize: 15 }}>No hay solicitudes disponibles por ahora.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {disponibles.map((s) => <TarjetaSolicitudDisponible key={s.id} s={s} onTomar={tomar} />)}
                </div>
              )}
            </div>

            {entrantes.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--ink)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="bell" size={22} stroke="var(--orange)" />Asignadas para ti
                  <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "#fff", background: "var(--orange)", borderRadius: 999, padding: "2px 10px" }}>{entrantes.length}</span>
                </h2>
                <p style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>Nadie las tomó a tiempo y el sistema te las asignó — acepta o rechaza.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {entrantes.map((s) => <TarjetaSolicitudEntrante key={s.id} s={s} onAceptar={aceptar} onRechazar={rechazar} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
