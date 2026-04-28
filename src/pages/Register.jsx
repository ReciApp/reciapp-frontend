import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerCiudadano, registerReciclador } from "../api/auth";

const FIELDS_CIUDADANO = [
  { name: "nombre", label: "Nombre completo", type: "text", required: true },
  { name: "correo", label: "Correo electrónico", type: "email", required: true },
  { name: "dni", label: "DNI (8 dígitos)", type: "text", required: false, maxLength: 8 },
  { name: "celular", label: "Celular", type: "tel", required: false },
  { name: "contrasena", label: "Contraseña (mínimo 8 caracteres)", type: "password", required: true },
  { name: "confirmar", label: "Confirmar contraseña", type: "password", required: true },
];

const FIELDS_RECICLADOR_EXTRA = [
  { name: "zona_cobertura", label: "Zona de cobertura", type: "text", required: true },
  { name: "disponibilidad_horaria", label: "Disponibilidad horaria (ej: Lun-Vie 8am-5pm)", type: "text", required: true },
];

export default function Register({ tipo = "ciudadano" }) {
  const navigate = useNavigate();
  const isReciclador = tipo === "reciclador";

  const [form, setForm] = useState({
    nombre: "", correo: "", dni: "", celular: "",
    contrasena: "", confirmar: "",
    zona_cobertura: "", disponibilidad_horaria: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.contrasena !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        dni: form.dni || undefined,
        celular: form.celular || undefined,
        contrasena: form.contrasena,
        ...(isReciclador && {
          zona_cobertura: form.zona_cobertura,
          disponibilidad_horaria: form.disponibilidad_horaria,
        }),
      };

      if (isReciclador) {
        await registerReciclador(payload);
        setSuccess("Registro enviado. Tu solicitud será revisada por el administrador.");
      } else {
        await registerCiudadano(payload);
        setSuccess("¡Cuenta creada! Ya puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const allFields = isReciclador
    ? [...FIELDS_CIUDADANO, ...FIELDS_RECICLADOR_EXTRA]
    : FIELDS_CIUDADANO;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">♻</span>
          <h1 className="text-2xl font-bold text-emerald-700 mt-2">ReciApp</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isReciclador ? "Registro de reciclador" : "Crear cuenta ciudadano"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {allFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                maxLength={field.maxLength}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : isReciclador ? "Enviar solicitud" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-emerald-600 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
