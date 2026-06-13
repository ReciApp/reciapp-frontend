import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Icon, PageHead, StatusBadge, PrimaryButton, GhostButton } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { listarHistorial, exportarHistorialCsv } from "../api/historial";

const ESTADOS = ["pendiente", "asignada", "confirmada", "en_camino", "pendiente_confirmacion", "completada", "cancelada"];
const TIPOS = ["plastico", "papel", "vidrio", "metal", "organico", "electronicos", "carton"];

const FILTROS_VACIOS = { estado: "", tipo_residuo: "", desde: "", hasta: "" };

const fmtFecha = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};

const inputStyle = {
  fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", background: "var(--cream-card)",
  border: "1.5px solid var(--line)", borderRadius: 10, padding: "8px 10px", outline: "none",
};

/**
 * RECI-60: página de Historial (solo lectura) con filtros y exportación CSV.
 * Consume RECI-59: el backend acota por rol automáticamente.
 */
export default function Historial() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.rol || "ciudadano";
  const userName = user?.nombre || user?.name || "Usuario";

  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS);
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState(null);

  const set = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const cargar = useCallback(async (f) => {
    setCargando(true);
    try {
      const data = await listarHistorial(f);
      setLista(data || []);
      setError(null);
    } catch {
      setError("No se pudo cargar el historial");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(aplicados); }, [cargar, aplicados]);

  const aplicar = () => setAplicados(filtros);
  const limpiar = () => { setFiltros(FILTROS_VACIOS); setAplicados(FILTROS_VACIOS); };

  const exportar = async () => {
    setExportando(true);
    try { await exportarHistorialCsv(aplicados); }
    catch { setError("No se pudo exportar el CSV"); }
    finally { setExportando(false); }
  };

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role={role} onLogout={() => { logout(); navigate("/login", { replace: true }); }} />
      <main className="screen" style={{ maxWidth: 1000, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead
          eyebrow="Trazabilidad"
          title={<span>Historial de <span style={{ color: "var(--green-deep)", fontStyle: "italic" }}>solicitudes</span></span>}
          sub="Consulta y exporta el registro de recolecciones."
          right={
            <PrimaryButton size="sm" type="button" loading={exportando} onClick={exportar}>
              <Icon name="upload" size={16} stroke="#fff" />Exportar CSV
            </PrimaryButton>
          }
        />

        {/* Filtros */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Estado
            <select value={filtros.estado} onChange={set("estado")} style={inputStyle}>
              <option value="">Todos</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Tipo de residuo
            <select value={filtros.tipo_residuo} onChange={set("tipo_residuo")} style={inputStyle}>
              <option value="">Todos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Desde
            <input type="date" value={filtros.desde} onChange={set("desde")} style={inputStyle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
            Hasta
            <input type="date" value={filtros.hasta} onChange={set("hasta")} style={inputStyle} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton size="sm" type="button" onClick={aplicar}>
              <Icon name="search" size={15} stroke="#fff" />Filtrar
            </PrimaryButton>
            <GhostButton onClick={limpiar}>Limpiar</GhostButton>
          </div>
        </div>

        {error && (
          <div style={{ background: "var(--cream-card)", border: "1.5px solid var(--pink)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--sans)", fontSize: 14, color: "var(--pink)" }}>{error}</div>
        )}

        {cargando ? (
          <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>Cargando historial…</div>
        ) : lista.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--cream-card)", border: "1.5px dashed var(--line)", borderRadius: 20, color: "var(--ink-soft)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
              <Icon name="clipboard" size={26} stroke="var(--ink-soft)" />
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 15, margin: 0 }}>No hay solicitudes para los filtros seleccionados.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", background: "var(--cream-card)", border: "1.5px solid var(--line)", borderRadius: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--sans)", fontSize: 13.5, minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--ink-soft)", borderBottom: "1.5px solid var(--line)" }}>
                  {["Seguimiento", "Tipo", "Kg", "Fecha recojo", "Franja", "Estado", "Creada"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", fontWeight: 800 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "11px 14px", color: "var(--ink-soft)", fontFamily: "monospace", fontSize: 12 }}>
                      {(s.numero_seguimiento || String(s.id)).slice(0, 8)}
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--ink)", fontWeight: 600 }}>{s.tipo_residuo}</td>
                    <td style={{ padding: "11px 14px", color: "var(--ink)" }}>{s.cantidad_kg}</td>
                    <td style={{ padding: "11px 14px", color: "var(--ink)" }}>{s.fecha_recoleccion}</td>
                    <td style={{ padding: "11px 14px", color: "var(--ink-soft)" }}>{s.franja_horaria}</td>
                    <td style={{ padding: "11px 14px" }}><StatusBadge estado={s.estado} size="sm" /></td>
                    <td style={{ padding: "11px 14px", color: "var(--ink-soft)" }}>{fmtFecha(s.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!cargando && lista.length > 0 && (
          <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink-soft)", marginTop: 12, textAlign: "right" }}>
            {lista.length} {lista.length === 1 ? "solicitud" : "solicitudes"}
          </p>
        )}
      </main>
    </div>
  );
}
