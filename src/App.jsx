import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CitizenHome from "./pages/CitizenHome";
import RecyclerHome from "./pages/RecyclerHome";
import AdminHome from "./pages/AdminHome";
import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const map = { ciudadano: "/ciudadano", reciclador: "/reciclador", admin: "/admin" };
  return <Navigate to={map[user.rol] || "/perfil"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register tipo="ciudadano" />} />
      <Route path="/register/reciclador" element={<Register tipo="reciclador" />} />

      <Route
        path="/ciudadano"
        element={
          <ProtectedRoute roles={["ciudadano"]}>
            <CitizenHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reciclador"
        element={
          <ProtectedRoute roles={["reciclador"]}>
            <RecyclerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/sin-acceso" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
