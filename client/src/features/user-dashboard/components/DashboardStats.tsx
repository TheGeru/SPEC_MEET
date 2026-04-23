import { CalendarIcon, ClockIcon, KeyIcon } from "lucide-react";
import type { UserStats } from "../models";

interface DashboardStatsProps {
  stats: UserStats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    { icon: CalendarIcon, label: "Reservas Activas", value: stats.activeReservations },
    { icon: ClockIcon, label: "Horas Reservadas", value: stats.totalHours },
    { icon: KeyIcon, label: "Próxima Reserva", value: stats.nextReservationDate },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10 shadow-lg"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-lg mr-3">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white opacity-80">{label}</p>
              <p className="text-lg font-semibold text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}