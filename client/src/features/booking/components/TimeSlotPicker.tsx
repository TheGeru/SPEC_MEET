/**
 * TimeSlotPicker — Presentational Component
 *
 * Renders a grid of time slots for the selected date.
 * Shows available (clickable) vs reserved (disabled, red).
 *
 * Implements US-01: "Los bloques ocupados no deben ser seleccionables"
 */

interface TimeSlotPickerProps {
  date: string;
  timeSlots: string[];
  selectedSlot: string;
  duration: number;
  isSlotAvailable: (date: string, time: string, duration: number) => boolean;
  onSelectSlot: (time: string) => void;
  formatDate: (dateStr: string) => string;
}

export default function TimeSlotPicker({
  date,
  timeSlots,
  selectedSlot,
  duration,
  isSlotAvailable,
  onSelectSlot,
  formatDate,
}: TimeSlotPickerProps) {
  if (!date) return null;

  return (
    <div className="mt-4 bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg">
      <h4 className="text-md font-medium text-white mb-3">
        Horarios disponibles para {formatDate(date)}
      </h4>

      {timeSlots.length === 0 ? (
        <p className="text-white/60 text-sm text-center py-4">
          No hay horarios disponibles para esta fecha
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {timeSlots.map((time) => {
            const available = isSlotAvailable(date, time, duration);

            return (
              <button
                key={time}
                type="button"
                disabled={!available}
                onClick={() => onSelectSlot(time)}
                className={`py-2 px-3 rounded-md text-center transition-all
                  ${
                    !available
                      ? "bg-red-500 bg-opacity-30 text-white cursor-not-allowed"
                      : selectedSlot === time
                        ? "bg-white bg-opacity-30 text-white"
                        : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
                  }
                `}
              >
                {time}
                {!available && <div className="text-xs mt-1">Reservado</div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}