import {
  CalendarIcon, ClockIcon, KeyIcon, PlusCircleIcon, CheckCircleIcon,
} from "lucide-react";
import type { UserReservation } from "../models";
import StatusBadge from "./StatusBadge";

interface ReservationCardProps {
  reservation: UserReservation;
  isUpcoming: boolean;
  onViewDetails: (r: UserReservation) => void;
  onCancel: (r: UserReservation) => void;
  onExtend: (r: UserReservation) => void;
}

export default function ReservationCard({
  reservation: r,
  isUpcoming,
  onViewDetails,
  onCancel,
  onExtend,
}: ReservationCardProps) {
  const formattedDate = new Date(r.date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-5 w-5 text-white mr-2" />
            <span className="text-white font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center mb-2">
            <ClockIcon className="h-5 w-5 text-white mr-2" />
            <span className="text-white">
              {r.startTime} - {r.endTime}
            </span>
          </div>
          {isUpcoming && r.accessCode && (
            <div className="flex items-center mb-2">
              <KeyIcon className="h-5 w-5 text-white mr-2" />
              <span className="text-white">
                Código de acceso:{" "}
                <span className="font-mono font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded">
                  {r.accessCode}
                </span>
              </span>
            </div>
          )}
          <div className="mt-2">
            <StatusBadge status={r.status} />
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex flex-col justify-between h-full">
          <div className="mt-auto">
            <p className="text-gray-300 text-xs uppercase tracking-wide mb-1">
              {isUpcoming ? "Total Pagado" : "Total"}
            </p>
            <p className={`text-white font-bold ${isUpcoming ? "text-xl" : "text-lg"}`}>
              ${r.totalAmount.toFixed(2)} MXN
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onViewDetails(r)}
          className="px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all"
        >
          Ver Detalles
        </button>
        {isUpcoming && r.canExtend && (
          <button
            onClick={() => onExtend(r)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white bg-opacity-15 hover:bg-opacity-30 text-white text-sm rounded-md backdrop-blur-sm border border-white border-opacity-20 transition-all"
          >
            <PlusCircleIcon className="h-3.5 w-3.5" /> Extender
          </button>
        )}
        {isUpcoming && r.canCancel && (
          <button
            onClick={() => onCancel(r)}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-white text-sm rounded-md backdrop-blur-sm border border-red-400/20 transition-all"
          >
            Cancelar
          </button>
        )}
        {!isUpcoming && r.invoiceRequested && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-300 text-sm rounded-md border border-green-500/20">
            <CheckCircleIcon className="h-3.5 w-3.5" /> Factura solicitada
          </span>
        )}
      </div>
    </div>
  );
}