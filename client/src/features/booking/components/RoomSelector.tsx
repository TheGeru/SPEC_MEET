import { UsersIcon, WifiIcon, InfoIcon, ArrowRightIcon } from "lucide-react"; // 👈 Añadimos InfoIcon
import { Link } from "react-router-dom"; // 👈 Necesario para navegar
import type { Room } from "../models";

interface RoomSelectorProps {
  rooms: Room[];
  isLoading: boolean;
  onSelectRoom: (room: Room) => void;
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
          /* 1. Cambiamos de button a div para evitar conflictos de anidamiento */
          <div
            key={room.id}
            className="group relative w-full bg-white bg-opacity-10 backdrop-blur-sm rounded-lg border border-white border-opacity-20 p-4 hover:bg-opacity-15 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-white font-semibold text-base">
                  {room.name}
                </h4>

                <div className="flex items-center gap-1 mt-1 text-white opacity-70 text-sm">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>Hasta {room.capacity} personas</span>
                </div>

                {/* Amenidades rápidas */}
                {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white bg-opacity-10 rounded-full text-white text-[10px] uppercase tracking-wider"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Lógica de Precios */}
              <div className="text-right ml-4 shrink-0">
                {hourlyRate !== null ? (
                  <div className="text-white font-bold text-lg">
                    ${hourlyRate}
                    <span className="text-xs font-normal opacity-70">/hr</span>
                  </div>
                ) : (
                  <div className="text-white text-sm opacity-50">Sin tarifa</div>
                )}
              </div>
            </div>

            {/* --- ACCIONES --- */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-white border-opacity-10">
              {/* Botón Principal: Seleccionar */}
              <button
                onClick={() => onSelectRoom(room)}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-2 rounded-md font-medium hover:bg-opacity-90 transition-all active:scale-95"
              >
                Reservar ahora
                <ArrowRightIcon className="h-4 w-4" />
              </button>

              {/* Botón Secundario: Info (Lleva a la segunda imagen que me mostraste) */}
              <Link
                to="/features"
                className="px-4 py-2 border border-white border-opacity-20 text-white rounded-md hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center"
                title="Ver características detalladas"
              >
                <InfoIcon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}