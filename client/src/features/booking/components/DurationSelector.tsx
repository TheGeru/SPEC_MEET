/**
 * DurationSelector — Presentational Component
 *
 * Allows user to pick 1-4 hour duration.
 * Only shown after a time slot is selected.
 * Shows a "¿Necesitas más tiempo?" banner after seleccionar duración.
 */

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
  if (!visible) return null;

  const options = Array.from(
    { length: BOOKING_CONFIG.MAX_DURATION_HOURS },
    (_, i) => i + 1
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white mb-2">
        Duración (horas)
      </label>
      <div className="grid grid-cols-4 gap-3">
        {options.map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => onSelectDuration(hours)}
            className={`py-2 px-3 rounded-md text-center transition-all ${
              selectedDuration === hours
                ? "bg-white bg-opacity-30 text-white"
                : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
            }`}
          >
            {hours} {hours === 1 ? "hora" : "horas"}
          </button>
        ))}
      </div>

      {/* Banner de planes */}
      <Link
        to="/plans"
        className="flex items-center justify-between w-full mt-2 px-4 py-3 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-15 hover:bg-opacity-10 hover:border-opacity-30 transition-all group"
      >
        <div>
          <p className="text-white text-sm font-medium">
            ¿Necesitas más tiempo?
          </p>
          <p className="text-white text-xs opacity-60 mt-0.5">
            Consulta nuestros planes de medio día y día completo
          </p>
        </div>
        <ArrowRightIcon className="h-4 w-4 text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
      </Link>
    </div>
  );
}