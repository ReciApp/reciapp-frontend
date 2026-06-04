import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { listarSolicitudes, obtenerSolicitud } from "../api/solicitudes";
import TarjetaSolicitudEntrante from "../components/PanelReciclador/TarjetaSolicitudEntrante";
import MapaNavegacion from "../components/MapaNavegacion/MapaNavegacion";

const TIPO_ICONO = {
  plastico: "🧴", papel: "📄", vidrio: "🍶",
  metal: "🔩", organico: "🍃", electronico: "💻",
};
const FRANJA_LABEL = { manana: "Mañana 🌅", tarde: "Tarde ☀️", noche: "Noche 🌙" };

// ── Tarjeta "en camino" con mapa de navegación ────────────────────────────────
function TarjetaEnCamino({ solicitud, wsRef, rutaData }) {
  return (
    <div className="bg-white border border-purple-200 rounded-xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-2xl">{TIPO_ICONO[solicitud.tipo_residuo] ?? "♻"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 capitalize">{solicitud.tipo_residuo} · {solicitud.cantidad_kg} kg</p>
          <p className="text-xs text-gray-500 truncate">{solicitud.direccion}</p>
          <p className="text-xs text-gray-400">{solicitud.fecha_recoleccion} · {FRANJA_LABEL[solicitud.franja_horaria]}</p>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium shrink-0">
          🚛 En camino
        </span>
      </div>
      <MapaNavegacion solicitud={solicitud} wsRef={wsRef} rutaData={rutaData} />
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function RecyclerHome() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rutasActivas, setRutasActivas] = useState({}); // solicitud_id → {ruta, distanciaKm, etaMin}

  // Carga inicial
  useEffect(() => {
    listarSolicitudes()
      .then(setSolicitudes)
      .catch(() => setError("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, []);

  // WS: nueva_solicitud y ruta_actualizada
  const handleWsMessage = useCallback(async (msg) => {
    if (msg.tipo === "nueva_solicitud") {
      try {
        const solicitud = await obtenerSolicitud(msg.solicitud_id);
        setSolicitudes((prev) => {
          if (prev.some((s) => s.id === solicitud.id)) return prev;
          return [solicitud, ...prev];
        });
      } catch {}
    } else if (msg.tipo === "ruta_actualizada") {
      setRutasActivas((prev) => ({
        ...prev,
        [msg.solicitud_id]: {
          ruta:        msg.ruta,
          distanciaKm: msg.distancia_km,
          etaMin:      msg.eta_min,
        },
      }));
    }
  }, []);

  const wsRef = useWebSocket(handleWsMessage, !loading);

  // Callbacks de acciones
  const handleAceptada = (updated) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleRechazada = (id) => {
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  };

  // Clasificación
  const entrantes  = solicitudes.filter((s) => s.estado === "asignada");
  const enCamino   = solicitudes.filter((s) => s.estado === "en_camino");
  const completadas = solicitudes.filter((s) => s.estado === "completada");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto mt-10 px-4 pb-12">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel del reciclador</h1>
            <p className="text-sm text-gray-400 mt-0.5">Bienvenido, {user?.nombre}</p>
          </div>
          <Link to="/perfil" className="text-sm text-emerald-600 hover:underline">Mi perfil</Link>
        </div>

        {/* Alerta validación pendiente */}
        {user?.estado_validacion === "pendiente" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 text-sm">
            ⚠️ Tu cuenta está pendiente de validación. El administrador debe aprobarte antes de recibir solicitudes.
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl animate-spin inline-block mb-2">⏳</p>
            <p>Cargando...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-4">{error}</div>
        )}

        {!loading && (
          <>
            {/* ── Cola de solicitudes entrantes ── */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-bold text-gray-800">Solicitudes entrantes</h2>
                {entrantes.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {entrantes.length}
                  </span>
                )}
              </div>

              {entrantes.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-8 text-center text-gray-400">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-sm">Sin solicitudes pendientes.</p>
                  <p className="text-xs mt-1">Te notificaremos en tiempo real cuando llegue una nueva.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entrantes.map((s) => (
                    <TarjetaSolicitudEntrante
                      key={s.id}
                      solicitud={s}
                      onAceptada={handleAceptada}
                      onRechazada={handleRechazada}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── En camino ── */}
            {enCamino.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  En camino
                  <span className="ml-2 text-sm font-normal text-purple-600">({enCamino.length})</span>
                </h2>
                <div className="space-y-3">
                  {enCamino.map((s) => (
                    <TarjetaEnCamino
                      key={s.id}
                      solicitud={s}
                      wsRef={wsRef}
                      rutaData={rutasActivas[s.id] ?? null}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Completadas ── */}
            {completadas.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  Completadas
                  <span className="ml-2 text-sm font-normal text-green-600">({completadas.length})</span>
                </h2>
                <div className="space-y-3">
                  {completadas.map((s) => (
                    <div key={s.id} className="bg-white border border-green-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm opacity-80">
                      <span className="text-2xl">{TIPO_ICONO[s.tipo_residuo] ?? "♻"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 capitalize">{s.tipo_residuo} · {s.cantidad_kg} kg</p>
                        <p className="text-xs text-gray-400">{s.fecha_recoleccion} · {FRANJA_LABEL[s.franja_horaria]}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium shrink-0">
                        ✅ Completada
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
