import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = { ciudadano: "/ciudadano", reciclador: "/reciclador", admin: "/admin" };

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to={ROLE_HOME[user.rol] || "/login"} replace />;
  }

  // Soporta tanto el patrón Outlet (<Route element={<ProtectedRoute />}>)
  // como el patrón children (<ProtectedRoute><Page /></ProtectedRoute>).
  return children ?? <Outlet />;
}
