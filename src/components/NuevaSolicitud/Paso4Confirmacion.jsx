import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";
import { Icon, Field } from "../ui/Primitivos";
import { MAT, FRANJAS } from "../../lib/datos";

if (!L.Icon.Default.prototype._iconFixed) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIconPng,
    shadowUrl:     markerShadow,
  });
  L.Icon.Default.prototype._iconFixed = true;
}

const ICONO_RECOJO = L.divIcon({
  className: "",
  html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 5px rgba(0,0,0,.4))">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

// Centro por defecto: Puente Piedra, Lima
const PUENTE_PIEDRA = [-11.87, -77.07];

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 0.6 });
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function ResumenRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--cream-card)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name={icon} size={16} stroke="var(--green-deep)" />
      </span>
      <span style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", width: 86, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14.5, color: "var(--ink)", textAlign: "right", flex: 1 }}>{value}</span>
    </div>
  );
}

export default function Paso4Confirmacion({ data, set }) {
  const [mapCenter, setMapCenter] = useState(PUENTE_PIEDRA);

  const tiposLabels = (data.tipos || []).map((t) => MAT[t]?.label).filter(Boolean);
  const franja = FRANJAS.find((f) => f.id === data.franja);
  const pos = data.lat && data.lon ? [data.lat, data.lon] : null;

  const onAddrChange = (v) => {
    set({ direccion: v, lat: null, lon: null });
  };

  const onMapClick = ({ lat, lng }) => {
    set({ lat, lon: lng });
    setMapCenter([lat, lng]);
  };

  return (
    <div className="screen">
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 25, color: "var(--ink)", margin: "0 0 4px" }}>Confirma la recolección</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Busca tu dirección o toca el mapa para marcar el punto.
      </p>

      {/* Campo de dirección */}
      <div style={{ marginBottom: 12 }}>
        <Field
          label="Dirección de recojo"
          name="dir"
          value={data.direccion}
          onChange={onAddrChange}
          placeholder="Escribe tu calle o sector…"
        />
      </div>

      {/* Mapa Leaflet real */}
      <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid " + (pos ? "var(--green-soft)" : "var(--line)"), marginBottom: 10, transition: "border-color .2s" }}>
        <MapContainer
          center={PUENTE_PIEDRA}
          zoom={15}
          style={{ height: 200, width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={mapCenter} />
          <MapClickHandler onMapClick={onMapClick} />
          {pos && <Marker position={pos} icon={ICONO_RECOJO} title="Punto de recojo" />}
        </MapContainer>
      </div>

      <p style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: pos ? "var(--green-deep)" : "var(--ink-soft)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 5 }}>
        {pos
          ? <><Icon name="check" size={14} stroke="var(--green-deep)" />Punto confirmado · toca el mapa para ajustar</>
          : <><Icon name="pin" size={14} stroke="var(--ink-soft)" />Toca el mapa para fijar el punto de recojo</>
        }
      </p>

      {/* Resumen */}
      <div style={{ background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 16, padding: "16px 18px" }}>
        <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-soft)" }}>Resumen</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <ResumenRow icon="recycle" label="Materiales" value={tiposLabels.length ? tiposLabels.join(", ") : "—"} />
          <ResumenRow icon="weight" label="Cantidad" value={data.kg + " kg aprox."} />
          <ResumenRow icon="calendar" label="Horario" value={franja ? franja.label + " · " + franja.rango : "—"} />
        </div>
      </div>
    </div>
  );
}
