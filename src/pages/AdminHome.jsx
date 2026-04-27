import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getPendingRecicladores, validarReciclador } from "../api/users";

export default function AdminHome() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchPendientes = async () => {
    try {
      const data = await getPendingRecicladores();
      setPendientes(data);
    } catch {
      setMsg("Error al cargar recicladores pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendientes(); }, []);

  const handleValidar = async (id, accion) => {
    try {
      await validarReciclador(id, accion);
      setMsg(`Reciclador ${accion === "aprobado" ? "aprobado" : "rechazado"} correctamente.`);
      fetchPendientes();
    } catch {
      setMsg("Error al validar reciclador.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto mt-10 px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Panel de administración</h2>
        <p className="text-sm text-gray-500 mb-6">
          Métricas y gestión de recompensas disponibles en el Entregable 4.
        </p>

        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Recicladores pendientes de validación
          </h3>

          {msg && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 mb-4">
              {msg}
            </p>
          )}

          {loading && <p className="text-sm text-gray-400">Cargando...</p>}

          {!loading && pendientes.length === 0 && (
            <p className="text-sm text-gray-400">No hay recicladores pendientes de validación.</p>
          )}

          <ul className="space-y-3">
            {pendientes.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{r.nombre}</p>
                  <p className="text-xs text-gray-500">{r.correo}</p>
                  {r.zona_cobertura && (
                    <p className="text-xs text-gray-400">Zona: {r.zona_cobertura}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleValidar(r.id, "aprobado")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleValidar(r.id, "rechazado")}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
