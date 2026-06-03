import { useState } from "react";

export default function Paso2Cantidad({ form, onChange, onNext, onBack }) {
  const [error, setError] = useState("");

  const handleNext = () => {
    const val = parseFloat(form.cantidad_kg);
    if (!form.cantidad_kg || isNaN(val) || val <= 0) {
      setError("Ingresa una cantidad mayor a 0 kg");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">¿Cuántos kilogramos aproximadamente?</h3>
      <p className="text-sm text-gray-500 mb-6">Ingresa el peso estimado del material a reciclar</p>

      <div className="relative">
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={form.cantidad_kg}
          onChange={(e) => {
            onChange("cantidad_kg", e.target.value);
            setError("");
          }}
          placeholder="Ej: 2.5"
          className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-lg focus:outline-none transition
            ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"}`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="mt-8 flex justify-between">
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
