import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, EyeToggle, PrimaryButton, Icon } from "../components/ui/Primitivos";
import { login as apiLogin } from "../api/auth";
import { getMe } from "../api/users";
import { useAuth } from "../context/AuthContext";

const HOME = { ciudadano: "/ciudadano", reciclador: "/reciclador", admin: "/admin" };

function CtaCard({ iconBg, icon, top, sub, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", background: "var(--cream)", border: "1.5px solid " + (hover ? "var(--green)" : "var(--line)"), borderRadius: 15, padding: "13px 15px", cursor: "pointer", transition: "border-color .15s, transform .14s", transform: hover ? "translateX(3px)" : "none" }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, flexShrink: 0, display: "grid", placeItems: "center", color: "#fff" }}><Icon name={icon} size={20} stroke="#fff" /></span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{top}</span>
        <span style={{ display: "block", fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", marginTop: 1 }}>{sub}</span>
      </span>
      <Icon name="arrowRight" size={18} stroke="var(--ink-soft)" sw={2.2} />
    </button>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!email.trim()) e.email = "Ingresa tu correo electrónico.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "El correo no es válido.";
    if (!pass) e.pass = "Ingresa tu contraseña.";
    else if (pass.length < 6) e.pass = "Mínimo 6 caracteres.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("loading");
    try {
      await apiLogin(email, pass);
      const user = await getMe();
      setUser(user);
      navigate(HOME[user.rol] || "/ciudadano", { replace: true });
    } catch {
      setStatus("idle");
      setErrors({ pass: "Correo o contraseña incorrectos." });
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 400, marginInline: "auto" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 3.6vw, 40px)", color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.18 }}>Bienvenido<br />de <span style={{ color: "var(--green)", fontStyle: "italic" }}>nuevo</span></h2>
        <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", margin: "0 0 26px", fontSize: 15.5 }}>Inicia sesión para seguir reciclando.</p>

        <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <Field label="Correo electrónico" name="email" type="email" autoComplete="email" value={email} onChange={(v) => { setEmail(v); if (errors.email) setErrors({ ...errors, email: null }); }} placeholder="tucorreo@ejemplo.com" error={errors.email} />
          <Field label="Contraseña" name="password" type={show ? "text" : "password"} autoComplete="current-password" value={pass} onChange={(v) => { setPass(v); if (errors.pass) setErrors({ ...errors, pass: null }); }} placeholder="••••••••" error={errors.pass} trailing={<EyeToggle show={show} onClick={() => setShow(!show)} />} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>¿Olvidaste tu contraseña?</a>
          </div>
          <PrimaryButton loading={status === "loading"} full>Iniciar sesión</PrimaryButton>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 18px" }}>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink-soft)", letterSpacing: 0.5 }}>¿AÚN NO TIENES CUENTA?</span>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CtaCard iconBg="var(--green-soft)" icon="user" onClick={() => navigate("/register")} top="Regístrate como ciudadano" sub="Recicla, suma puntos y canjea recompensas" />
          <CtaCard iconBg="var(--orange)" icon="truck" onClick={() => navigate("/register/reciclador")} top="¿Eres reciclador?" sub="Solicita tu registro y empieza a recolectar" />
        </div>
    </div>
  );
}
