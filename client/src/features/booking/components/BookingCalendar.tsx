/**
 * BookingCalendar — Presentational Component
 *
 * Renders the monthly calendar grid.
 * Highlights: today, selected date, my bookings (blue), occupied (red dot).
 *
 * ZERO API calls. ZERO business logic. Just takes props and renders.
 */

import { useState } from "react";

interface BookingCalendarProps {
  selectedDate: string;
  myBookedDates: string[];
  onSelectDate: (dateStr: string) => void;
  hasDayReservations: (day: Date) => boolean;
  isPlanFlow: boolean;
  selectedDuration: number;
  isDayValidForPlan: (dateStr: string, requiredHours: number) => boolean;
  businessConfig?: any;
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function BookingCalendar({
  selectedDate,
  myBookedDates,
  onSelectDate,
  hasDayReservations,
  isPlanFlow,
  selectedDuration,
  isDayValidForPlan,
  businessConfig,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDayClosed = (date: Date) => {
    if (!businessConfig?.openingHours) return false; 
    
    const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = weekDays[date.getDay()];
    
    const daySettings = businessConfig.openingHours[dayName];
    
    // 🚀 AQUÍ ESTABA EL ERROR: Tu BD usa la palabra "closed", no "isOpen"
    if (daySettings && daySettings.closed === true) {
      return true; // ¡El negocio está cerrado!
    }
    return false;
  };
  // ── Calendar generation ─────────────────────────────────────
  const generateDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    if (direction === "prev") newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const calendarDays = generateDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  return (
    <div>
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">
          {currentMonth.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-md bg-white bg-opacity-10 backdrop-blur-sm text-white hover:bg-opacity-20"
          >
            &lt;
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="p-2 rounded-md bg-white bg-opacity-10 backdrop-blur-sm text-white hover:bg-opacity-20"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-md bg-white bg-opacity-10 backdrop-blur-sm text-white hover:bg-opacity-20"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center p-2 font-medium text-white text-sm"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="h-20 bg-white bg-opacity-5 backdrop-blur-sm rounded-md"
              />
            );
          }

          const dateString = day.toISOString().split("T")[0];

          const isPast = day < today;
          let isPlanInvalid = false;

          if(isPlanFlow && selectedDuration > 0){
            isPlanInvalid = !isDayValidForPlan(dateString, selectedDuration);
          }

          const closedByAdmin = isDayClosed(day)
          const isDisabled = isPast || isPlanInvalid || closedByAdmin;

          const isSelected = dateString === selectedDate;
          const isToday =
            day.getDate() === new Date().getDate() &&
            day.getMonth() === new Date().getMonth() &&
            day.getFullYear() === new Date().getFullYear();
          const isMyBooking = myBookedDates.includes(dateString);
          const hasReservations = hasDayReservations(day);

          return (
            <div
              key={day.toString()}
              className={`h-20 p-1 rounded-md overflow-hidden cursor-pointer relative border transition-all
                ${isDisabled 
                  ? "opacity-20 grayscale pointer-events-none cursor-not-allowed" 
                  : "cursor-pointer hover:bg-white hover:bg-opacity-15"}
                ${isSelected ? "bg-white bg-opacity-30 border-white border-opacity-50" : ""}
                ${isToday && !isSelected ? "bg-white bg-opacity-10 border-blue-400 border-opacity-50" : ""}
                ${!isSelected && !isToday && !isDisabled ? "bg-white bg-opacity-5 border-transparent" : ""}
              `}
              onClick={() => !isDisabled && onSelectDate(dateString)}
            >
              <div
                className={`text-right p-1 text-sm ${
                  isToday ? "font-bold text-blue-300" : "text-white"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="flex flex-col gap-1 items-start pl-1">
                {isMyBooking && (
                  <div className="px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded shadow-sm font-medium w-full truncate">
                    Mi Reserva
                  </div>
                )}
                {hasReservations && !isMyBooking && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full shadow-sm" />
                    <span className="text-[10px] text-red-200/70 hidden sm:block">
                      Ocupado
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}