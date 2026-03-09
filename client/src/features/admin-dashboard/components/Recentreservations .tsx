import { Link } from "react-router-dom";
import type { RecentReservation } from "../models";
import { RESERVATION_STATUS } from "../models";

interface RecentReservationsProps {
  reservations: RecentReservation[];
}

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  [RESERVATION_STATUS.CONFIRMED]: { bg: "bg-green-100 text-green-800", label: "Confirmada" },
  [RESERVATION_STATUS.PAID]: { bg: "bg-green-100 text-green-800", label: "Confirmada" },
  [RESERVATION_STATUS.PENDING]: { bg: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
  [RESERVATION_STATUS.CANCELLED]: { bg: "bg-red-100 text-red-800", label: "Cancelada" },
};

export default function RecentReservations({ reservations }: RecentReservationsProps) {
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Reservas Recientes</h2>
        <Link to="/admin/calendar" className="text-sm text-gray-400 hover:text-gray-300">Ver todas</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha / Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Monto</th>
            </tr>
          </thead>
          <tbody className="bg-zinc-900 divide-y divide-zinc-800">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay reservaciones recientes
                </td>
              </tr>
            ) : (
              reservations.map((r) => {
                const badge = STATUS_BADGES[r.status.toLowerCase()] ?? { bg: "bg-gray-100 text-gray-800", label: r.status };
                return (
                  <tr key={r.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{r.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{new Date(r.date).toLocaleDateString("es-MX")}</div>
                      <div className="text-sm text-gray-400">{r.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg}`}>{badge.label}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${r.amount.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}