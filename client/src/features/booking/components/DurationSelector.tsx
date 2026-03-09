/**
 * DurationSelector — Presentational Component
 *
 * Allows user to pick 1-4 hour duration.
 * Only shown after a time slot is selected.
 */

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
    <div>
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
    </div>
  );
}