import { useState } from "react";
import { crearSolicitud } from "../../api/solicitudes";
import BarraPasos from "./BarraPasos";
import Paso1Tipo from "./Paso1Tipo";
import Paso2Cantidad from "./Paso2Cantidad";
import Paso3FechaFranja from "./Paso3FechaFranja";
import Paso4Confirmacion from "./Paso4Confirmacion";

const FORM_INICIAL = {
  tipo_residuo: "",
  cantidad_kg: "",
  fecha_recoleccion: "",
  franja_horaria: "",
  direccion: "",
  latitud: null,
  longitud: null,
};

export default function NuevaSolicitudModal({ onClose, onCreada }) {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(null);
  const [errorServidor, setErrorServidor] = useState("");

  const onChange = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const next = () => setPaso((p) => p + 1);
  const back = () => setPaso((p) => p - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorServidor("");
    try {
      const payload = {
        tipo_residuo: form.tipo_residuo,
        cantidad_kg: parseFloat(form.cantidad_kg),
        fecha_recoleccion: form.fecha_recoleccion,
        franja_horaria: form.franja_horaria,
        direccion: form.direccion.trim(),
        latitud: form.latitud,
        longitud: form.longitud,
      };
      const solicitud = await crearSolicitud(payload);
      setExito(solicitud);
      onCreada?.(solicitud);
    } catch (err) {
      setErrorServidor(
        err.response?.data?.detail || "Error al crear la solicitud. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Nueva solicitud de recolección</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="px-6 py-5">
          {/* Estado de éxito */}
          {exito ? (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¡Solicitud creada!</h3>
              <p className="text-gray-500 text-sm mb-1">
                Número de seguimiento:
              </p>
              <p className="font-mono text-emerald-600 font-semibold mb-6">{exito.numero_seguimiento}</p>
              <p className="text-sm text-gray-400 mb-6">
                Te notificaremos en tiempo real cuando un reciclador sea asignado.
              </p>
              <button onClick={onClose} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <BarraPasos actual={paso} />

              {paso === 1 && <Paso1Tipo form={form} onChange={onChange} onNext={next} />}
              {paso === 2 && <Paso2Cantidad form={form} onChange={onChange} onNext={next} onBack={back} />}
              {paso === 3 && <Paso3FechaFranja form={form} onChange={onChange} onNext={next} onBack={back} />}
              {paso === 4 && (
                <>
                  {errorServidor && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {errorServidor}
                    </div>
                  )}
                  <Paso4Confirmacion
                    form={form}
                    onChange={onChange}
                    onBack={back}
                    onSubmit={handleSubmit}
                    loading={loading}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
