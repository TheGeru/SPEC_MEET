/**
 * ADMIN-DASHBOARD FEATURE — CONTAINER
 */

import { Link } from "react-router-dom";
import {
  CalendarIcon, UsersIcon, SettingsIcon,
  Loader2, RefreshCwIcon, AlertCircleIcon,
} from "lucide-react";
import { useDashboardData } from "./hooks/useDashboardData";
import StatsCards from "./components/Statscards";
import RecentReservations from "./components/Recentreservations ";
import RevenueChart from "./components/Revenuechart";
import OccupancyByDay from "./components/Occupancybyday";
import QuickActions from "./components/Quickactions";

export default function AdminDashboard() {
  const { data, isLoading, error, lastUpdated, refresh } = useDashboardData();

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-zinc-950 gap-4">
        <AlertCircleIcon className="h-12 w-12 text-red-400" />
        <p className="text-red-400 text-center">{error}</p>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition">
          <RefreshCwIcon className="h-4 w-4" /> Reintentar
        </button>
      </div>
    );
  }

  const stats = data?.stats ?? {
    revenue: { current: 0, percentChange: 0 },
    reservations: { current: 0, percentChange: 0 },
    occupancy: { current: 0, percentChange: 0 },
    averageHours: { current: 0, percentChange: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-makron font-bold text-background">Panel Administrativo</h1>
          <p className="text-gray-400 mt-2">Gestiona tu sala de juntas inteligente</p>
          {lastUpdated && (
            <p className="text-xs text-gray-600 mt-1">Actualizado: {lastUpdated.toLocaleTimeString("es-MX")}</p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Link to="/admin/calendar" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" /> Calendario
          </Link>
          <Link to="/admin/users" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600">
            <UsersIcon className="h-4 w-4 mr-2" /> Usuarios
          </Link>
          <Link to="/admin/settings" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600">
            <SettingsIcon className="h-4 w-4 mr-2" /> Configuración
          </Link>
          <button onClick={refresh} disabled={isLoading} className="inline-flex items-center px-3 py-2 border border-zinc-700 rounded-md text-sm text-gray-400 hover:bg-zinc-800 transition disabled:opacity-50" title="Actualizar datos">
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentReservations reservations={data?.recentReservations ?? []} />
          <RevenueChart data={data?.revenueChartData ?? []} />
        </div>
        <div className="space-y-8">
          <OccupancyByDay data={data?.occupancyByDay ?? []} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}