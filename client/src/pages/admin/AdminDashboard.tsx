import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, DollarSignIcon, UsersIcon, BarChart2Icon, ClockIcon, SettingsIcon, AlertTriangleIcon } from 'lucide-react';
const AdminDashboard: React.FC = () => {
  // Mock data for the dashboard
  const stats = {
    revenue: {
      current: 12500,
      previous: 10800,
      percentChange: 15.7
    },
    reservations: {
      current: 28,
      previous: 23,
      percentChange: 21.7
    },
    occupancy: {
      current: 68,
      previous: 62,
      percentChange: 9.7
    },
    averageHours: {
      current: 2.3,
      previous: 2.1,
      percentChange: 9.5
    }
  };
  const recentReservations = [{
    id: '1',
    userName: 'Laura Martínez',
    date: '2023-12-14',
    time: '10:00 - 12:00',
    status: 'confirmed',
    amount: 500
  }, {
    id: '2',
    userName: 'Carlos Rodríguez',
    date: '2023-12-14',
    time: '14:00 - 16:00',
    status: 'confirmed',
    amount: 600
  }, {
    id: '3',
    userName: 'Ana García',
    date: '2023-12-15',
    time: '09:00 - 11:00',
    status: 'pending',
    amount: 450
  }, {
    id: '4',
    userName: 'Miguel López',
    date: '2023-12-15',
    time: '13:00 - 15:00',
    status: 'cancelled',
    amount: 500
  }];
  const alerts = [{
    id: '1',
    title: 'Baja ocupación detectada',
    description: 'La ocupación los martes está por debajo del 40%. Considera una promoción especial.',
    type: 'warning'
  }, {
    id: '2',
    title: 'Recursos más solicitados',
    description: 'El micrófono y la TV son los recursos más solicitados. Considera incluirlos en un paquete.',
    type: 'info'
  }];
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Confirmada
          </span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pendiente
          </span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Cancelada
          </span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>;
    }
  };
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Panel Administrativo
          </h1>
          <p className="text-gray-400 mt-2">
            Gestiona tu sala de juntas inteligente
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Link to="/admin/calendar" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendario
          </Link>
          <Link to="/admin/users" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600">
            <UsersIcon className="h-4 w-4 mr-2" />
            Usuarios
          </Link>
          <Link to="/admin/settings" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Configuración
          </Link>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">
              Ingresos (Mes)
            </h3>
            <div className="bg-gray-800/50 p-2 rounded-lg">
              <DollarSignIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              ${stats.revenue.current.toLocaleString()}
            </p>
            <p className={`ml-2 text-sm ${stats.revenue.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.revenue.percentChange >= 0 ? '+' : ''}
              {stats.revenue.percentChange}%
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">vs. mes anterior</p>
        </div>
        <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">
              Reservas (Mes)
            </h3>
            <div className="bg-gray-800/50 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              {stats.reservations.current}
            </p>
            <p className={`ml-2 text-sm ${stats.reservations.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.reservations.percentChange >= 0 ? '+' : ''}
              {stats.reservations.percentChange}%
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">vs. mes anterior</p>
        </div>
        <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">Ocupación</h3>
            <div className="bg-gray-800/50 p-2 rounded-lg">
              <UsersIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              {stats.occupancy.current}%
            </p>
            <p className={`ml-2 text-sm ${stats.occupancy.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.occupancy.percentChange >= 0 ? '+' : ''}
              {stats.occupancy.percentChange}%
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">vs. mes anterior</p>
        </div>
        <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">
              Horas Promedio
            </h3>
            <div className="bg-gray-800/50 p-2 rounded-lg">
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              {stats.averageHours.current}
            </p>
            <p className={`ml-2 text-sm ${stats.averageHours.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.averageHours.percentChange >= 0 ? '+' : ''}
              {stats.averageHours.percentChange}%
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">vs. mes anterior</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">
                Reservas Recientes
              </h2>
              <Link to="/admin/calendar" className="text-sm text-gray-400 hover:text-gray-300">
                Ver todas
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fecha / Hora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {recentReservations.map(reservation => <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {reservation.userName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(reservation.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {reservation.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        ${reservation.amount.toFixed(2)}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
          {/* Simplified Chart */}
          <div className="bg-zinc-900 rounded-lg shadow-lg mt-8 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-white">
                Ingresos por Semana
              </h2>
              <div>
                <select className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option>Último mes</option>
                  <option>Últimos 3 meses</option>
                  <option>Último año</option>
                </select>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between">
              {[65, 45, 75, 55, 85, 70, 90].map((value, index) => <div key={index} className="flex flex-col items-center w-full">
                  <div className="w-full bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-sm" style={{
                height: `${value}%`
              }}></div>
                  <div className="text-xs text-gray-400 mt-2">
                    Sem {index + 1}
                  </div>
                </div>)}
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-8">
          {/* AI Insights */}
          <div className="bg-zinc-900 rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium text-white">Insights IA</h2>
            </div>
            <div className="p-6 space-y-4">
              {alerts.map(alert => <div key={alert.id} className={`p-4 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-700/50' : 'bg-blue-900/20 border border-blue-700/50'}`}>
                  <div className="flex">
                    <div className={`flex-shrink-0 ${alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {alert.type === 'warning' ? <AlertTriangleIcon className="h-5 w-5" /> : <BarChart2Icon className="h-5 w-5" />}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${alert.type === 'warning' ? 'text-yellow-300' : 'text-blue-300'}`}>
                        {alert.title}
                      </h3>
                      <div className="mt-2 text-sm text-gray-300">
                        <p>{alert.description}</p>
                      </div>
                    </div>
                  </div>
                </div>)}
              <Link to="/admin/financial" className="block w-full py-2 px-4 border border-zinc-700 rounded-md text-center text-sm text-gray-300 hover:bg-zinc-800">
                Ver análisis completo
              </Link>
            </div>
          </div>
          {/* Occupancy by Day */}
          <div className="bg-zinc-900 rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium text-white">
                Ocupación por Día
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day, index) => {
                const occupancy = [75, 40, 85, 65, 90][index];
                return <div key={day}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-300">{day}</span>
                          <span className="text-sm text-gray-300">
                            {occupancy}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div className={`h-2 rounded-full ${occupancy >= 70 ? 'bg-green-500' : occupancy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                      width: `${occupancy}%`
                    }}></div>
                        </div>
                      </div>;
              })}
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="bg-zinc-900 rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium text-white">
                Acciones Rápidas
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/admin/calendar" className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-center text-white">
                Ver Calendario
              </Link>
              <Link to="/admin/users" className="block w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-center text-gray-300">
                Gestionar Usuarios
              </Link>
              <Link to="/admin/settings" className="block w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-center text-gray-300">
                Configurar Precios
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AdminDashboard;