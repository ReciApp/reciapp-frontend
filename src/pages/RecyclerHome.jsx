import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function RecyclerHome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto mt-12 px-4 text-center">
        <span className="text-5xl">🚲</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          Bienvenido, {user?.nombre}
        </h2>
        <p className="text-gray-500 mt-2">
          Desde aquí gestionarás tus solicitudes de recolección.
          Esta funcionalidad estará disponible en el Entregable 2.
        </p>

        {user?.estado_validacion === "pendiente" && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-6 py-4 text-sm">
            Tu cuenta está pendiente de validación por el administrador.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <span className="text-3xl">📋</span>
            <h3 className="font-semibold text-gray-700 mt-3">Solicitudes asignadas</h3>
            <p className="text-xs text-gray-400 mt-1">Próximamente — Entregable 2</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <span className="text-3xl">📊</span>
            <h3 className="font-semibold text-gray-700 mt-3">Mi historial</h3>
            <p className="text-xs text-gray-400 mt-1">Próximamente — Entregable 3</p>
          </div>
          <Link
            to="/perfil"
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm hover:bg-emerald-100 transition"
          >
            <span className="text-3xl">👤</span>
            <h3 className="font-semibold text-emerald-700 mt-3">Mi perfil</h3>
            <p className="text-xs text-emerald-500 mt-1">Zona de cobertura y disponibilidad</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
