import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CalendarIcon, ClockIcon, KeyIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, TagIcon } from 'lucide-react';
const UserDashboard: React.FC = () => {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  // Mock data for reservations
  const upcomingReservations = [{
    id: '1',
    date: '2023-12-15',
    startTime: '10:00',
    endTime: '12:00',
    accessCode: '483921',
    status: 'confirmed',
    resources: ['TV', 'WiFi', 'Pizarra'],
    totalAmount: 450
  }, {
    id: '2',
    date: '2023-12-20',
    startTime: '14:00',
    endTime: '16:00',
    accessCode: '729384',
    status: 'pending',
    resources: ['TV', 'WiFi', 'Cámara'],
    totalAmount: 500
  }];
  const pastReservations = [{
    id: '3',
    date: '2023-11-28',
    startTime: '09:00',
    endTime: '11:00',
    accessCode: '192837',
    status: 'completed',
    resources: ['TV', 'WiFi'],
    totalAmount: 400
  }, {
    id: '4',
    date: '2023-11-15',
    startTime: '15:00',
    endTime: '17:00',
    accessCode: '465738',
    status: 'cancelled',
    resources: ['TV', 'WiFi', 'Pizarra', 'Micrófono'],
    totalAmount: 550
  }];
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-30 backdrop-blur-sm text-white">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Confirmada
          </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-30 backdrop-blur-sm text-white">
            <AlertCircleIcon className="w-3 h-3 mr-1" />
            Pendiente
          </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 bg-opacity-30 backdrop-blur-sm text-white">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completada
          </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 bg-opacity-30 backdrop-blur-sm text-white">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Cancelada
          </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500 bg-opacity-30 backdrop-blur-sm text-white">
            {status}
          </span>;
    }
  };
  return <div className="w-full min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{
      backgroundImage: "url('https://uploadthingy.s3.us-west-1.amazonaws.com/mnx4A3B36Dy2nyF5i8QPC8/PHOTO-2025-02-03-12-44-43.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center'
    }}></div>
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Mi Panel</h1>
          <p className="text-black mt-2">
            Bienvenido, {user?.name}. Gestiona tus reservas desde aquí.
          </p>
        </div>
        {/* Compact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white opacity-80">
                  Reservas Activas
                </p>
                <p className="text-lg font-semibold text-white">
                  {upcomingReservations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white opacity-80">
                  Horas Reservadas
                </p>
                <p className="text-lg font-semibold text-white">6</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3">
                <KeyIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white opacity-80">Próxima Reserva</p>
                <p className="text-lg font-semibold text-white">
                  15 Dic, 10:00
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg mb-8 border border-white border-opacity-10">
          <div className="border-b border-white border-opacity-10 px-6 py-4 flex justify-between items-center">
            <div className="flex flex-wrap gap-4">
              <button className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'upcoming' ? 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white' : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white hover:bg-opacity-20'}`} onClick={() => setActiveTab('upcoming')}>
                Próximas Reservas
              </button>
              <button className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'past' ? 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white' : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white hover:bg-opacity-20'}`} onClick={() => setActiveTab('past')}>
                Historial de Reservas
              </button>
            </div>
            <div className="flex gap-2">
              <Link to="/plans" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg hover:bg-opacity-20 transition-all">
                <TagIcon className="mr-2 h-4 w-4" />
                Ver Planes
              </Link>
              <Link to="/booking" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg hover:bg-opacity-20 transition-all">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Reservar
              </Link>
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'upcoming' ? <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Próximas Reservas
                </h3>
                {upcomingReservations.length === 0 ? <div className="text-center py-8">
                    <p className="text-white mb-4">
                      No tienes reservas próximas
                    </p>
                    <Link to="/booking" className="inline-flex items-center px-4 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md shadow-sm text-white bg-white bg-opacity-15 hover:bg-opacity-30 backdrop-blur-sm transition-all">
                      Reservar Ahora
                    </Link>
                  </div> : <div className="space-y-4">
                    {upcomingReservations.map(reservation => <div key={reservation.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <CalendarIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white font-medium">
                                {new Date(reservation.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              <ClockIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white">
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              <KeyIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white">
                                Código de acceso:{' '}
                                <span className="font-mono font-bold">
                                  {reservation.accessCode}
                                </span>
                              </span>
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(reservation.status)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white mb-1">Recursos:</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {reservation.resources.map((resource, index) => <span key={index} className="px-2 py-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-md text-xs text-white">
                                  {resource}
                                </span>)}
                            </div>
                            <p className="text-white font-bold">
                              ${reservation.totalAmount.toFixed(2)} MXN
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all">
                            Ver Detalles
                          </button>
                          <button className="px-3 py-1 bg-red-500 bg-opacity-30 hover:bg-opacity-50 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all">
                            Cancelar
                          </button>
                        </div>
                      </div>)}
                  </div>}
              </div> : <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Historial de Reservas
                </h3>
                {pastReservations.length === 0 ? <div className="text-center py-8">
                    <p className="text-white">No tienes reservas pasadas</p>
                  </div> : <div className="space-y-4">
                    {pastReservations.map(reservation => <div key={reservation.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <CalendarIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white font-medium">
                                {new Date(reservation.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              <ClockIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white">
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(reservation.status)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white mb-1">Recursos:</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {reservation.resources.map((resource, index) => <span key={index} className="px-2 py-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-md text-xs text-white">
                                  {resource}
                                </span>)}
                            </div>
                            <p className="text-white font-bold">
                              ${reservation.totalAmount.toFixed(2)} MXN
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all">
                            Ver Detalles
                          </button>
                          {reservation.status === 'completed' && <button className="px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all">
                              Solicitar Factura
                            </button>}
                        </div>
                      </div>)}
                  </div>}
              </div>}
          </div>
        </div>
        <div className="text-center"></div>
      </div>
    </div>;
};
export default UserDashboard;