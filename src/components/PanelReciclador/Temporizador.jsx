import { useState, useEffect } from "react";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

export default function Temporizador({ fechaAsignacion }) {
  const calcRestante = () => {
    if (!fechaAsignacion) return 0;
    const fin = new Date(fechaAsignacion).getTime() + TIMEOUT_MS;
    return Math.max(0, fin - Date.now());
  };

  const [restante, setRestante] = useState(calcRestante);

  useEffect(() => {
    setRestante(calcRestante());
    if (calcRestante() <= 0) return;
    const id = setInterval(() => setRestante(calcRestante()), 1000);
    return () => clearInterval(id);
  }, [fechaAsignacion]);

  if (restante <= 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-red-500">⏰ Tiempo agotado — reasignando...</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div className="h-1.5 rounded-full bg-red-400 w-0" />
        </div>
      </div>
    );
  }

  const mins = Math.floor(restante / 60000);
  const secs = Math.floor((restante % 60000) / 1000);
  const pct = (restante / TIMEOUT_MS) * 100;
  const color = pct < 25 ? "bg-red-500" : pct < 55 ? "bg-amber-500" : "bg-emerald-500";
  const textColor = pct < 25 ? "text-red-600" : pct < 55 ? "text-amber-600" : "text-gray-600";

  return (
    <div>
      <p className={`text-xs font-semibold ${textColor}`}>
        ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} para responder
      </p>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
