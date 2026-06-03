const TIPOS = [
  { value: "plastico",     label: "Plástico",     icon: "🧴" },
  { value: "papel",        label: "Papel",         icon: "📄" },
  { value: "vidrio",       label: "Vidrio",        icon: "🍶" },
  { value: "metal",        label: "Metal",         icon: "🔩" },
  { value: "organico",     label: "Orgánico",      icon: "🍃" },
  { value: "electronico",  label: "Electrónico",   icon: "💻" },
];

export default function Paso1Tipo({ form, onChange, onNext }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">¿Qué tipo de residuo deseas reciclar?</h3>
      <p className="text-sm text-gray-500 mb-5">Selecciona una categoría</p>

      <div className="grid grid-cols-3 gap-3">
        {TIPOS.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange("tipo_residuo", value)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
              ${form.tipo_residuo === value
                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50"}`}
          >
            <span className="text-3xl mb-2">{icon}</span>
            <span className={`text-xs font-medium ${form.tipo_residuo === value ? "text-emerald-700" : "text-gray-600"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!form.tipo_residuo}
          onClick={onNext}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
