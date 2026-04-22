import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@infrastructure/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon, ClockIcon, KeyIcon, CheckCircleIcon,
  XCircleIcon, AlertCircleIcon, TagIcon, Loader2,
  CopyIcon, PlusCircleIcon, InfoIcon
} from 'lucide-react';
import api from '../../api/axios';
import ExtensionPaymentModal from '@features/booking/components/ExtensionPaymentModal';

const navigate = useNavigate()
// ─── Tipos ───────────────────────────────────────────────────
interface Reservation {
  id:           string;
  date:         string;
  startTime:    string;
  endTime:      string;
  accessCode:   string | null;
  status:       string;
  totalAmount:  number;
  canCancel:    boolean;
  canExtend:    boolean;
  invoiceRequested: boolean;
}

interface DashboardData {
  stats: {
    activeReservations:  number;
    totalHours:          number;
    nextReservationDate: string;
  };
  upcoming: Reservation[];
  past:     Reservation[];
}

// ─── Helper: badge de estado (idéntico al original) ──────────
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PAID':
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-30 backdrop-blur-sm text-white">
          <CheckCircleIcon className="w-3 h-3 mr-1" /> Confirmada
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-30 backdrop-blur-sm text-white">
          <AlertCircleIcon className="w-3 h-3 mr-1" /> Pendiente
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 bg-opacity-30 backdrop-blur-sm text-white">
          <CheckCircleIcon className="w-3 h-3 mr-1" /> Completada
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 bg-opacity-30 backdrop-blur-sm text-white">
          <XCircleIcon className="w-3 h-3 mr-1" /> Cancelada
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500 bg-opacity-30 backdrop-blur-sm text-white">
          {status}
        </span>
      );
  }
};

