import { useState, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";
import { Icon } from "../ui/Primitivos";
import { optimizarRuta } from "../../api/rutas";

if (!L.Icon.Default.prototype._iconFixed) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIconPng,
    shadowUrl:     markerShadow,
  });
  L.Icon.Default.prototype._iconFixed = true;
}

// Centro por defecto: Puente Piedra, Lima
const PUENTE_PIEDRA = [-11.87, -77.07];

const ICONO_ORIGEN = L.divIcon({
  className: "",
  html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚛</div>',
  iconSize: [30, 30], iconAnchor: [15, 28],
});

// Marcador numerado para cada parada de la ruta optimizada
const iconoParada = (orden) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 4px;
      background:var(--green, #3d9149);color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-family:system-ui,sans-serif;font-weight:800;font-size:14px;
      border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.35);
      transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${orden}</span></div>`,
    iconSize: [28, 28], iconAnchor: [14, 26],
  });

function FitBounds({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (puntos.length > 1) {
      map.fitBounds(L.latLngBounds(puntos), { padding: [30, 30] });
    } else if (puntos.length === 1) {
      map.setView(puntos[0], 15);
    }
  }, [puntos, map]);
  return null;
}

/**
 * RECI-76: mapa multi-parada del reciclador.
 *
 * Pide al backend la ruta óptima (A* multi-punto de RECI-75) para las
 * solicitudes recibidas y dibuja las paradas en orden con su tramo de ruta.
 *
 * Props:
 *  - solicitudes : array de solicitudes del backend (con id, latitud, longitud, direccion)
 *  - origen      : [lat, lon] opcional; si falta, se usa el GPS y como último recurso Puente Piedra
 */
export default function MapaMultiParada({ solicitudes, origen = null }) {
  const [origenGps, setOrigenGps] = useState(null);
  const [plan, setPlan]           = useState(null);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState(null);

  const ids = useMemo(
    () => (solicitudes || []).map((s) => s.id).filter(Boolean),
    [solicitudes],
  );

  // Un solo fix de GPS para fijar el punto de partida
  useEffect(() => {
    if (origen || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setOrigenGps([coords.latitude, coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [origen]);

  const partida = origen || origenGps || PUENTE_PIEDRA;

  const optimizar = useCallback(async () => {
    if (ids.length === 0) return;
    setCargando(true);
    setError(null);
    try {
      const data = await optimizarRuta({
        origen_lat: partida[0],
        origen_lon: partida[1],
        solicitud_ids: ids,
      });
      setPlan(data);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo calcular la ruta óptima");
    } finally {
      setCargando(false);
    }
  }, [ids, partida[0], partida[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalcula automáticamente cuando cambian las solicitudes del plan
  useEffect(() => { optimizar(); }, [optimizar]);

  const paradas   = plan?.paradas ?? [];
  const rutaTotal = useMemo(
    () => paradas.flatMap((p) => p.ruta || []),
    [paradas],
  );
  const puntosVista = useMemo(
    () => [partida, ...paradas.map((p) => [p.latitud, p.longitud])],
    [partida, paradas],
  );

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--green-soft)" }}>
      {/* Barra de resumen */}
      <div style={{
        background: "color-mix(in oklch, var(--green) 10%, var(--cream-card))",
        padding: "9px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        borderBottom: "1px solid var(--green-soft)", flexWrap: "wrap",
      }}>
        <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13, color: "var(--green-deep)", display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="map" size={15} stroke="var(--green-deep)" />
          Ruta óptima — {paradas.length} parada{paradas.length === 1 ? "" : "s"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12.5, color: "var(--ink-soft)" }}>
          {plan && (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 14 }}>📏</span>{plan.distancia_total_km} km
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--green-deep)" }}>
                <span style={{ fontSize: 14 }}>⏱</span>~{plan.eta_total_min} min
              </span>
            </>
          )}
          <button
            type="button"
            onClick={optimizar}
            disabled={cargando || ids.length === 0}
            style={{
              fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12.5,
              background: "var(--green)", color: "#fff", border: "none",
              borderRadius: 999, padding: "5px 13px",
              cursor: cargando ? "wait" : "pointer", opacity: cargando ? 0.7 : 1,
              boxShadow: "0 2px 0 var(--green-deep)",
            }}
          >
            {cargando ? "Optimizando…" : "Reoptimizar"}
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div style={{ height: 300 }}>
        <MapContainer center={partida} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds puntos={puntosVista} />

          <Marker position={partida} icon={ICONO_ORIGEN} title="Punto de partida" />
          {paradas.map((p) => (
            <Marker
              key={p.solicitud_id}
              position={[p.latitud, p.longitud]}
              icon={iconoParada(p.orden)}
              title={`${p.orden}. ${p.direccion}`}
            />
          ))}
          {rutaTotal.length > 1 && (
            <Polyline
              positions={rutaTotal}
              pathOptions={{ color: "#3d9149", weight: 5, opacity: 0.88 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Itinerario */}
      {error ? (
        <div style={{ textAlign: "center", padding: "9px 14px", background: "var(--cream-card)", fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--pink)" }}>
          {error}
        </div>
      ) : paradas.length > 0 && (
        <ol style={{ listStyle: "none", margin: 0, padding: "6px 0", background: "var(--cream-card)" }}>
          {paradas.map((p) => (
            <li key={p.solicitud_id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 14px", borderTop: "1px solid var(--line)",
              fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)",
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: "var(--green)", color: "#fff", display: "grid", placeItems: "center",
                fontWeight: 800, fontSize: 12,
              }}>{p.orden}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.direccion}
              </span>
              <span style={{ color: "var(--ink-soft)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {p.distancia_km} km · ~{p.eta_min} min
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
