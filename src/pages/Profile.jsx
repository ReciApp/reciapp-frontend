import { useEffect, useState } from "react";
import { updateMe } from "../api/users";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const ROL_LABEL = { ciudadano: "Ciudadano", reciclador: "Reciclador", admin: "Administrador" };

export default function Profile() {
  const { user, login: setUser } = useAuth();

  const [form, setForm] = useState({
    nombre: user?.nombre || "",
    celular: user?.celular || "",
    zona_cobertura: user?.zona_cobertura || "",
    disponibilidad_horaria: user?.disponibilidad_horaria || "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || "",
        celular: user.celular || "",
        zona_cobertura: user.zona_cobertura || "",
        disponibilidad_horaria: user.disponibilidad_horaria || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      const updated = await updateMe(form);
      setUser(updated);
      setMsg({ type: "success", text: "Perfil actualizado correctamente." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Error al actualizar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-lg mx-auto mt-10 px-4">
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Mi perfil</h2>
          <p className="text-sm text-gray-500 mb-6">
            {user?.correo} — <span className="text-emerald-600">{ROL_LABEL[user?.rol]}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                required
                value={form.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                type="tel"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {user?.rol === "reciclador" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zona de cobertura</label>
                  <input
                    type="text"
                    name="zona_cobertura"
                    value={form.zona_cobertura}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad horaria</label>
                  <input
                    type="text"
                    name="disponibilidad_horaria"
                    value={form.disponibilidad_horaria}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {msg.text && (
              <p
                className={`text-sm px-4 py-2 rounded-lg border ${
                  msg.type === "success"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}
              >
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
