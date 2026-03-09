/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — SERVICE (API Layer)
 * ══════════════════════════════════════════════════════════════
 *
 * Architecture: Repository layer that talks to the backend.
 * This is the ONLY file that makes HTTP calls for booking.
 *
 * Controller (component) → Service (this) → Axios → Backend
 *
 * Scope Rule: LOCAL to booking feature.
 */

import api from "@infrastructure/axios"; // Axios instance with auth interceptors
import type {
  CreateReservationPayload,
  ExistingReservation,
  Room,
} from "../models";

interface CreateReservationResponse {
  clientSecret: string;
  reservationId: string;
}

interface ReservationByDateResponse {
  start_time: string;
  end_time: string;
}

interface MyReservationDate {
  date: string;
}

/**
 * Fetch all available rooms from the system.
 * Currently returns a single room, but designed to scale (RNF-19).
 */
export const fetchRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>("/rooms");
  return response.data;
};

/**
 * Fetch existing reservations for a specific room and date.
 * Used to calculate available time slots.
 */
export const fetchReservationsByDate = async (
  roomId: string,
  date: string
): Promise<ExistingReservation[]> => {
  const response = await api.get<ReservationByDateResponse[]>(
    `/reservations?roomId=${roomId}&date=${date}`
  );

  return response.data.map((res) => ({
    start: new Date(res.start_time),
    end: new Date(res.end_time),
  }));
};

/**
 * Fetch dates where the current user has bookings.
 * Used to highlight "my reservations" in the calendar.
 */
export const fetchMyBookedDates = async (): Promise<string[]> => {
  const response = await api.get<string[]>("/reservations/my-reservations");
  return response.data;
};

/**
 * Create a new reservation and get the Stripe clientSecret for payment.
 * This is the core transaction — creates PENDING reservation + Stripe PaymentIntent.
 */
export const createReservation = async (
  payload: CreateReservationPayload
): Promise<CreateReservationResponse> => {
  const response = await api.post<CreateReservationResponse>(
    "/reservations",
    payload
  );
  return response.data;
};