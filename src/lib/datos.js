export const MATERIALES = [
  { id: "papel",        label: "Papel",        color: "var(--yellow)",     icon: "clipboard" },
  { id: "carton",       label: "Cartón",       color: "var(--orange)",     icon: "home" },
  { id: "plastico",     label: "Plástico",     color: "var(--pink)",       icon: "recycle" },
  { id: "vidrio",       label: "Vidrio",       color: "var(--green)",      icon: "weight" },
  { id: "metal",        label: "Metal",        color: "var(--ink-soft)",   icon: "shield" },
  { id: "organico",     label: "Orgánico",     color: "var(--green-deep)", icon: "leaf" },
  { id: "electronicos", label: "Electrónicos", color: "var(--blue)",       icon: "settings" },
];
export const MAT = Object.fromEntries(MATERIALES.map((m) => [m.id, m]));

export const ESTADOS = {
  pendiente:              { label: "Pendiente",     color: "var(--yellow)",     fg: "var(--ink)", icon: "clock" },
  asignada:               { label: "Asignada",      color: "var(--blue)",       fg: "#fff",       icon: "user" },
  en_camino:              { label: "En camino",     color: "var(--green-soft)", fg: "#fff",       icon: "truck" },
  pendiente_confirmacion: { label: "Por confirmar", color: "var(--orange)",     fg: "#fff",       icon: "alert" },
  completada:             { label: "Completada",    color: "var(--green)",      fg: "#fff",       icon: "check" },
  cancelada:              { label: "Cancelada",     color: "var(--pink)",       fg: "#fff",       icon: "x" },
};

export const FRANJAS = [
  { id: "manana", label: "Mañana", rango: "8:00 – 12:00",  icon: "gps" },
  { id: "tarde",  label: "Tarde",  rango: "12:00 – 17:00", icon: "clock" },
  { id: "noche",  label: "Noche",  rango: "17:00 – 21:00", icon: "star" },
];

export const DIRECCIONES = [
  "Av. Larco 345, Miraflores", "Calle Berlín 720, Miraflores", "Av. Pardo 1200, Miraflores",
  "Jr. Lima 234, Barranco", "Av. El Sol 890, San Isidro", "Calle Las Begonias 415, San Isidro",
];

export const SOLICITUDES_DEMO = [
  { id: "RS-1042", tipos: ["plastico", "papel"], kg: 8, fecha: "Hoy", franja: "Tarde", direccion: "Av. Larco 345, Miraflores", estado: "en_camino", reciclador: "Juan Mamani", eta: "12 min" },
  { id: "RS-1039", tipos: ["vidrio"], kg: 5, fecha: "Hoy", franja: "Mañana", direccion: "Av. Larco 345, Miraflores", estado: "pendiente_confirmacion", reciclador: "Rosa Huamán" },
  { id: "RS-1031", tipos: ["carton", "metal"], kg: 14, fecha: "Ayer", franja: "Tarde", direccion: "Calle Berlín 720, Miraflores", estado: "asignada", reciclador: "Pedro Ríos" },
  { id: "RS-1024", tipos: ["electronicos"], kg: 3, fecha: "2 jun", franja: "Mañana", direccion: "Av. Pardo 1200, Miraflores", estado: "completada", reciclador: "Rosa Huamán" },
  { id: "RS-1018", tipos: ["organico"], kg: 6, fecha: "30 may", franja: "Noche", direccion: "Av. Larco 345, Miraflores", estado: "cancelada", reciclador: "—" },
  { id: "RS-1051", tipos: ["papel", "carton", "plastico"], kg: 11, fecha: "Hoy", franja: "Tarde", direccion: "Av. Larco 345, Miraflores", estado: "pendiente", reciclador: "—" },
];

export const ENTRANTES_DEMO = [
  { id: "RS-1051", ciudadano: "Lucía Torres", tipos: ["papel", "carton", "plastico"], kg: 11, dist: "0.8 km", franja: "Tarde", direccion: "Av. Larco 345, Miraflores", min: 4 },
  { id: "RS-1050", ciudadano: "Carlos Vega", tipos: ["vidrio"], kg: 6, dist: "1.4 km", franja: "Tarde", direccion: "Calle Berlín 720, Miraflores", min: 8 },
  { id: "RS-1048", ciudadano: "Ana Ríos", tipos: ["metal", "electronicos"], kg: 9, dist: "2.1 km", franja: "Noche", direccion: "Av. Pardo 1200, Miraflores", min: 12 },
];

export const RECICLADORES_PENDIENTES = [
  { id: "U-218", nombre: "Mateo Flores", dni: "45128876", zona: "Surco, Surquillo", disp: "mañana, tarde", celular: "987112233", fecha: "Hace 2 h" },
  { id: "U-217", nombre: "Carmen Salas", dni: "40991234", zona: "San Isidro", disp: "tarde", celular: "986554477", fecha: "Hace 5 h" },
  { id: "U-215", nombre: "Diego Pinto", dni: "47556621", zona: "Barranco, Chorrillos", disp: "mañana, noche", celular: "985221199", fecha: "Ayer" },
];

export const ACTIVIDAD = [
  { estado: "completada", txt: "Rosa Huamán completó RS-1024", t: "hace 8 min" },
  { estado: "en_camino", txt: "Juan Mamani aceptó RS-1042", t: "hace 21 min" },
  { estado: "pendiente", txt: "Lucía Torres creó RS-1051", t: "hace 34 min" },
  { estado: "cancelada", txt: "RS-1018 fue cancelada", t: "hace 1 h" },
];

export function inferRole(email) {
  const e = (email || "").toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("recicla")) return "reciclador";
  return "ciudadano";
}
