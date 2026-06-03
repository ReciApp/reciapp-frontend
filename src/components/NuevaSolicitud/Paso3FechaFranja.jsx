import { useState } from "react";

const FRANJAS = [
  { value: "manana", label: "Mañana",  icon: "🌅", hora: "7:00 – 12:00" },
  { value: "tarde",  label: "Tarde",   icon: "☀️", hora: "12:00 – 18:00" },
  { value: "noche",  label: "Noche",   icon: "🌙", hora: "18:00 – 22:00" },
];

const hoy = new Date().toISOString().split("T")[0];

export default function Paso3FechaFranja({ form, onChange, onNext, onBack }) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!form.fecha_recoleccion) { setError("Selecciona una fecha"); return; }
    if (!form.franja_horaria)    { setError("Selecciona una franja horaria"); return; }
    setError("");
    onNext();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">¿Cuándo prefieres la recolección?</h3>
      <p className="text-sm text-gray-500 mb-5">Elige fecha y franja horaria</p>

      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
      <input
        type="date"
        min={hoy}
        value={form.fecha_recoleccion}
        onChange={(e) => { onChange("fecha_recoleccion", e.target.value); setError(""); }}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition mb-5"
      />

      <label className="block text-sm font-medium text-gray-700 mb-3">Franja horaria</label>
      <div className="grid grid-cols-3 gap-3">
        {FRANJAS.map(({ value, label, icon, hora }) => (
          <button
            key={value}
            type="button"
            onClick={() => { onChange("franja_horaria", value); setError(""); }}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all
              ${form.franja_horaria === value
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-emerald-300"}`}
          >
            <span className="text-2xl mb-1">{icon}</span>
            <span className={`text-sm font-medium ${form.franja_horaria === value ? "text-emerald-700" : "text-gray-700"}`}>
              {label}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">{hora}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
          ← Atrás
        </button>
        <button type="button" onClick={handleNext} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
          Siguiente →
        </button>
      </div>
    </div>
  );
}
