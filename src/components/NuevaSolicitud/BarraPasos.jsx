const PASOS = ["Tipo", "Cantidad", "Fecha", "Confirmar"];

export default function BarraPasos({ actual }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {PASOS.map((label, i) => {
        const n = i + 1;
        const done = n < actual;
        const active = n === actual;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${done ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                  ${active ? "bg-white border-emerald-500 text-emerald-600" : ""}
                  ${!done && !active ? "bg-white border-gray-300 text-gray-400" : ""}`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${active ? "text-emerald-600" : done ? "text-emerald-500" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${done ? "bg-emerald-500" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
