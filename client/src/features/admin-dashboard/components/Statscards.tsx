import { DollarSignIcon, CalendarIcon, UsersIcon, ClockIcon } from "lucide-react";
import type { DashboardStats } from "../models";

interface StatsCardsProps {
  stats: DashboardStats;
}

const CARDS = [
  { key: "revenue" as const, label: "Ingresos (Mes)", icon: DollarSignIcon, format: (v: number | string) => `$${Number(v).toLocaleString("es-MX")}` },
  { key: "reservations" as const, label: "Reservas (Mes)", icon: CalendarIcon, format: (v: number | string) => String(v) },
  { key: "occupancy" as const, label: "Ocupación", icon: UsersIcon, format: (v: number | string) => `${v}%` },
  { key: "averageHours" as const, label: "Horas Promedio", icon: ClockIcon, format: (v: number | string) => `${v}h` },
] as const;

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {CARDS.map(({ key, label, icon: Icon, format }) => {
        const stat = stats[key];
        const change = Number(stat.percentChange);
        return (
          <div key={key} className="bg-zinc-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{label}</h3>
              <div className="bg-gray-800/50 p-2 rounded-lg">
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-white">{format(stat.current)}</p>
              <p className={`ml-2 text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {change >= 0 ? "+" : ""}{stat.percentChange}%
              </p>
            </div>
            <p className="mt-1 text-xs text-gray-500">vs. mes anterior</p>
          </div>
        );
      })}
    </div>
  );
}