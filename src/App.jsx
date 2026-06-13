import { useState, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Splash         from "./pages/Splash";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import AuthPage       from "./pages/AuthPage";
import Profile        from "./pages/Profile";
import CitizenHome    from "./pages/CitizenHome";
import MisSolicitudes from "./pages/MisSolicitudes";
import MisEcoCreditos from "./pages/MisEcoCreditos";
import RecyclerHome   from "./pages/RecyclerHome";
import BacklogReciclador from "./pages/BacklogReciclador";
import MiDiaManana    from "./pages/MiDiaManana";
import AdminHome      from "./pages/AdminHome";
import AdminRewards   from "./pages/AdminRewards";
import NotFound       from "./pages/NotFound";
import MapaTracking   from "./components/MapaTracking/MapaTracking";

const HAS_SEEN_KEY = "reciapp_splash_seen";
const shouldShowSplash = () => !sessionStorage.getItem(HAS_SEEN_KEY);

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const map = { ciudadano:"/ciudadano", reciclador:"/reciclador", admin:"/admin" };
  return <Navigate to={map[user.rol] || "/perfil"} replace />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const handleDone = useCallback(() => { sessionStorage.setItem(HAS_SEEN_KEY, "1"); setShowSplash(false); }, []);

  return (
    <>
      {/* Splash fuera de cualquier motion/layout para que position:fixed cubra toda la pantalla */}
      <AnimatePresence>
        {showSplash && <Splash key="splash" onDone={handleDone} />}
      </AnimatePresence>

      <Routes>
        <Route path="/"        element={<RootRedirect />} />
        <Route element={<AuthPage />}>
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Register tipo="ciudadano" />} />
          <Route path="/register/reciclador" element={<Register tipo="reciclador" />} />
        </Route>
      <Route path="/ciudadano"           element={<ProtectedRoute roles={["ciudadano"]}><CitizenHome /></ProtectedRoute>} />
      <Route path="/ciudadano/solicitudes" element={<ProtectedRoute roles={["ciudadano"]}><MisSolicitudes /></ProtectedRoute>} />
      <Route path="/ciudadano/solicitudes/:id/seguimiento" element={<ProtectedRoute roles={["ciudadano"]}><MapaTracking /></ProtectedRoute>} />
      <Route path="/ciudadano/eco-creditos" element={<ProtectedRoute roles={["ciudadano"]}><MisEcoCreditos /></ProtectedRoute>} />
      <Route path="/reciclador"          element={<ProtectedRoute roles={["reciclador"]}><RecyclerHome /></ProtectedRoute>} />
      <Route path="/reciclador/backlog"  element={<ProtectedRoute roles={["reciclador"]}><BacklogReciclador /></ProtectedRoute>} />
      <Route path="/reciclador/manana"   element={<ProtectedRoute roles={["reciclador"]}><MiDiaManana /></ProtectedRoute>} />
      <Route path="/admin"               element={<ProtectedRoute roles={["admin"]}><AdminHome /></ProtectedRoute>} />
      <Route path="/admin/rewards"       element={<ProtectedRoute roles={["admin"]}><AdminRewards /></ProtectedRoute>} />
      <Route path="/perfil"              element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/sin-acceso" element={<NotFound />} />
      <Route path="*"           element={<NotFound />} />
    </Routes>
    </>
  );
}
