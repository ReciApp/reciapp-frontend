import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { listarSolicitudes } from "../api/solicitudes";
import { getUsuario } from "../api/users";
import { useWebSocket } from "../hooks/useWebSocket";

// ── Config de estados ──────────────────────────────────────────────────────────
const ESTADO = {
  pendiente:  { badge: "bg-amber-100 text-amber-700 border border-amber-200",  icono: "⏳", label: "Pendiente" },
  asignada:   { badge: "bg-blue-100 text-blue-700 border border-blue-200",     icono: "👷", label: "Asignada" },
  en_camino:  { badge: "bg-purple-100 text-purple-700 border border-purple-200", icono: "🚛", label: "En camino" },
  completada: { badge: "bg-green-100 text-green-700 border border-green-200",  icono: "✅", label: "Completada" },
  cancelada:  { badge: "bg-gray-100 text-gray-500 border border-gray-200",     icono: "❌", label: "Cancelada" },
};

const TIPO_ICONO = {
  plastico: "🧴", papel: "📄", vidrio: "🍶",
  metal: "🔩", organico: "🍃", electronico: "💻",
};

const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };

// ── Tarjeta individual ─────────────────────────────────────────────────────────
function SolicitudCard({ solicitud, recicladorCache, onFetchReciclador }) {
  const [abierta, setAbierta] = useState(false);
  const { badge, icono, label } = ESTADO[solicitud.estado] || ESTADO.pendiente;
  const reciclador = solicitud.reciclador_id ? recicladorCache[solicitud.reciclador_id] : null;

  const handleAbrir = () => {
    setAbierta((v) => !v);
    if (!abierta && solicitud.reciclador_id && !recicladorCache[solicitud.reciclador_id]) {
      onFetchReciclador(solicitud.reciclador_id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all">
      {/* Cabecera */}
      <button
        onClick={handleAbrir}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}</span>
          <div>
            <p className="font-semibold text-gray-800 capitalize">{solicitud.tipo_residuo}</p>
            <p className="text-xs text-gray-400">{solicitud.fecha_recoleccion} · {FRANJA_LABEL[solicitud.franja_horaria]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
            {icono} {label}
          </span>
          <span className="text-gray-400 text-sm">{abierta ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Detalle expandible */}
      {abierta && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 text-sm space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Detail label="Cantidad" value={`${solicitud.cantidad_kg} kg`} />
            <Detail label="Dirección" value={solicitud.direccion} />
            <Detail label="Seguimiento" value={
              <span className="font-mono text-xs text-emerald-600 break-all">
                {solicitud.numero_seguimiento}
              </span>
            } />
            <Detail label="Estado" value={`${icono} ${label}`} />
          </div>

          {/* Datos del reciclador asignado */}
          {solicitud.reciclador_id && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">👷 Reciclador asignado</p>
              {reciclador === undefined ? (
                <p className="text-gray-400 text-xs">Cargando datos...</p>
              ) : reciclador ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <Detail label="Nombre" value={reciclador.nombre} />
                  {reciclador.celular && <Detail label="Celular" value={reciclador.celular} />}
                  {reciclador.zona_cobertura && <Detail label="Zona" value={reciclador.zona_cobertura} />}
                  {reciclador.disponibilidad_horaria && (
                    <Detail label="Horario" value={reciclador.disponibilidad_horaria} />
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-xs">No se pudo cargar la información.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}</span>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recicladorCache, setRecicladorCache] = useState({});
  const [wsConectado, setWsConectado] = useState(false);
  const notifRef = useRef([]);

  // Cargar solicitudes al montar
  useEffect(() => {
    listarSolicitudes()
      .then((data) => setSolicitudes(data))
      .catch(() => setError("No se pudo cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch reciclador (con caché para no duplicar peticiones)
  const fetchReciclador = useCallback((recicladorId) => {
    setRecicladorCache((prev) => {
      if (prev[recicladorId] !== undefined) return prev;
      getUsuario(recicladorId)
        .then((data) => setRecicladorCache((c) => ({ ...c, [recicladorId]: data })))
        .catch(() => setRecicladorCache((c) => ({ ...c, [recicladorId]: null })));
      return { ...prev, [recicladorId]: undefined }; // marca como "cargando"
    });
  }, []);

  // Handler WebSocket
  const handleWsMessage = useCallback((msg) => {
    setSolicitudes((prev) => {
      const idx = prev.findIndex((s) => s.id === msg.solicitud_id);
      if (idx === -1) return prev;

      const updated = [...prev];
      if (msg.tipo === "solicitud_asignada") {
        updated[idx] = { ...updated[idx], estado: "asignada", reciclador_id: msg.reciclador_id };
        // Encolar fetch del reciclador
        notifRef.current.push(msg.reciclador_id);
      } else if (msg.tipo === "solicitud_en_camino") {
        updated[idx] = { ...updated[idx], estado: "en_camino" };
      } else if (msg.tipo === "solicitud_reasignando") {
        updated[idx] = { ...updated[idx], estado: "pendiente", reciclador_id: null };
      }
      return updated;
    });
  }, []);

  // Efecto para fetchear recicladores encolados por WS
  useEffect(() => {
    const ids = notifRef.current.splice(0);
    ids.forEach(fetchReciclador);
  }, [solicitudes, fetchReciclador]);

  useWebSocket(handleWsMessage, !loading);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto mt-10 px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis solicitudes</h1>
            <p className="text-sm text-gray-400 mt-0.5">Actualizaciones en tiempo real</p>
          </div>
          <Link
            to="/ciudadano"
            className="text-sm text-emerald-600 hover:underline"
          >
            ← Inicio
          </Link>
        </div>

        {/* Leyenda de estados */}
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(ESTADO).map(([key, { badge, icono, label }]) => (
            <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${badge}`}>
              {icono} {label}
            </span>
          ))}
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2 animate-spin inline-block">⏳</p>
            <p>Cargando solicitudes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && solicitudes.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-medium">Aún no tienes solicitudes</p>
            <Link to="/ciudadano" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">
              Crear tu primera solicitud →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {solicitudes.map((s) => (
            <SolicitudCard
              key={s.id}
              solicitud={s}
              recicladorCache={recicladorCache}
              onFetchReciclador={fetchReciclador}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
