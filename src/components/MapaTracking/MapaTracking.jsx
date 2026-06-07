import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";
import Navbar from "../Navbar";
import { Icon, Avatar } from "../ui/Primitivos";
import { MAT } from "../../lib/datos";
import { useWebSocket } from "../../hooks/useWebSocket";
import { listarSolicitudes } from "../../api/solicitudes";
import { useAuth } from "../../context/AuthContext";

if (!L.Icon.Default.prototype._iconFixed) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIconPng,
    shadowUrl:     markerShadow,
  });
  L.Icon.Default.prototype._iconFixed = true;
}

const ICONOS = {
  reciclador: L.divIcon({
    className: "",
    html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚛</div>',
    iconSize: [30, 30], iconAnchor: [15, 28],
  }),
  destino: L.divIcon({
    className: "",
    html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🏠</div>',
    iconSize: [30, 30], iconAnchor: [15, 28],
  }),
};

const PUENTE_PIEDRA = [-11.87, -77.07];

const PASOS_TRACK = [
  { id: "asignada",   label: "Reciclador asignado", icon: "user" },
  { id: "en_camino",  label: "En camino",            icon: "truck" },
  { id: "completada", label: "Recolección lista",    icon: "check" },
];

const ESTADO_A_PASO = { asignada: 0, en_camino: 1, completada: 2 };

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
}

export default function MapaTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.nombre || user?.name || "ciudadano";

  const [solicitud, setSolicitud] = useState(null);
  const [posRec, setPosRec]       = useState(null);
  const [etaMin, setEtaMin]       = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    listarSolicitudes()
      .then((data) => {
        const found = (data || []).find((s) => String(s.id) === String(id));
        setSolicitud(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleWsMessage = useCallback((msg) => {
    if (msg.tipo === "ubicacion_reciclador" && String(msg.solicitud_id) === String(id)) {
      setPosRec([msg.lat, msg.lon]);
      if (msg.eta_min !== undefined) setEtaMin(msg.eta_min);
    }
    if (msg.tipo === "estado_solicitud" && String(msg.solicitud_id) === String(id)) {
      setSolicitud((prev) => prev ? { ...prev, estado: msg.estado } : prev);
    }
  }, [id]);

  const wsRef = useWebSocket(handleWsMessage, !loading);

  const s = solicitud || {};
  const tipos  = s.tipo_residuo ? [s.tipo_residuo] : (s.tipos || []);
  const kg     = s.cantidad_kg ?? s.kg ?? 0;
  const dir    = s.direccion || "—";
  const recNombre = s.reciclador_nombre || s.reciclador?.nombre || "Reciclador";
  const estado = s.estado || "en_camino";
  const pasoActual = ESTADO_A_PASO[estado] ?? 1;

  const destino = s.latitud && s.longitud ? [s.latitud, s.longitud] : null;
  const centro  = posRec || destino || PUENTE_PIEDRA;

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role="ciudadano" onLogout={logout} />
      <main className="screen" style={{ maxWidth: 980, width: "100%", margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 4vw, 36px) 60px" }}>
        <button type="button" onClick={() => navigate("/ciudadano/solicitudes")} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14.5, color: "var(--ink-soft)", padding: "6px 0", marginBottom: 12 }}>
          <Icon name="chevronLeft" size={18} stroke="var(--ink-soft)" />Volver a mis solicitudes
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 22, alignItems: "start" }} className="track-grid">
          {/* Mapa Leaflet real */}
          <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 6px 0 var(--green-deep)" }}>
            {/* Barra de estado */}
            <div style={{ background: "color-mix(in oklch, var(--green) 10%, var(--cream-card))", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--green-soft)" }}>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "var(--green-deep)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 0 3px oklch(0.66 0.15 142 / 0.25)" }} />
                Tu reciclador en vivo
              </span>
              {etaMin !== null && (
                <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 15 }}>⏱</span>~{etaMin} min
                </span>
              )}
            </div>
            <MapContainer center={centro} zoom={15} style={{ height: 400, width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {posRec && <MapUpdater center={posRec} />}
              {posRec && <Marker position={posRec} icon={ICONOS.reciclador} title="Reciclador" />}
              {destino && <Marker position={destino} icon={ICONOS.destino} title="Tu punto de recolección" />}
            </MapContainer>
            {!posRec && (
              <div style={{ textAlign: "center", padding: "8px 16px", background: "var(--cream-card)", fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)" }}>
                Esperando ubicación del reciclador…
              </div>
            )}
          </div>

          {/* Panel info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ETA + reciclador */}
            <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--green-soft)", borderRadius: 22, padding: 22, boxShadow: "0 3px 0 oklch(0.88 0.03 120)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green)", color: "#fff", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12.5, letterSpacing: 0.5, textTransform: "uppercase", padding: "6px 14px", borderRadius: 999 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", opacity: 0.8 }} />
                {estado === "completada" ? "Completado" : estado === "asignada" ? "Asignado" : "En camino"}
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--green-deep)", lineHeight: 1, margin: "16px 0 2px" }}>
                {etaMin !== null ? `~${etaMin} min` : "—"}
              </div>
              <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>tiempo estimado de llegada</p>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
                <Avatar name={recNombre} size={48} bg="var(--green-soft)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{recNombre}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)" }}>
                    <Icon name="star" size={13} stroke="var(--yellow)" />Reciclador verificado
                  </div>
                </div>
                <button type="button" style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--green)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 3px 0 var(--green-deep)" }}>
                  <Icon name="phone" size={19} stroke="#fff" />
                </button>
              </div>
            </div>

            {/* Pasos del recojo */}
            <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 22, padding: 22, boxShadow: "0 2px 0 oklch(0.88 0.03 120)" }}>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-soft)" }}>Estado del recojo</span>
              <div style={{ marginTop: 16 }}>
                {PASOS_TRACK.map((p, i) => {
                  const done   = i < pasoActual;
                  const active = i === pasoActual;
                  return (
                    <div key={p.id} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
                        <span style={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, background: done || active ? "var(--green)" : "var(--cream)", border: "2px solid " + (done || active ? "var(--green)" : "var(--line)"), boxShadow: active ? "0 0 0 4px oklch(0.66 0.15 142 / 0.2)" : "none" }}>
                          <Icon name={done ? "check" : p.icon} size={16} stroke={done || active ? "#fff" : "var(--ink-soft)"} sw={done ? 3 : 2} />
                        </span>
                        {i < PASOS_TRACK.length - 1 && (
                          <span style={{ width: 2.5, flex: 1, minHeight: 22, background: done ? "var(--green)" : "var(--line)", borderRadius: 2 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 16, paddingTop: 4 }}>
                        <div style={{ fontFamily: "var(--sans)", fontWeight: active ? 700 : 600, fontSize: 14.5, color: done || active ? "var(--ink)" : "var(--ink-soft)" }}>{p.label}</div>
                        {active && <div style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--green-deep)", marginTop: 2 }}>En curso ahora…</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Materiales + dirección */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 16, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>{kg} kg ·</span>
                {tipos.map((t) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                    <span style={{ width: 18, height: 18, borderRadius: 6, background: MAT[t]?.color, display: "grid", placeItems: "center" }}>
                      <Icon name={MAT[t]?.icon} size={11} stroke="#fff" />
                    </span>
                    {MAT[t]?.label}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)" }}>
                <Icon name="pin" size={14} stroke="var(--ink-soft)" style={{ flexShrink: 0, marginTop: 1 }} />{dir}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
