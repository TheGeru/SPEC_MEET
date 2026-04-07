/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — useAvailability Hook
 * ══════════════════════════════════════════════════════════════
 *
 * Encapsulates ALL availability logic:
 * - Fetching rooms
 * - Fetching existing reservations for a date
 * - Calculating which time slots are available
 * - 30-minute cleaning buffer (US-01 acceptance criteria)
 * - Blocking past time slots for today
 *
 * This is the "Chef" — the business logic for availability.
 * Components just call isSlotAvailable(time) and get a boolean.
 */

import { useState, useEffect } from "react";
import {
  BOOKING_CONFIG,
  type ExistingReservation,
  type Room,
} from "../models";
import {
  fetchRooms,
  fetchReservationsByDate,
  fetchMyBookedDates,
} from "../services/booking.service";

interface UseAvailabilityProps {
  roomId: string;
}

interface UseAvailabilityReturn {
  // Room
  rooms: Room[];
  isLoadingRoom: boolean;

  // Reservations for selected date
  existingReservations: ExistingReservation[];

  // My bookings (for calendar highlighting)
  myBookedDates: string[];

  // Time slot logic
  getAvailableTimeSlots: (date: string) => string[];
  isSlotAvailable: (date: string, time: string, duration: number) => boolean;
  hasDayReservations: (day: Date) => boolean;
  isDayValidForPlan: (dateStr: string, requiredHours: number) => boolean;
  // Refresh
  refreshAvailability: (date: string) => Promise<void>;
  refreshMyBookings: () => Promise<void>;
}

export const useAvailability = ({roomId}: UseAvailabilityProps): UseAvailabilityReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [existingReservations, setExistingReservations] = useState<
    ExistingReservation[]
  >([]);
  const [myBookedDates, setMyBookedDates] = useState<string[]>([]);

  // ── Load default room on mount ──────────────────────────────
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setIsLoadingRoom(false);
      }
    };
    loadRooms ();
  }, []);

  // ── Load my booked dates on mount ───────────────────────────
  useEffect(() => {
    refreshMyBookings();
  }, []);

  // ── Refresh availability for a specific date ────────────────
  const refreshAvailability = async (date: string) => {
    if (!roomId || !date) return;
    try {
      const reservations = await fetchReservationsByDate(roomId, date);
      setExistingReservations(reservations);
    } catch (error) {
      console.error("Error loading availability:", error);
    }
  };

  const refreshMyBookings = async () => {
    try {
      const dates = await fetchMyBookedDates();
      setMyBookedDates(dates);
    } catch (error) {
      console.error("Error loading my bookings:", error);
    }
  };

  // ── Generate time slots for a given date ────────────────────
  const getAvailableTimeSlots = (date: string): string[] => {
    const slots: string[] = [];
    let hour = BOOKING_CONFIG.OPERATION_START_HOUR;
    const endHour = BOOKING_CONFIG.OPERATION_END_HOUR;

    while (hour < endHour) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
      hour++;
    }
    slots.push(`${endHour}:00`);

    if (!date) return slots;

    // Filter out past time slots if date is today
    const now = new Date();
    const selectedDateObj = new Date(`${date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(selectedDateObj);
    checkDate.setHours(0, 0, 0, 0);

    if(checkDate < today) return [];

    if (checkDate.getTime() === today.getTime()) {

      return slots.filter((slot) => {
        const [slotHour, slotMin] = slot.split(":").map(Number);
        if (slotHour > now.getHours()) return true;
        if (slotHour === now.getHours() && slotMin > now.getMinutes()) return true;
        return false;
      });
    }

    return slots;
  };

// ── Check if a specific slot is available ───────────────────
  const isSlotAvailable = (dateStr: string, timeStr: string, duration: number): boolean => {
    const proposedStart = new Date(`${dateStr}T${timeStr}:00`);
    const proposedEnd = new Date(proposedStart);
    
    // 🚀 FIX CRÍTICO: Forzamos que la duración sea un número y sumamos MINUTOS.
    // Esto evita la concatenación de strings ("812") y soporta fracciones (1.5h).
    const numericDuration = Number(duration) || 1; 
    proposedEnd.setMinutes(proposedEnd.getMinutes() + (numericDuration * 60));

    // 1. REGLA DE ORO (El límite de la cancha): 
    // La reserva en sí misma NO puede terminar después del cierre
    const closingTime = new Date(`${dateStr}T${String(BOOKING_CONFIG.OPERATION_END_HOUR).padStart(2, '0')}:00:00`);
    
    if (proposedEnd.getTime() > closingTime.getTime()) {
      return false; // Si termina después del cierre, bloqueamos.
    }

    // Si pasamos el filtro del cierre y no hay reservas previas, la cancha es libre
    if (existingReservations.length === 0) return true;

    // 2. REVISIÓN DE CHOQUES (Los defensas con buffer):
    const cleaningBufferMs = BOOKING_CONFIG.CLEANING_BUFFER_MINUTES * 60 * 1000;

    return !existingReservations.some((reservation) => {
      const start = reservation.start instanceof Date ? reservation.start : new Date(reservation.start);
      const end = reservation.end instanceof Date ? reservation.end : new Date(reservation.end);

      // Expandimos la "sombra" de la reserva existente para incluir limpieza
      const busyStart = start.getTime() - cleaningBufferMs;
      const busyEnd = end.getTime() + cleaningBufferMs;
        
      return (
        proposedStart.getTime() < busyEnd && 
        proposedEnd.getTime() > busyStart
      );
    });
  };
  

    // Esta función debe verificar si existe AL MENOS un espacio donde quepa el plan completo
    const isDayValidForPlan = (dateStr: string, requiredHours: number): boolean => {
      //console.log(`\n📅 3. EVALUANDO DÍA: ${dateStr} para ${requiredHours} horas`);
      const slots = getAvailableTimeSlots(dateStr);
      //console.log(`🕒 4. Slots generados para el día:`, slots.length > 0 ? slots : "NINGUNO (Día bloqueado por getAvailableTimeSlots)");
      return slots.some(slot => isSlotAvailable(dateStr, slot, requiredHours))
    };
  // ── Check if a calendar day has any reservations ────────────
  const hasDayReservations = (day: Date): boolean => {
    const calendarStr = day.toISOString().split("T")[0];
    return existingReservations.some((r) => {
        console.log("🔍 r.start vale:", r.start, "tipo:", typeof r.start);
        const startDate = r.start instanceof Date ? r.start : new Date(r.start);
        const reservationDateStr = startDate.toISOString().split("T")[0];
        return reservationDateStr === calendarStr;
    });
  };

  return {
    rooms,
    isLoadingRoom,
    existingReservations,
    myBookedDates,
    getAvailableTimeSlots,
    isSlotAvailable,
    hasDayReservations,
    refreshAvailability,
    refreshMyBookings,
    isDayValidForPlan,
  };
};