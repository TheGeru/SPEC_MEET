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
  // Implements US-01: 30-minute cleaning buffer after each reservation
  const isSlotAvailable = (dateStr: string, timeStr: string, duration: number): boolean => {
    if (existingReservations.length === 0) return true;

    const proposedStart = new Date(`${dateStr}T${timeStr}:00`);
    const proposedEnd = new Date(proposedStart);
    proposedEnd.setHours(proposedEnd.getHours() + duration);

    const cleaningBufferMs =
      BOOKING_CONFIG.CLEANING_BUFFER_MINUTES * 60 * 1000;

    return !existingReservations.some((reservation) => {
        const start = reservation.start instanceof Date ? reservation.start : new Date(reservation.start);
        const end = reservation.end instanceof Date ? reservation.end : new Date(reservation.end);

        const busyStart = start.getTime() - cleaningBufferMs;
        const busyEnd = end.getTime() + cleaningBufferMs;
        
      return (
        proposedStart.getTime() < busyEnd && 
        proposedEnd.getTime() > busyStart
      );
    });
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
  };
};