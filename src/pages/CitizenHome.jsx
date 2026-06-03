import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import NuevaSolicitudModal from "../components/NuevaSolicitud/NuevaSolicitudModal";

export default function CitizenHome() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto mt-12 px-4 text-center">
        <span className="text-5xl">♻</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          Bienvenido, {user?.nombre}
        </h2>
        <p className="text-gray-500 mt-2">
          Desde aquí podrás solicitar recolecciones y consultar tus eco-créditos.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 transition text-left"
          >
            <span className="text-3xl">🗓</span>
            <h3 className="font-semibold text-gray-700 mt-3">Solicitar recolección</h3>
            <p className="text-xs text-gray-400 mt-1">Crea una nueva solicitud de reciclaje</p>
          </button>

          <Link
            to="/ciudadano/solicitudes"
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 transition"
          >
            <span className="text-3xl">📋</span>
            <h3 className="font-semibold text-gray-700 mt-3">Mis solicitudes</h3>
            <p className="text-xs text-gray-400 mt-1">Ver estado de tus recolecciones</p>
          </Link>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <span className="text-3xl">🌿</span>
            <h3 className="font-semibold text-gray-700 mt-3">Mis eco-créditos</h3>
            <p className="text-xs text-gray-400 mt-1">Próximamente — Entregable 3</p>
          </div>

          <Link
            to="/perfil"
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm hover:bg-emerald-100 transition"
          >
            <span className="text-3xl">👤</span>
            <h3 className="font-semibold text-emerald-700 mt-3">Mi perfil</h3>
            <p className="text-xs text-emerald-500 mt-1">Ver y editar tus datos</p>
          </Link>
        </div>
      </main>

      {showModal && (
        <NuevaSolicitudModal
          onClose={() => setShowModal(false)}
          onCreada={() => {}}
        />
      )}
    </div>
  );
}
