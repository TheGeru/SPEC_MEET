/**
 * BookingConfirmation — Presentational Component
 *
 * Shows the booking success screen.
 * 🔧 FIX: Ya no genera un código de acceso falso en el frontend.
 *    El código real lo genera TTLock en el backend (webhook de Stripe)
 *    y se envía al usuario por correo electrónico.
 *    Mostrar un número aleatorio aquí era engañoso — el usuario
 *    intentaría usarlo en la cerradura y no funcionaría.
 */

import { CheckIcon, CalendarIcon, ClockIcon, MailIcon } from "lucide-react";
import type { BookingSummary } from "../models";

interface BookingConfirmationProps {
  summary: BookingSummary;
  onGoToDashboard: () => void;
}

export default function BookingConfirmation({
  summary,
  onGoToDashboard,
}: BookingConfirmationProps) {
  return (
    <div className="space-y-6 text-center text-white">

      {/* Ícono de éxito */}
      <div className="flex justify-center">
        <div className="bg-green-500 bg-opacity-80 backdrop-blur-sm rounded-full p-4 shadow-lg">
          <CheckIcon className="h-12 w-12 text-white" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-2">¡Reserva Confirmada!</h3>
        <p className="opacity-90">Tu pago ha sido procesado exitosamente.</p>
      </div>

      {/* Detalles */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg max-w-sm mx-auto border border-white border-opacity-20 text-left">
        <h4 className="text-lg font-medium mb-3 border-b border-white border-opacity-20 pb-2">
          Detalles de tu sesión
        </h4>

        <div className="space-y-2 text-sm mb-5">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 opacity-70 shrink-0" />
            <span>{summary.formattedDate}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 opacity-70 shrink-0" />
            <span>{summary.startTime} – {summary.endTime}</span>
          </div>
        </div>

        {/* 🆕 Aviso de código por correo — reemplaza el código aleatorio falso */}
        <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-white border-opacity-10">
          <div className="flex items-start gap-3">
            <MailIcon className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-300 mb-1">
                Revisa tu correo electrónico
              </p>
              <p className="text-xs opacity-70 leading-relaxed">
                Te enviamos todos los detalles de acceso, incluyendo el
                código PIN para la cerradura electrónica de tu sala.
                El código se activa 10 minutos antes de tu horario.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs opacity-50 mt-4 text-center">
          ¿No ves el correo? Revisa tu carpeta de spam.
        </p>
      </div>

      <button
        onClick={onGoToDashboard}
        className="w-full px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md font-bold transition-all border border-white border-opacity-30"
      >
        Ir a Mi Panel
      </button>
    </div>
  );
}