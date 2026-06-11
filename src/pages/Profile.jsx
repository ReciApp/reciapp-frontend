import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Icon, PageHead, Avatar, Field, PrimaryButton, Starburst } from "../components/ui/Primitivos";
import { useAuth } from "../context/AuthContext";
import { updateMe } from "../api/users";

export default function Profile() {
  const { user, logout, login: setUser } = useAuth();
  const role = user?.rol || "ciudadano";
  const esReciclador = role === "reciclador";

  const [f, setF] = useState({
    nombre: "",
    celular: "",
    zona: "",
    disp: "",
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setSaved(false); };

  useEffect(() => {
    if (user) {
      setF({
        nombre: user.nombre || user.name || "",
        celular: user.celular || "",
        zona: user.zona_cobertura || "",
        disp: user.disponibilidad_horaria || "",
      });
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { nombre: f.nombre, celular: f.celular };
      if (esReciclador) {
        payload.zona_cobertura = f.zona;
        payload.disponibilidad_horaria = f.disp;
      }
      const updated = await updateMe(payload);
      setUser(updated);
      setSaved(true);
    } catch {}
  };

  const userName = f.nombre || user?.nombre || "usuario";
  const accent = esReciclador ? "var(--orange)" : "var(--green)";

  return (
    <div className="paper-tex" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar user={userName} role={role} onLogout={logout} />
      <main className="screen" style={{ maxWidth: 720, width: "100%", margin: "0 auto", padding: "clamp(26px, 4vw, 44px) clamp(16px, 4vw, 36px) 60px" }}>
        <PageHead eyebrow="Tu cuenta" title="Mi perfil" sub="Actualiza tus datos de contacto." />

        <div style={{ position: "relative", overflow: "hidden", background: "var(--green)", borderRadius: 22, padding: "24px 26px", boxShadow: "0 6px 0 var(--green-deep)", display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
          <div style={{ position: "absolute", right: "-6%", top: "-40%", pointerEvents: "none", animation: "floaty 9s ease-in-out infinite" }}><Starburst points={18} color="var(--yellow)" size={92} inner={0.5} style={{ opacity: 0.85 }} /></div>
          <Avatar name={userName} size={70} bg="var(--cream)" color="var(--green-deep)" />
          <div style={{ position: "relative", zIndex: 2, minWidth: 0 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "#fff", margin: 0, lineHeight: 1.16 }}>{userName}</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8, background: "var(--green-deep)", color: "#fff", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", padding: "5px 13px", borderRadius: 999 }}><Icon name={esReciclador ? "truck" : "user"} size={14} stroke="#fff" />{esReciclador ? "Reciclador" : "Ciudadano"}</span>
          </div>
        </div>

        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Field label="Nombre completo" value={f.nombre} onChange={(v) => set("nombre", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Correo electrónico" value={user?.correo || user?.email || ""} disabled hint="No editable" />
            <Field label="Celular" inputMode="numeric" maxLength={9} value={f.celular} onChange={(v) => set("celular", v.replace(/\D/g, ""))} />
          </div>
          {esReciclador && (
            <>
              <Field label="Zona de cobertura" value={f.zona} onChange={(v) => set("zona", v)} />
              <Field label="Disponibilidad horaria" value={f.disp} onChange={(v) => set("disp", v)} />
            </>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
            <PrimaryButton type="submit" color={accent} deep={esReciclador ? "oklch(0.6 0.15 50)" : "var(--green-deep)"}><Icon name="check" size={18} stroke="#fff" />Guardar cambios</PrimaryButton>
            {saved && <span className="screen" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14, color: "var(--green-deep)" }}><Icon name="check" size={16} stroke="var(--green-deep)" />Guardado</span>}
          </div>
        </form>
      </main>
    </div>
  );
}
