import { useState } from "react";
import { XCircleIcon, Loader2 } from "lucide-react";
import type { UserReservation } from "../models";

interface ExtendModalProps {
  reservation: UserReservation;
  onConfirm: (hours: number) => void;
  onClose: () => void;
  loading: boolean;
}

export default function ExtendModal({
  reservation,
  onConfirm,
  onClose,
  loading,
}: ExtendModalProps) {
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

        <p className="text-gray-400 text-sm mb-1">
          Hora actual de salida:{" "}
          <span className="text-white font-medium">{reservation.endTime}</span>
        </p>

        <div className="flex gap-2 my-4">
          {[1, 2, 3].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${
                hours === h
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              +{h} hr{h > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Nueva hora de salida:{" "}
          <span className="text-white font-medium">{newEndStr}</span>
        </p>

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
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}