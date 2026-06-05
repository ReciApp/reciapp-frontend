import { useState, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Splash         from "./pages/Splash";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Profile        from "./pages/Profile";
import CitizenHome    from "./pages/CitizenHome";
import MisSolicitudes from "./pages/MisSolicitudes";
import RecyclerHome   from "./pages/RecyclerHome";
import AdminHome      from "./pages/AdminHome";
import NotFound       from "./pages/NotFound";

const HAS_SEEN_KEY = "reciapp_splash_seen";
const shouldShowSplash = () => !sessionStorage.getItem(HAS_SEEN_KEY);

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const map = { ciudadano:"/ciudadano", reciclador:"/reciclador", admin:"/admin" };
  return <Navigate to={map[user.rol] || "/perfil"} replace />;
}

function LoginWithSplash() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const handleDone = useCallback(() => { sessionStorage.setItem(HAS_SEEN_KEY,"1"); setShowSplash(false); }, []);
  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <Splash key="splash" onDone={handleDone} />}
      </AnimatePresence>
      <div style={{ opacity:showSplash?0:1, transition:"opacity 0.4s ease 0.1s", pointerEvents:showSplash?"none":"auto" }}>
        <Login />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<RootRedirect />} />
      <Route path="/login"   element={<LoginWithSplash />} />
      <Route path="/register"            element={<Register tipo="ciudadano" />} />
      <Route path="/register/reciclador" element={<Register tipo="reciclador" />} />
      <Route path="/ciudadano"           element={<ProtectedRoute roles={["ciudadano"]}><CitizenHome /></ProtectedRoute>} />
      <Route path="/ciudadano/solicitudes" element={<ProtectedRoute roles={["ciudadano"]}><MisSolicitudes /></ProtectedRoute>} />
      <Route path="/reciclador"          element={<ProtectedRoute roles={["reciclador"]}><RecyclerHome /></ProtectedRoute>} />
      <Route path="/admin"               element={<ProtectedRoute roles={["admin"]}><AdminHome /></ProtectedRoute>} />
      <Route path="/perfil"              element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/sin-acceso" element={<NotFound />} />
      <Route path="*"           element={<NotFound />} />
    </Routes>
  );
}
