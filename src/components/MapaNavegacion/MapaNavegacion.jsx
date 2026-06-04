import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";
import { useGeolocacion } from "../../hooks/useGeolocacion";

// Fix Leaflet icons en Vite — se ejecuta una sola vez al importar el módulo
if (!L.Icon.Default.prototype._iconFixed) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIconPng,
    shadowUrl:     markerShadow,
  });
  L.Icon.Default.prototype._iconFixed = true;
}

// Centra el mapa suavemente cuando cambia la posición del reciclador
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
}

const PUENTE_PIEDRA = [-11.87, -77.07];

function crearIconos() {
  return {
    reciclador: L.divIcon({
      className: "",
      html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))">🚛</div>',
      iconSize: [30, 30], iconAnchor: [15, 28],
    }),
    destino: L.divIcon({
      className: "",
      html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))">📍</div>',
      iconSize: [30, 30], iconAnchor: [15, 28],
    }),
  };
}

/**
 * Mapa de navegación para el reciclador.
 *
 * Props:
 *  - solicitud  : objeto solicitud con latitud/longitud del destino
 *  - wsRef      : ref del WebSocket (de useWebSocket en el padre)
 *  - rutaData   : { ruta: [[lat,lon],...], distanciaKm, etaMin } o null
 */
export default function MapaNavegacion({ solicitud, wsRef, rutaData }) {
  const [posActual, setPosActual] = useState(null);
  const iconos = crearIconos();

  const destino =
    solicitud.latitud && solicitud.longitud
      ? [solicitud.latitud, solicitud.longitud]
      : null;

  // Recibe GPS y lo envía al backend por WebSocket
  const handlePosicion = useCallback(
    ({ lat, lon }) => {
      setPosActual([lat, lon]);
      const ws = wsRef?.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            tipo:        "ubicacion_reciclador",
            solicitud_id: solicitud.id,
            lat,
            lon,
          })
        );
      }
    },
    [wsRef, solicitud.id]
  );

  useGeolocacion(handlePosicion, true);

  const ruta        = rutaData?.ruta        ?? [];
  const distanciaKm = rutaData?.distanciaKm ?? null;
  const etaMin      = rutaData?.etaMin      ?? null;
  const centro      = posActual || destino || PUENTE_PIEDRA;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-purple-200 shadow-sm">
      {/* Barra de info */}
      <div className="bg-purple-50 px-4 py-2.5 flex items-center justify-between border-b border-purple-100">
        <span className="text-sm font-semibold text-purple-800">
          🗺 Navegación en tiempo real
        </span>
        <div className="flex gap-4 text-xs text-purple-700 font-medium">
          {distanciaKm !== null && <span>📏 {distanciaKm} km</span>}
          {etaMin      !== null && <span>⏱ ~{etaMin} min</span>}
        </div>
      </div>

      {/* Mapa */}
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
            <Marker position={posActual} icon={iconos.reciclador} title="Tu posición actual" />
          )}
          {destino && (
            <Marker position={destino} icon={iconos.destino} title="Destino del ciudadano" />
          )}
          {ruta.length > 1 && (
            <Polyline positions={ruta} color="#7c3aed" weight={5} opacity={0.85} />
          )}
        </MapContainer>
      </div>

      {!posActual && (
        <p className="text-center text-xs text-gray-400 py-2 bg-white">
          Activando GPS… asegúrate de tener el GPS habilitado.
        </p>
      )}
    </div>
  );
}
