import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon en Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIconPng,
  shadowUrl: markerShadow,
});

const TIPO_LABEL = {
  plastico: "Plástico 🧴", papel: "Papel 📄", vidrio: "Vidrio 🍶",
  metal: "Metal 🔩", organico: "Orgánico 🍃", electronico: "Electrónico 💻",
};
const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };
const LIMA = [-12.046, -77.043];

function ClickHandler({ onPos }) {
  useMapEvents({ click: (e) => onPos(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function Paso4Confirmacion({ form, onChange, onBack, onSubmit, loading }) {
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const pos = form.latitud && form.longitud ? [form.latitud, form.longitud] : null;

  const usarUbicacion = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange("latitud", coords.latitude);
        onChange("longitud", coords.longitude);
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };

  const handleSubmit = () => {
    if (!form.direccion.trim()) {
      setError("La dirección es obligatoria");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Confirma tu solicitud</h3>
      <p className="text-sm text-gray-500 mb-5">Revisa los datos y agrega tu dirección</p>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">Tipo</span>
          <p className="font-medium text-gray-800">{TIPO_LABEL[form.tipo_residuo]}</p>
        </div>
        <div>
          <span className="text-gray-400">Cantidad</span>
          <p className="font-medium text-gray-800">{form.cantidad_kg} kg</p>
        </div>
        <div>
          <span className="text-gray-400">Fecha</span>
          <p className="font-medium text-gray-800">{form.fecha_recoleccion}</p>
        </div>
        <div>
          <span className="text-gray-400">Franja</span>
          <p className="font-medium text-gray-800">{FRANJA_LABEL[form.franja_horaria]}</p>
        </div>
      </div>

      {/* Dirección */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Dirección <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={form.direccion}
        onChange={(e) => { onChange("direccion", e.target.value); setError(""); }}
        placeholder="Ej: Av. Arequipa 1234, Miraflores"
        className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition mb-1
          ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"}`}
      />
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {/* Mapa */}
      <div className="flex items-center justify-between mb-2 mt-3">
        <span className="text-sm font-medium text-gray-700">Ubicación en mapa <span className="text-gray-400 font-normal">(opcional)</span></span>
        <button
          type="button"
          onClick={usarUbicacion}
          disabled={geoLoading}
          className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
        >
          {geoLoading ? "Obteniendo..." : "📍 Usar mi ubicación"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-2">Haz clic en el mapa para marcar el punto de recolección</p>

      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 200 }}>
        <MapContainer
          center={pos || LIMA}
          zoom={pos ? 15 : 12}
          style={{ height: "100%", width: "100%" }}
          key={pos ? `${pos[0]}-${pos[1]}` : "default"}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPos={(lat, lng) => { onChange("latitud", lat); onChange("longitud", lng); }} />
          {pos && <Marker position={pos} />}
        </MapContainer>
      </div>

      {pos && (
        <p className="text-xs text-emerald-600 mt-1">
          Coordenadas: {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
          <button type="button" onClick={() => { onChange("latitud", null); onChange("longitud", null); }}
            className="ml-2 text-gray-400 hover:text-red-500">✕ quitar</button>
        </p>
      )}

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onBack} disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">
          ← Atrás
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2">
          {loading ? <><span className="animate-spin">⏳</span> Enviando...</> : "✅ Confirmar solicitud"}
        </button>
      </div>
    </div>
  );
}
