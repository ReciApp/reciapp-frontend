import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";

if (!L.Icon.Default.prototype._iconFixed) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIconPng,
    shadowUrl:     markerShadow,
  });
  L.Icon.Default.prototype._iconFixed = true;
}

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
      html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))">🏠</div>',
      iconSize: [30, 30], iconAnchor: [15, 28],
    }),
  };
}

/**
 * Vista de tracking para el ciudadano.
 *
 * Props:
 *  - solicitud          : objeto solicitud (tiene latitud/longitud del punto de recolección)
 *  - posicionReciclador : { lat, lon, etaMin } recibido por WebSocket, o null
 */
export default function MapaTracking({ solicitud, posicionReciclador }) {
  const iconos = crearIconos();
  const destino =
    solicitud.latitud && solicitud.longitud
      ? [solicitud.latitud, solicitud.longitud]
      : null;

  const posRec  = posicionReciclador ? [posicionReciclador.lat, posicionReciclador.lon] : null;
  const etaMin  = posicionReciclador?.etaMin ?? null;
  const centro  = posRec || destino || PUENTE_PIEDRA;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-purple-200 shadow-sm">
      {/* Barra de info */}
      <div className="bg-purple-50 px-4 py-2.5 flex items-center justify-between border-b border-purple-100">
        <span className="text-sm font-semibold text-purple-800">
          📍 Reciclador en camino
        </span>
        {etaMin !== null && (
          <span className="text-xs font-medium text-purple-700">⏱ ~{etaMin} min</span>
        )}
      </div>

      {/* Mapa */}
      <div style={{ height: 280 }}>
        <MapContainer
          center={centro}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {posRec && <MapUpdater center={posRec} />}
          {posRec && (
            <Marker position={posRec} icon={iconos.reciclador} title="Reciclador" />
          )}
          {destino && (
            <Marker position={destino} icon={iconos.destino} title="Tu punto de recolección" />
          )}
        </MapContainer>
      </div>

      {!posRec && (
        <p className="text-center text-xs text-gray-400 py-2 bg-white">
          Esperando ubicación del reciclador…
        </p>
      )}
    </div>
  );
}
