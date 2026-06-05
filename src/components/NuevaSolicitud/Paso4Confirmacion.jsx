import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAddressAutocomplete } from "../../hooks/useAddressAutocomplete";

import markerIcon2x  from "leaflet/dist/images/marker-icon-2x.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadow  from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIconPng,
  shadowUrl:     markerShadow,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const TIPO_LABEL = {
  plastico:    "Plástico 🧴",  papel:     "Papel 📄",
  vidrio:      "Vidrio 🍶",    metal:     "Metal 🔩",
  organico:    "Orgánico 🍃",  electronico: "Electrónico 💻",
};
const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };
const LIMA = [-12.046, -77.043];

const TIPO_ECO = {
  plastico: 10, papel: 5, vidrio: 8,
  metal: 15, organico: 3, electronico: 20,
};

// ── Map helpers ───────────────────────────────────────────────────────────────
function ClickHandler({ onPos }) {
  useMapEvents({ click: (e) => onPos(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
      borderRadius: "var(--radius-sm)", padding: "0.8rem 1rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem" }}>{icon}</span>
        <span style={{ color: "rgba(255,255,255,.4)", fontSize: "0.72rem", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </span>
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "white", fontSize: "0.95rem" }}>
        {value}
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Paso4Confirmacion({ form, onChange, onBack, onSubmit, loading }) {
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [inputDir, setInputDir] = useState(form.direccion || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const { suggestions, loading: sugestLoading, search, clear } = useAddressAutocomplete();

  const pos = form.latitud && form.longitud ? [form.latitud, form.longitud] : null;
  const ecoEstimado = Math.round((TIPO_ECO[form.tipo_residuo] || 0) * (parseFloat(form.cantidad_kg) || 1));

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

  const handleDirChange = (val) => {
    setInputDir(val);
    onChange("direccion", val);
    setError("");
    search(val);
    setShowSuggestions(true);
  };

  const pickSuggestion = (s) => {
    setInputDir(s.short || s.label);
    onChange("direccion", s.short || s.label);
    onChange("latitud", s.lat);
    onChange("longitud", s.lon);
    clear();
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!form.direccion.trim()) { setError("La dirección es obligatoria"); return; }
    setError("");
    onSubmit();
  };

  return (
    <div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        color: "white", fontSize: "1.1rem", marginBottom: "0.35rem",
      }}>
        Confirma tu solicitud
      </h3>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        Revisa los datos y agrega tu dirección
      </p>

      {/* Summary 4 cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "0.6rem", marginBottom: "1.25rem",
      }}>
        <SummaryCard label="Tipo"     value={TIPO_LABEL[form.tipo_residuo] || "—"}  icon="♻" />
        <SummaryCard label="Cantidad" value={`${form.cantidad_kg} kg`}              icon="⚖" />
        <SummaryCard label="Fecha"    value={form.fecha_recoleccion || "—"}          icon="📅" />
        <SummaryCard label="Franja"   value={FRANJA_LABEL[form.franja_horaria] || "—"} icon="🕐" />
      </div>

      {/* Eco-créditos estimados */}
      <div style={{
        background: "rgba(132,204,22,.08)", border: "1px solid rgba(132,204,22,.2)",
        borderRadius: "var(--radius-sm)", padding: "0.7rem 1rem",
        display: "flex", alignItems: "center", gap: "0.6rem",
        marginBottom: "1.25rem",
      }}>
        <span style={{ fontSize: "1.2rem" }}>🌿</span>
        <div>
          <span style={{ color: "rgba(255,255,255,.5)", fontSize: "0.75rem" }}>Eco-créditos estimados</span>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "#a3e635", fontSize: "1.1rem" }}>
            +{ecoEstimado} puntos
          </p>
        </div>
      </div>

      {/* Dirección con autocomplete */}
      <label style={{
        display: "block", fontFamily: "var(--font-display)", fontWeight: 600,
        fontSize: "0.85rem", color: "rgba(255,255,255,.6)", marginBottom: "0.4rem",
      }}>
        Dirección <span style={{ color: "#f87171" }}>*</span>
      </label>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={inputDir}
          onChange={(e) => handleDirChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
          placeholder="Ej: Av. Arequipa 1234, Miraflores"
          className="input"
          style={{
            borderColor: error ? "rgba(239,68,68,.5)" : undefined,
          }}
        />
        {sugestLoading && (
          <span style={{
            position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)",
            color: "rgba(255,255,255,.3)", fontSize: "0.8rem",
          }}>
            ⏳
          </span>
        )}

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                background: "rgba(11,31,18,.95)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.12)", borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => pickSuggestion(s)}
                  style={{
                    width: "100%", textAlign: "left", padding: "0.65rem 0.9rem",
                    background: "transparent", border: "none", cursor: "pointer",
                    borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none",
                    transition: "background .15s",
                    color: "white", fontFamily: "var(--font-body)", fontSize: "0.83rem",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(132,204,22,.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color: "#a3e635", fontSize: "0.75rem" }}>📍 </span>
                  <span style={{ color: "rgba(255,255,255,.85)" }}>{s.short || s.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "0.35rem" }}>{error}</p>}

      {/* Mapa */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: "1.1rem", marginBottom: "0.5rem",
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: "0.85rem", color: "rgba(255,255,255,.6)",
        }}>
          Ubicación en mapa{" "}
          <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 400 }}>(opcional)</span>
        </span>
        <button
          type="button"
          onClick={usarUbicacion}
          disabled={geoLoading}
          style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.78rem",
            color: "#a3e635", background: "none", border: "none", cursor: "pointer",
            opacity: geoLoading ? 0.5 : 1,
          }}
        >
          {geoLoading ? "Obteniendo..." : "📍 Usar mi ubicación"}
        </button>
      </div>
      <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.77rem", marginBottom: "0.5rem" }}>
        Haz clic en el mapa para marcar el punto de recolección
      </p>

      <div style={{
        borderRadius: "var(--radius-sm)", overflow: "hidden",
        border: "1px solid rgba(255,255,255,.1)", height: 200,
      }}>
        <MapContainer
          center={pos || LIMA}
          zoom={pos ? 15 : 12}
          style={{ height: "100%", width: "100%" }}
          key={pos ? `${pos[0]}-${pos[1]}` : "default"}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onPos={(lat, lng) => { onChange("latitud", lat); onChange("longitud", lng); }} />
          {pos && <Marker position={pos} />}
        </MapContainer>
      </div>

      {pos && (
        <p style={{ color: "rgba(163,230,53,.7)", fontSize: "0.77rem", marginTop: "0.4rem" }}>
          {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
          <button
            type="button"
            onClick={() => { onChange("latitud", null); onChange("longitud", null); }}
            style={{
              marginLeft: "0.5rem", background: "none", border: "none",
              color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: "0.78rem",
            }}
          >
            ✕ quitar
          </button>
        </p>
      )}

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onBack}
          disabled={loading}
          className="btn-ghost"
        >
          ← Atrás
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-lime"
          style={{ fontSize: "0.9rem", padding: "0.65rem 1.75rem", opacity: loading ? 0.5 : 1 }}
        >
          {loading ? "⏳ Enviando..." : "✅ Confirmar solicitud"}
        </motion.button>
      </div>
    </div>
  );
}
