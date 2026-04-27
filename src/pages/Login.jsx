import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { getMe } from "../api/users";
import { useAuth } from "../context/AuthContext";

const ROLE_REDIRECT = {
  ciudadano: "/ciudadano",
  reciclador: "/reciclador",
  admin: "/admin",
};

export default function Login() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();

  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.correo, form.contrasena);
      const user = await getMe();
      setUser(user);
      navigate(ROLE_REDIRECT[user.rol] || "/perfil", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">♻</span>
          <h1 className="text-2xl font-bold text-emerald-700 mt-2">ReciApp</h1>
          <p className="text-gray-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              required
              value={form.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="contrasena"
              required
              value={form.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
          <p>
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-emerald-600 hover:underline font-medium">
              Regístrate como ciudadano
            </Link>
          </p>
          <p>
            ¿Eres reciclador?{" "}
            <Link to="/register/reciclador" className="text-emerald-600 hover:underline font-medium">
              Solicita tu registro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
