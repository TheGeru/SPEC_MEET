import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { BOOKING_CONFIG } from "../models";

interface DurationSelectorProps {
  selectedDuration: number;
  onSelectDuration: (hours: number) => void;
  visible: boolean;
}

export default function DurationSelector({
  selectedDuration,
  onSelectDuration,
  visible,
}: DurationSelectorProps) {
  // Si el componente no debe ser visible (ej: es un Plan), no renderizamos nada
  if (!visible) return null;

  // 🚀 EFICIENCIA: Generamos las opciones basadas en el límite de reserva normal.
  // Si en models.ts pusiste 4, aquí saldrán 1, 2, 3, 4.
  const options = Array.from(
    { length: BOOKING_CONFIG.MAX_DURATION_HOURS },
    (_, i) => i + 1
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <label className="block text-xs font-black text-white/60 mb-2 uppercase tracking-[0.2em]">
        ¿Cuántas horas necesitas?
      </label>
      
      <div className="grid grid-cols-4 gap-3">
        {options.map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => onSelectDuration(hours)}
            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              selectedDuration === hours
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
            }`}
          >
            {hours} {hours === 1 ? "hr" : "hrs"}
          </button>
        ))}
      </div>

      {/* Banner de planes — Muy importante para invitar al Upsell */}
      <Link
        to="/plans"
        className="flex items-center justify-between w-full mt-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 hover:border-purple-500/30 transition-all group shadow-lg backdrop-blur-sm"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <p className="text-white text-sm font-bold">
              ¿Necesitas mas tiempo?
            </p>
          </div>
          <p className="text-white/50 text-[11px] mt-1 leading-tight">
            Puedes revisar nuestros planes.
          </p>
        </div>
        <ArrowRightIcon className="h-5 w-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-4" />
      </Link>
    </div>
  );
}