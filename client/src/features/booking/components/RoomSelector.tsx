/**
 * RoomSelector — Presentational Component
 *
 * Muestra las salas disponibles como cards.
 * El usuario elige una sala directamente — sin paquetes en este paso.
 * Los planes se sugieren después si se necesitan más de 4 horas.
 *
 * ZERO business logic — solo recibe props y renderiza.
 */

import { UsersIcon, WifiIcon, ArrowRightIcon } from "lucide-react";
import type { Room } from "../models";

interface RoomSelectorProps {
  rooms: Room[];
  isLoading: boolean;
  onSelectRoom: (room: Room) => void; // ← Solo recibe la sala
}

export default function RoomSelector({
  rooms,
  isLoading,
  onSelectRoom,
}: RoomSelectorProps) {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white opacity-70 text-sm animate-pulse">
          Cargando salas disponibles...
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 text-white opacity-60">
        No hay salas disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">
        Selecciona una sala
      </h3>

      {rooms.map((room) => {
        const hourlyRate = room.baseRates?.[0]
          ? Number(room.baseRates[0].hourlyRate)
          : null;

        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelectRoom(room)}
            className="w-full text-left bg-white bg-opacity-10 backdrop-blur-sm rounded-lg border border-white border-opacity-20 p-4 hover:bg-opacity-20 hover:border-opacity-40 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Nombre */}
                <h4 className="text-white font-semibold text-base">
                  {room.name}
                </h4>

                {/* Capacidad */}
                <div className="flex items-center gap-1 mt-1 text-white opacity-70 text-sm">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>Hasta {room.capacity} personas</span>
                </div>

                {/* Amenidades */}
                {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white bg-opacity-10 rounded-full text-white text-xs"
                      >
                        {amenity === "wifi" && <WifiIcon className="h-3 w-3" />}
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Precio y flecha */}
              <div className="text-right ml-4 shrink-0 flex flex-col items-end justify-between h-full gap-3">
                {hourlyRate !== null ? (
                  <div className="text-white font-bold text-lg">
                    ${hourlyRate}
                    <span className="text-xs font-normal opacity-70">/hr</span>
                  </div>
                ) : (
                  <div className="text-white text-sm opacity-50">Sin tarifa</div>
                )}

                <ArrowRightIcon className="h-4 w-4 text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}