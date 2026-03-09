import { ChevronDownIcon, Building2Icon } from "lucide-react";
import type { RoomSummary } from "../models";

interface RoomSelectorProps {
  rooms: RoomSummary[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
}

export default function RoomSelector({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: RoomSelectorProps) {
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  if (rooms.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-500 text-sm font-medium">
        <Building2Icon className="h-4 w-4" />
        <span>Crea tu primera sala para configurar</span>
      </div>
    );
  }

  return (
    <div className="relative group flex items-center bg-background/85 hover:bg-background/70 transition-colors rounded-lg border border-zinc-700 px-4 py-2 cursor-pointer shadow-sm">
      <Building2Icon className="h-5 w-5 text-secondary/30 mr-3 shrink-0" />
      <div className="flex flex-col mr-6">
        <span className="text-[10px] uppercase tracking-wider text-secondary/30 font-bold">
          Sala Seleccionada
        </span>
        <span className="text-sm font-semibold text-secondary">
          {selectedRoom?.name || "Selecciona una sala..."}
        </span>
      </div>
      
      {/* El select nativo transparente superpuesto para funcionalidad nativa en móviles/desktop */}
      <select
        value={selectedRoomId}
        onChange={(e) => onSelectRoom(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {rooms.map((room) => (
          <option key={room.id} value={room.id} className="bg-zinc-800 text-white">
            {room.name}
          </option>
        ))}
      </select>
      
      <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
    </div>
  );
}