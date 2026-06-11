import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";
import { useGeolocacion } from "../../hooks/useGeolocacion";

if (!L.Icon.Default.prototype._iconFixed) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIconPng,
    shadowUrl:     markerShadow,
  });
  L.Icon.Default.prototype._iconFixed = true;
}

// Iconos creados una sola vez fuera del componente para evitar recrearlos en cada render
const ICONOS = {
  reciclador: L.divIcon({
    className: "",
    html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚛</div>',
    iconSize: [30, 30], iconAnchor: [15, 28],
  }),
  destino: L.divIcon({
    className: "",
    html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">📍</div>',
    iconSize: [30, 30], iconAnchor: [15, 28],
  }),
};

// Centro por defecto: Puente Piedra, Lima
const PUENTE_PIEDRA = [-11.87, -77.07];

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
}

/**
 * Mapa de navegación para el reciclador.
 *
 * Props:
 *  - solicitud  : objeto solicitud del backend con `.id`, `.latitud`, `.longitud`
 *  - wsRef      : ref al WebSocket (de useWebSocket en RecyclerHome)
 *  - rutaData   : { ruta: [[lat,lon],...], distanciaKm, etaMin } enviado por el backend
 *                 tras calcular A* — null mientras no llegue la primera ruta
 */
export default function MapaNavegacion({ solicitud, wsRef, rutaData }) {
  const [posActual, setPosActual] = useState(null);

  const destino =
    solicitud?.latitud && solicitud?.longitud
      ? [solicitud.latitud, solicitud.longitud]
      : null;

  // Recibe posición GPS y la envía al backend para que recalcule la ruta con A*
  const handlePosicion = useCallback(
    ({ lat, lon }) => {
      setPosActual([lat, lon]);
      const ws = wsRef?.current;
      if (ws?.readyState === WebSocket.OPEN && solicitud?.id) {
        ws.send(JSON.stringify({
          tipo:         "ubicacion_reciclador",
          solicitud_id: solicitud.id,
          lat,
          lon,
        }));
      }
    },
    [wsRef, solicitud?.id]
  );

  // Solo activa el GPS cuando hay una solicitud activa
  useGeolocacion(handlePosicion, !!solicitud);

  // Reenvía la última posición cada 10 s aunque no haya movimiento: cubre el
  // primer fix GPS perdido si el WS aún no estaba abierto y mantiene fresca
  // la ubicación que ve el ciudadano cuando el reciclador está detenido.
  useEffect(() => {
    if (!solicitud?.id || !posActual) return;
    const intervalo = setInterval(() => {
      const ws = wsRef?.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          tipo:         "ubicacion_reciclador",
          solicitud_id: solicitud.id,
          lat:          posActual[0],
          lon:          posActual[1],
        }));
      }
    }, 10000);
    return () => clearInterval(intervalo);
  }, [solicitud?.id, posActual, wsRef]);

  const ruta        = rutaData?.ruta        ?? [];
  const distanciaKm = rutaData?.distanciaKm ?? null;
  const etaMin      = rutaData?.etaMin      ?? null;
  const centro      = posActual || destino || PUENTE_PIEDRA;

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--green-soft)" }}>
      {/* Barra de estado */}
      <div style={{
        background: "color-mix(in oklch, var(--green) 10%, var(--cream-card))",
        padding: "9px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--green-soft)",
      }}>
        <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "var(--green-deep)", display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", flexShrink: 0, boxShadow: "0 0 0 3px oklch(0.66 0.15 142 / 0.25)" }} />
          Navegación en tiempo real
        </span>
        <div style={{ display: "flex", gap: 16, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12.5, color: "var(--ink-soft)" }}>
          {distanciaKm !== null && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14 }}>📏</span>{distanciaKm} km
            </span>
          )}
          {etaMin !== null && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--green-deep)" }}>
              <span style={{ fontSize: 14 }}>⏱</span>~{etaMin} min
            </span>
          )}
        </div>
      </div>

      {/* Mapa Leaflet */}
      <div style={{ height: 300 }}>
        <MapContainer
          center={centro}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {posActual && <MapUpdater center={posActual} />}
          {posActual && (
            <Marker position={posActual} icon={ICONOS.reciclador} title="Tu posición actual" />
          )}
          {destino && (
            <Marker position={destino} icon={ICONOS.destino} title="Destino del ciudadano" />
          )}
          {/* Ruta calculada por A* en el backend */}
          {ruta.length > 1 && (
            <Polyline
              positions={ruta}
              pathOptions={{ color: "#3d9149", weight: 5, opacity: 0.88 }}
            />
          )}
        </MapContainer>
      </div>

      {!posActual && (
        <div style={{
          textAlign: "center", padding: "7px 14px",
          background: "var(--cream-card)",
          fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)",
        }}>
          Activando GPS… asegúrate de tener la ubicación habilitada.
        </div>
      )}
    </div>
  );
}
