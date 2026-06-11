import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, EyeToggle, PrimaryButton, SuccessBox, Icon } from "../components/ui/Primitivos";
import { registerCiudadano, registerReciclador } from "../api/auth";

export default function Register({ tipo = "ciudadano" }) {
  const navigate = useNavigate();
  const esReciclador = tipo === "reciclador";
  const [f, setF] = useState({ nombre: "", email: "", dni: "", celular: "", pass: "", confirm: "", zona: "", disp: "" });
  const [show, setShow] = useState(false);
  const [showC, setShowC] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: null })); };
  const onlyDigits = (v) => v.replace(/\D/g, "");

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!f.nombre.trim()) e.nombre = "Ingresa tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "El correo no es válido.";
    if (f.dni.length !== 8) e.dni = "El DNI debe tener 8 dígitos.";
    if (f.celular.length < 9) e.celular = "Ingresa un celular válido.";
    if (f.pass.length < 8) e.pass = "Mínimo 8 caracteres.";
    if (f.confirm !== f.pass || !f.confirm) e.confirm = "Las contraseñas no coinciden.";
    if (esReciclador) {
      if (!f.zona.trim()) e.zona = "Indica tu zona de cobertura.";
      if (!f.disp.trim()) e.disp = "Indica tu disponibilidad.";
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("loading");
    try {
      const payload = {
        nombre: f.nombre.trim(),
        correo: f.email.trim(),
        dni: f.dni,
        celular: f.celular,
        contrasena: f.pass,
      };
      if (esReciclador) {
        await registerReciclador({ ...payload, zona_cobertura: f.zona.trim(), disponibilidad_horaria: f.disp.trim() });
      } else {
        await registerCiudadano(payload);
      }
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      const detail = err.response?.data?.detail;
      setErrors({ email: typeof detail === "string" ? detail : "No se pudo completar el registro." });
    }
  };

  const accent = esReciclador ? "var(--orange)" : "var(--green)";

  return (
    <div style={{ width: "100%", maxWidth: 468, marginInline: "auto" }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 42, height: 42, borderRadius: 12, background: accent, marginBottom: 12, color: "#fff" }}>
            <Icon name={esReciclador ? "truck" : "user"} size={22} stroke="#fff" />
          </span>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(27px, 3vw, 34px)", color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.14 }}>{esReciclador ? "Registro de Reciclador" : "Crear cuenta"}</h2>
          <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", margin: 0, fontSize: 15 }}>{esReciclador ? "Tu solicitud será revisada por el administrador." : "Únete a ReciApp como ciudadano."}</p>
        </div>

        {status === "done" ? (
          <div>
            <SuccessBox title={esReciclador ? "¡Solicitud enviada!" : "¡Cuenta creada!"} msg={esReciclador ? "Te avisaremos por correo cuando el administrador apruebe tu registro." : "Ya puedes iniciar sesión y empezar a reciclar."} color={accent} />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}><PrimaryButton type="button" onClick={() => navigate("/login")}>Ir a iniciar sesión</PrimaryButton></div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Field label="Nombre completo" name="name" autoComplete="name" value={f.nombre} onChange={(v) => set("nombre", v)} placeholder="Ej: María Quispe" error={errors.nombre} />
            <Field label="Correo electrónico" name="email" type="email" autoComplete="email" value={f.email} onChange={(v) => set("email", v)} placeholder="tucorreo@ejemplo.com" error={errors.email} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="DNI (8 dígitos)" name="dni" inputMode="numeric" maxLength={8} value={f.dni} onChange={(v) => set("dni", onlyDigits(v))} placeholder="12345678" error={errors.dni} />
              <Field label="Celular" name="tel" type="tel" inputMode="numeric" maxLength={9} value={f.celular} onChange={(v) => set("celular", onlyDigits(v))} placeholder="987654321" error={errors.celular} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Contraseña (mín. 8)" name="pass" type={show ? "text" : "password"} value={f.pass} onChange={(v) => set("pass", v)} placeholder="••••••••" error={errors.pass} trailing={<EyeToggle show={show} onClick={() => setShow(!show)} />} />
              <Field label="Confirmar" name="confirm" type={showC ? "text" : "password"} value={f.confirm} onChange={(v) => set("confirm", v)} placeholder="••••••••" error={errors.confirm} trailing={<EyeToggle show={showC} onClick={() => setShowC(!showC)} />} />
            </div>
            {esReciclador && (
              <>
                <Field label="Zona de cobertura" name="zona" value={f.zona} onChange={(v) => set("zona", v)} placeholder="Ej: Miraflores, Surco, Barranco" error={errors.zona} />
                <Field label="Disponibilidad horaria" name="disp" value={f.disp} onChange={(v) => set("disp", v)} placeholder="Ej: mañana, tarde" error={errors.disp} />
              </>
            )}
            <PrimaryButton loading={status === "loading"} full color={accent} deep={esReciclador ? "oklch(0.6 0.15 50)" : "var(--green-deep)"}>
              {esReciclador ? "Enviar solicitud" : "Crear cuenta"}{status !== "loading" && <span style={{ fontSize: 18 }}>→</span>}
            </PrimaryButton>
          </form>
        )}

        <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink-soft)", textAlign: "center", marginTop: 22 }}>
          ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }} style={{ color: "var(--green-deep)", fontWeight: 700, textDecoration: "none" }}>Inicia sesión</a>
        </p>
    </div>
  );
}
