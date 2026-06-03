import { useState } from "react";
import Temporizador from "./Temporizador";
import { aceptarSolicitud, rechazarSolicitud } from "../../api/solicitudes";

const TIPO_ICONO = {
  plastico: "🧴", papel: "📄", vidrio: "🍶",
  metal: "🔩", organico: "🍃", electronico: "💻",
};
const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };

export default function TarjetaSolicitudEntrante({ solicitud, onAceptada, onRechazada }) {
  const [loading, setLoading] = useState(null); // "aceptar" | "rechazar" | null
  const [error, setError] = useState("");

  const handleAceptar = async () => {
    setLoading("aceptar");
    setError("");
    try {
      const updated = await aceptarSolicitud(solicitud.id);
      onAceptada(updated);
    } catch (e) {
      setError(e.response?.data?.detail || "Error al aceptar");
    } finally {
      setLoading(null);
    }
  };

  const handleRechazar = async () => {
    setLoading("rechazar");
    setError("");
    try {
      await rechazarSolicitud(solicitud.id);
      onRechazada(solicitud.id);
    } catch (e) {
      setError(e.response?.data?.detail || "Error al rechazar");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl shadow-sm p-5 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}</span>
          <div>
            <p className="font-bold text-gray-800 capitalize">{solicitud.tipo_residuo}</p>
            <p className="text-sm text-gray-500">{solicitud.cantidad_kg} kg</p>
          </div>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium shrink-0">
          👷 Nueva solicitud
        </span>
      </div>

      {/* Datos */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <p className="text-xs text-gray-400">Fecha</p>
          <p className="font-medium text-gray-700">{solicitud.fecha_recoleccion}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Franja</p>
          <p className="font-medium text-gray-700">{FRANJA_LABEL[solicitud.franja_horaria]}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">Dirección</p>
          <p className="font-medium text-gray-700">{solicitud.direccion}</p>
        </div>
      </div>

      {/* Temporizador */}
      <Temporizador fechaAsignacion={solicitud.fecha_asignacion} />

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Acciones */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleAceptar}
          disabled={!!loading}
          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 transition text-sm"
        >
          {loading === "aceptar" ? "⏳ Aceptando..." : "✅ Aceptar"}
        </button>
        <button
          onClick={handleRechazar}
          disabled={!!loading}
          className="flex-1 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 transition text-sm"
        >
          {loading === "rechazar" ? "⏳ Rechazando..." : "❌ Rechazar"}
        </button>
      </div>
    </div>
  );
}
