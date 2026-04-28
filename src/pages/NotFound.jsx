import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 text-center">
      <div>
        <span className="text-6xl">♻</span>
        <h1 className="text-4xl font-bold text-gray-800 mt-4">404</h1>
        <p className="text-gray-500 mt-2">La página que buscas no existe.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
