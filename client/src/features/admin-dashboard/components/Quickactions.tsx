import { Link } from "react-router-dom";

export default function QuickActions() {
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-lg font-medium text-white">Acciones Rápidas</h2>
      </div>
      <div className="p-6 space-y-3">
        <Link to="/admin/calendar" className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-center text-white">
          Ver Calendario
        </Link>
        <Link to="/admin/users" className="block w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-center text-gray-300">
          Gestionar Usuarios
        </Link>
        <Link to="/admin/settings" className="block w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-center text-gray-300">
          Configurar Sistema
        </Link>
        <Link to="/admin/financial" className="block w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-center text-gray-300">
          Ver Análisis Financiero
        </Link>
      </div>
    </div>
  );
}