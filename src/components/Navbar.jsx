import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROL_LABEL = {
  ciudadano: "Ciudadano",
  reciclador: "Reciclador",
  admin: "Administrador",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-emerald-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-lg font-bold tracking-tight">
        ♻ ReciApp
      </Link>

      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/perfil" className="hover:underline">
            {user.nombre}
            <span className="ml-1 text-emerald-200">({ROL_LABEL[user.rol]})</span>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}
