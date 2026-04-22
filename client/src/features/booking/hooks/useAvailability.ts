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
  fetchBusinnesConfig,
} from "../services/booking.service";

interface UseAvailabilityProps {
  roomId: string;
}

interface UseAvailabilityReturn {
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
  isDayFullyOccupied: (dateStr: string, duration: number) => boolean;
  isDayValidForPlan: (dateStr: string, startTime: string, endTime: string) => boolean;
  businessConfig: any;
  refreshAvailability: (date: string) => Promise<void>;
  refreshMyBookings: () => Promise<void>;
}

export const useAvailability = ({roomId}: UseAvailabilityProps): UseAvailabilityReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [existingReservations, setExistingReservations] = useState<ExistingReservation[]>([]);
  const [myBookedDates, setMyBookedDates] = useState<string[]>([]);
  const [businessConfig, setBusinessConfig] = useState<any>(null);

  useEffect(() => {
    const loadBusinessConfig = async () => {
      try {
        const config = await fetchBusinnesConfig();
        setBusinessConfig(config);
      } catch (error) {
        console.error("Error cargando configuración del negocio:", error);
      }
    };
    loadBusinessConfig();
  }, []);

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
    if(!date) return [];

    const now = new Date();
    const today = new Date(); today.setHours(0,0,0,0);
    const checkDate = new Date(`${date}T12:00:00`); checkDate.setHours(0,0,0,0);

    if(checkDate < today) return[];

    const slots: string[] = [];
    const startH = BOOKING_CONFIG.OPERATION_START_HOUR;
    const endH =BOOKING_CONFIG.OPERATION_END_HOUR;

    for(let h = startH; h < endH; h++){
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`)
    }

    if(checkDate.getTime() === today.getTime()){
      return slots.filter(slot => {
        const [h, m] = slot.split(":").map(Number);
        if(h > now.getHours()) return true;
        if(h === now.getHours() && m > now.getMinutes())return true;
        return false;
      });
    }
    return slots;
  };

// ── Check if a specific slot is available ───────────────────
  const isSlotAvailable = (dateStr: string, timeStr: string, duration: number): boolean => {
    const proposedStart = new Date(`${dateStr}T${timeStr}:00`);
    const proposedEnd = new Date(proposedStart);

    const numericDuration = Number(duration) || 1; 
    proposedEnd.setMinutes(proposedEnd.getMinutes() + (numericDuration * 60));

    // 1. REGLA DE ORO (El límite de la cancha): 
    // La reserva en sí misma NO puede terminar después del cierre
    const closingTime = new Date(
      `${dateStr}T${String(BOOKING_CONFIG.OPERATION_END_HOUR).padStart(2, '0')}:00:00`);
    
    if (proposedEnd > closingTime) return false;

    // Si pasamos el filtro del cierre y no hay reservas previas, la cancha es libre
    if (existingReservations.length === 0) return true;

    // 2. REVISIÓN DE CHOQUES (Los defensas con buffer):
    const cleaningBufferMs = BOOKING_CONFIG.CLEANING_BUFFER_MINUTES * 60 * 1000;

    return !existingReservations.some(r => {
      const start = r.start instanceof Date ? r.start : new Date(r.start);
      const end = r.end instanceof Date ? r.end : new Date(r.end);
      const buffer = r.type === 'MAINTENANCE' ? 0 : cleaningBufferMs;
      const busyStart = start.getTime() - buffer;
      const busyEnd = end.getTime() + buffer;
      return (
        proposedStart.getTime() < busyEnd && 
        proposedEnd.getTime() > busyStart
      );
    });
  };

  const isDayFullyOccupied = (dateStr: string, duration: number): boolean => {
    const slots = getAvailableTimeSlots(dateStr);
    if (slots.length === 0) return true;
    return !slots.some(slot => isSlotAvailable(dateStr, slot, duration));
  };

  // Esta función debe verificar si existe AL MENOS un espacio donde quepa el plan completo
  const isDayValidForPlan = (dateStr: string, startTime: string, endTime: string): boolean => {
    const start = new Date(`${dateStr}T${startTime}:00`);
    const end = new Date(`${dateStr}T${endTime}:00`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    //verificamos el bloque exacto del plan
    return isSlotAvailable(dateStr, startTime, durationHours);
  };
  // ── Check if a calendar day has any reservations ────────────
  const hasDayReservations = (day: Date): boolean => {
    const calendarStr = day.toISOString().split("T")[0];
    return existingReservations.some((r) => {
      const start = r.start instanceof Date ? r.start : new Date(r.start);
      return start.toISOString().split("T")[0] === calendarStr;
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
    isDayFullyOccupied,
    refreshAvailability,
    refreshMyBookings,
    isDayValidForPlan,
    businessConfig
  };
};