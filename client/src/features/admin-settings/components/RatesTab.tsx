/**
 * RatesTab — Presentational Component
 *
 * US-08-B: Room base rate management
 * - View current rate per room
 * - Create new rate (archives previous automatically)
 * - View rate history for audit
 */

import { useState } from "react";
import { PlusIcon, XIcon, ArchiveIcon, DollarSignIcon } from "lucide-react";
import type { RoomBaseRateData, RoomBaseRatePayload, RoomSummary } from "../models";
import { fmtCurrency } from "../models";

interface RatesTabProps {
  rates: RoomBaseRateData[];
  rooms: RoomSummary[];
  onSave: (payload: RoomBaseRatePayload) => Promise<void>;
}

export default function RatesTab({ rates, rooms, onSave }: RatesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [rateRoomId, setRateRoomId] = useState(rooms[0]?.id || "");
  const [rateValue, setRateValue] = useState("");

  const handleSave = async () => {
    if (!rateRoomId || !rateValue) return;
    await onSave({ roomId: rateRoomId, hourlyRate: parseFloat(rateValue) });
    setShowModal(false);
    setRateValue("");
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          La tarifa base por hora es la fuente única para el cálculo de precios.
        </p>
        <button
          onClick={() => { setRateRoomId(rooms[0]?.id || ""); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-900 bg-secondary hover:opacity-70 shrink-0"
        >
          <PlusIcon className="h-4 w-4" /> Nueva Tarifa
        </button>
      </div>

      {/* Room cards */}
      <div className="space-y-4">
        {rooms.map((room) => {
          const roomRates = rates
            .filter((r) => r.roomId === room.id)
            .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
          const current = roomRates.find((r) => !r.effectiveUntil);
          const history = roomRates.filter((r) => r.effectiveUntil);

          return (
            <div key={room.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">{room.name}</span>
                  {current && (
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Activa
                    </span>
                  )}
                </div>
                {current && (
                  <span className="text-2xl font-bold text-gray-900">
                    {fmtCurrency(current.hourlyRate)}
                    <span className="text-sm font-normal text-gray-400"> /hr</span>
                  </span>
                )}
              </div>

              {/* Current rate details */}
              {current ? (
                <div className="px-4 py-3 flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      Vigente desde
                    </span>
                    <p className="text-gray-700 font-medium mt-0.5">
                      {new Date(current.effectiveFrom).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      Moneda
                    </span>
                    <p className="text-gray-700 font-medium mt-0.5">{current.currency}</p>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Sin tarifa configurada
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="border-t border-gray-100">
                  <div className="px-4 py-2 bg-gray-50/30">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Historial
                    </span>
                  </div>
                  {history.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center px-4 py-2 text-xs text-gray-400 border-t border-gray-100"
                    >
                      <ArchiveIcon className="h-3.5 w-3.5 mr-2 shrink-0" />
                      <span className="font-medium text-gray-500 w-20">
                        {fmtCurrency(r.hourlyRate)}
                      </span>
                      <span>
                        {new Date(r.effectiveFrom).toLocaleDateString("es-MX", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}{" "}
                        →{" "}
                        {new Date(r.effectiveUntil!).toLocaleDateString("es-MX", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New rate modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Tarifa Base</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Sala
                </label>
                <select
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                  value={rateRoomId}
                  onChange={(e) => setRateRoomId(e.target.value)}
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tarifa por hora (MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  placeholder="400"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  La tarifa anterior se archivará automáticamente.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!rateRoomId || !rateValue}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-secondary hover:opacity-70 rounded-md disabled:opacity-50"
              >
                Guardar Tarifa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}