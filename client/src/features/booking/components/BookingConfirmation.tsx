/**
 * BookingConfirmation — Presentational Component
 *
 * Shows the booking success screen with access code.
 * US-04: "Recibir un código PIN único para desbloquear la cerradura"
 */

import { CheckIcon, CalendarIcon, ClockIcon } from "lucide-react";
import type { BookingSummary } from "../models";

interface BookingConfirmationProps {
  summary: BookingSummary;
  onGoToDashboard: () => void;
}

export default function BookingConfirmation({
  summary,
  onGoToDashboard,
}: BookingConfirmationProps) {
  // Temporal access code — in production this comes from TTLock API via backend
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

  return (
    <div className="space-y-6 text-center text-white">
      <div className="flex justify-center">
        <div className="bg-green-500 bg-opacity-80 backdrop-blur-sm rounded-full p-4 shadow-lg">
          <CheckIcon className="h-12 w-12 text-white" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-2">¡Reserva Confirmada!</h3>
        <p className="opacity-90">Tu pago ha sido procesado exitosamente.</p>
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg max-w-sm mx-auto border border-white border-opacity-20">
        <div className="mb-4 text-left">
          <h4 className="text-lg font-medium mb-2 border-b border-white border-opacity-20 pb-1">
            Detalles
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 opacity-80" />
              <span>{summary.formattedDate}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 opacity-80" />
              <span>
                {summary.startTime} - {summary.endTime}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 opacity-80">
            Código de acceso temporal
          </h4>
          <div className="bg-black bg-opacity-30 rounded-md py-3 px-4 border border-white border-opacity-10">
            <span className="font-mono text-2xl font-bold tracking-widest text-green-400">
              {accessCode}
            </span>
          </div>
        </div>

        <p className="text-xs opacity-70">
          Hemos enviado el recibo a tu correo.
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