// ─── Modal: Ver Detalles ──────────────────────────────────────
const DetailsModal: React.FC<{ reservation: Reservation; onClose: () => void }> = ({ reservation, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (reservation.accessCode) {
      navigator.clipboard.writeText(reservation.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Detalle de Reserva</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-white text-sm">
              {new Date(reservation.date).toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-white text-sm">{reservation.startTime} – {reservation.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-white text-sm">Estado: </span>
            {getStatusBadge(reservation.status)}
          </div>
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-white text-sm font-bold">${reservation.totalAmount.toFixed(2)} MXN</span>
          </div>
        </div>

        {/* Código de acceso */}
        {reservation.accessCode && (reservation.status === 'CONFIRMED' || reservation.status === 'PAID') && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <KeyIcon className="h-3 w-3" /> Código de Acceso
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono font-bold text-2xl text-white tracking-widest">
                {reservation.accessCode}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg border border-white/10 transition-all"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Válido únicamente durante tu horario reservado.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm border border-white/10 transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// ─── Modal: Cancelar ─────────────────────────────────────────
const CancelModal: React.FC<{
  reservation: Reservation;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}> = ({ reservation, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-2">¿Cancelar reserva?</h3>
      <p className="text-gray-400 text-sm mb-1">
        {new Date(reservation.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        {' · '}{reservation.startTime} – {reservation.endTime}
      </p>
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 my-4">
        <p className="text-yellow-300 text-xs">
          El reembolso depende del tiempo de anticipación según los Términos y Condiciones.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm border border-white/10 transition-all"
        >
          Mantener
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2 bg-red-700/70 hover:bg-red-700 text-white rounded-lg text-sm font-medium border border-red-600/30 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sí, cancelar'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Modal: Extender ─────────────────────────────────────────
const ExtendModal: React.FC<{
  reservation: Reservation;
  onConfirm: (hours: number) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ reservation, onConfirm, onClose, loading }) => {
  const [hours, setHours] = useState(1);
  const newEnd = new Date(`1970-01-01T${reservation.endTime}`);
  newEnd.setHours(newEnd.getHours() + hours);
  const newEndStr = newEnd.toTimeString().slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Extender Reserva</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-1">Hora actual de salida: <span className="text-white font-medium">{reservation.endTime}</span></p>
        <div className="flex gap-2 my-4">
          {[1, 2, 3].map(h => (
            <button
              key={h} onClick={() => setHours(h)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${
                hours === h
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              +{h} hr{h > 1 ? 's' : ''}
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-sm mb-4">Nueva hora de salida: <span className="text-white font-medium">{newEndStr}</span></p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm border border-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(hours)}
            disabled={loading}
            className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium border border-white/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toast ───────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => (
  <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-sm
    ${type === 'success' ? 'bg-green-900/80 border-green-700/50 text-green-200' : 'bg-red-900/80 border-red-700/50 text-red-200'}`}>
    {type === 'success' ? <CheckCircleIcon className="h-4 w-4" /> : <AlertCircleIcon className="h-4 w-4" />}
    {msg}
    <button onClick={onClose}><XCircleIcon className="h-4 w-4 opacity-60 hover:opacity-100" /></button>
  </div>
);

// ─── Componente Principal ─────────────────────────────────────
const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]   = useState<'upcoming' | 'past'>('upcoming');
  const [data, setData]             = useState<DashboardData | null>(null);
  const [loading, setLoading]       = useState(true);

  // Modales activos
  const [detailRes, setDetailRes]   = useState<Reservation | null>(null);
  const [cancelRes, setCancelRes]   = useState<Reservation | null>(null);
  const [extendRes, setExtendRes]   = useState<Reservation | null>(null);
  const [extensionClientSecret, setExtensionClientSecret] = useState<string | null>(null);
  const [extendingAmount, setExtendingAmount] = useState<number>(0); // Para mostrar cuánto va a pagar  
  // Loading por acción
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  const [discounts, setDiscounts] = useState<any[]>([]); // Puedes definir una interfaz luego
  
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch datos del dashboard ──────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, discountsRes] = await Promise.all([
        api.get('/dashboard/user-stats'),
        api.get('/user/my-discounts')
      ]);

      setData(statsRes.data);
      setDiscounts(discountsRes.data);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      showToast('No se pudieron cargar todos los datos del panel', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Cancelar reserva ───────────────────────────────────────
  const handleCancel = async (reservationId: string) => {
    if (!window.confirm("¿Estas seguro de que deseas cancelar esta reserva? Se aplicaran las politicas de reembolso")) return;
    try {
      setActionLoading(true);
      await api.post(`/cancellations/${reservationId}/cancel`);      
      showToast('Reserva cancelada. Revisa tu email para el reembolso.');
      setCancelRes(null);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al cancelar', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Extender reserva ───────────────────────────────────────
  const handleExtend = async (hours: number) => {
    if (!extendRes) return;
    try {
      setActionLoading(true);
      const {data} = await api.post(`/reservations/${extendRes.id}/extend`, {
        additionalHours: hours
      });

      if(data.clientSecret){
        showToast("Intencion de extension creada. Procedimiento al pago...");
        setExtensionClientSecret(data.clientSecret);
        setExtendingAmount(data.totalExtra || 0);
      }
      setExtendRes(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'No se puede extender en este momento.';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div className="w-full min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="h-10 w-10 text-white animate-spin" />
    </div>
  );

  const stats                = data?.stats    || { activeReservations: 0, totalHours: 0, nextReservationDate: '--' };
  const upcomingReservations = data?.upcoming || [];
  const pastReservations     = data?.past     || [];

  return (
    <div className="w-full min-h-screen relative">

      {/* ── Background (idéntico al original) ── */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://uploadthingy.s3.us-west-1.amazonaws.com/mnx4A3B36Dy2nyF5i8QPC8/PHOTO-2025-02-03-12-44-43.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Mi Panel</h1>
          <p className="text-white mt-2">
            Bienvenido, {user?.name}. Gestiona tus reservas desde aquí.
          </p>
        </div>

        {/* ── Stats Cards (idénticas al original) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white opacity-80">Reservas Activas</p>
                <p className="text-lg font-semibold text-white">{stats.activeReservations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white opacity-80">Horas Reservadas</p>
                <p className="text-lg font-semibold text-white">{stats.totalHours}</p>
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
                <p className="text-lg font-semibold text-white">{stats.nextReservationDate}</p>
              </div>
            </div>
          </div>
        </div>

                {/* ── SECCIÓN DE BENEFICIOS (GIFT CARDS) ── */}
        {discounts.length > 0 && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <PlusCircleIcon className="h-5 w-5 text-white" />
              <h2 className="text-xl font-bold text-white">Mis Beneficios</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount) => (
                <div 
                  key={discount.id} 
                  className="group relative overflow-hidden bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-5 border border-white border-opacity-20 shadow-xl transition-all hover:bg-opacity-15"
                >
                  {/* Adorno visual: Círculos de "ticket" a los lados */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full border-r border-white/20" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full border-l border-white/20" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Cortesía Meet</p>
                      <h4 className="text-2xl font-black text-white">{discount.hours} Horas Gratis</h4>
                      <p className="text-xs text-gray-400 mt-1 italic">{discount.description || 'Válido para cualquier sala'}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono font-bold text-white border border-white/10">
                        {discount.code}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> 
                      Vence: {new Date(discount.expiresAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => navigate('/booking', {
                        state: {preselectedDiscountId: discount.id}
                      })}
                      className="text-[10px] font-bold text-white hover:underline uppercase tracking-tighter">
                      Usar ahora →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Panel principal (idéntico al original) ── */}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg mb-8 border border-white border-opacity-10">

          {/* Tabs + botones de navegación */}
          <div className="border-b border-white border-opacity-10 px-6 py-4 flex justify-between items-center">
            <div className="flex flex-wrap gap-4">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20 shadow-lg text-white'
                    : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white hover:bg-opacity-20'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Próximas Reservas
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'past'
                    ? 'bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20 shadow-lg text-white'
                    : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white hover:bg-opacity-20'
                }`}
                onClick={() => setActiveTab('past')}
              >
                Historial de Reservas
              </button>
            </div>
            <div className="flex gap-2">
              <Link
                to="/plans"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg hover:bg-opacity-20 transition-all"
              >
                <TagIcon className="mr-2 h-4 w-4" />
                Ver Planes
              </Link>
              <Link
                to="/booking"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg hover:bg-opacity-20 transition-all"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Reservar
              </Link>
            </div>
          </div>

          <div className="p-6">

            {/* ── Tab: Próximas Reservas ── */}
            {activeTab === 'upcoming' ? (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Próximas Reservas</h3>
                {upcomingReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white mb-4">No tienes reservas próximas</p>
                    <Link
                      to="/booking"
                      className="inline-flex items-center px-4 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md shadow-sm text-white bg-white bg-opacity-15 hover:bg-opacity-30 backdrop-blur-sm transition-all"
                    >
                      Reservar Ahora
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <CalendarIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white font-medium">
                                {new Date(reservation.date).toLocaleDateString('es-ES', {
                                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              <ClockIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white">
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                            </div>
                            {reservation.accessCode && (
                              <div className="flex items-center mb-2">
                                <KeyIcon className="h-5 w-5 text-white mr-2" />
                                <span className="text-white">
                                  Código de acceso:{' '}
                                  <span className="font-mono font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded">
                                    {reservation.accessCode}
                                  </span>
                                </span>
                              </div>
                            )}
                            <div className="mt-2">{getStatusBadge(reservation.status)}</div>
                          </div>

                          {/* Precio */}
                          <div className="text-right flex flex-col justify-between h-full">
                            <div className="mt-auto">
                              <p className="text-gray-300 text-xs uppercase tracking-wide mb-1">Total Pagado</p>
                              <p className="text-white font-bold text-xl">
                                ${reservation.totalAmount.toFixed(2)} MXN
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => setDetailRes(reservation)}
                            className="px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all"
                          >
                            Ver Detalles
                          </button>
                           {reservation.canExtend && (
                            <button
                              onClick={() => setExtendRes(reservation)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all"
                            >
                              <PlusCircleIcon className="h-3.5 w-3.5" /> Extender
                            </button>
                          )}
                          {reservation.canCancel && (
                            <button
                              onClick={() => setCancelRes(reservation)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-white text-sm rounded-md backdrop-blur-sm border border-red-400/20 transition-all"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            ) : (
              /* ── Tab: Historial ── */
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Historial de Reservas</h3>
                {pastReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white">No tienes reservas pasadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <CalendarIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white font-medium">
                                {new Date(reservation.date).toLocaleDateString('es-ES', {
                                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              <ClockIcon className="h-5 w-5 text-white mr-2" />
                              <span className="text-white">
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                            </div>
                            <div className="mt-2">{getStatusBadge(reservation.status)}</div>
                          </div>

                          {/* Precio */}
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="text-gray-300 text-xs uppercase tracking-wide mb-1">Total</p>
                            <p className="text-white font-bold text-lg">
                              ${reservation.totalAmount.toFixed(2)} MXN
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => setDetailRes(reservation)}
                            className="
                            px-3 
                            py-1 
                            bg-white 
                            bg-opacity-15 
                            hover:bg-opacity-30 
                            text-white text-sm 
                            rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all">Ver Detalles
                          </button>
                          {reservation.invoiceRequested && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-300 text-sm rounded-md border border-green-500/20">
                              <CheckCircleIcon className="h-3.5 w-3.5" /> Factura solicitada
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
      {detailRes  && <DetailsModal reservation={detailRes}  onClose={() => setDetailRes(null)} />}
      {cancelRes  && <CancelModal  reservation={cancelRes}
      onConfirm={() => handleCancel(cancelRes.id)}
      onClose={() => setCancelRes(null)}  loading={actionLoading} />}
      {extendRes  && <ExtendModal  reservation={extendRes}  onConfirm={handleExtend}           onClose={() => setExtendRes(null)}  loading={actionLoading} />}
      {extensionClientSecret && (
        <ExtensionPaymentModal 
          clientSecret={extensionClientSecret}
          amount={extendingAmount}
          onClose={() => {
            setExtensionClientSecret(null);
            setExtendingAmount(0);
          }}
          onSuccess={() => {
            setExtensionClientSecret(null);
            setExtendingAmount(0);
            showToast("¡Pago de extensión exitoso!");
            fetchData(); // Recargamos para ver la nueva hora de salida
          }}
        />
      )}
      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UserDashboard;