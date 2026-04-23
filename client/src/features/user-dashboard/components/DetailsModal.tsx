import { useState } from "react";
import {
  CalendarIcon, ClockIcon, KeyIcon, TagIcon,
  XCircleIcon, CopyIcon, InfoIcon,
} from "lucide-react";
import type { UserReservation } from "../models";
import StatusBadge from "./StatusBadge";

interface DetailsModalProps {
  reservation: UserReservation;
  onClose: () => void;
}

export default function DetailsModal({ reservation, onClose }: DetailsModalProps) {
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
              {new Date(reservation.date).toLocaleDateString("es-ES", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
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
            <StatusBadge status={reservation.status} />
          </div>
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-white text-sm font-bold">
              ${reservation.totalAmount.toFixed(2)} MXN
            </span>
          </div>
        </div>

        {/* Access code */}
        {reservation.accessCode &&
          (reservation.status === "CONFIRMED" || reservation.status === "PAID") && (
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
                {copied ? "¡Copiado!" : "Copiar"}
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
}