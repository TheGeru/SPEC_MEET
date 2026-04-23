import { Loader2 } from "lucide-react";
import type { UserReservation } from "../models";

interface CancelModalProps {
  reservation: UserReservation;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}

export default function CancelModal({
  reservation,
  onConfirm,
  onClose,
  loading,
}: CancelModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">
          ¿Cancelar reserva?
        </h3>
        <p className="text-gray-400 text-sm mb-1">
          {new Date(reservation.date).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {" · "}
          {reservation.startTime} – {reservation.endTime}
        </p>
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 my-4">
          <p className="text-yellow-300 text-xs">
            El reembolso depende del tiempo de anticipación según los Términos y
            Condiciones.
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
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Sí, cancelar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}