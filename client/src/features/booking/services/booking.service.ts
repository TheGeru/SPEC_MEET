/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — SERVICE (API Layer)
 * ══════════════════════════════════════════════════════════════
 *
 * Repository layer that talks to the backend.
 * This is the ONLY file that makes HTTP calls for booking.
 *
 * Controller (component) → Service (this) → Axios → Backend
 */

import api from "@infrastructure/axios";
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
  start: string;
  end: string;
  type: string;
}

/**
 * Fetch all active rooms.
 * Ahora se usa para mostrar la lista en el paso de selección de sala.
 */
export const fetchRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>("/rooms");
  return response.data;
};

/**
 * 🆕 Fetch a single room with its base rates and packages.
 * Se llama cuando el usuario selecciona una sala para ver sus detalles.
 * El backend devuelve include: { baseRates, packages } en GET /rooms/:id
 */
export const fetchRoomById = async (roomId: string): Promise<Room> => {
  const response = await api.get<Room>(`/rooms/${roomId}`);
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
return response.data.map((res) => {
    console.log("🔍 respuesta del backend:", res);
    return {
        start: new Date(res.start),
        end:   new Date(res.end),
    };
  });
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
 * Ahora incluye packageId en el payload — requerido por el backend.
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