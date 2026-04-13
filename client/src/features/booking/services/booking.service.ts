/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — SERVICE (API Layer)
 * ══════════════════════════════════════════════════════════════
 */

import api from "@infrastructure/axios";
import type {
  CreateReservationPayload,
  ExistingReservation,
  Room,
} from "../models";

// 🆕 Actualizamos la respuesta para que coincida con lo que el backend envía ahora
interface CreateReservationResponse {
  clientSecret?: string; // Es opcional porque si el total es $0 (Gift Card), no hay secret
  reservationId: string;
}

interface ReservationByDateResponse {
  start: string;
  end: string;
  type: string;
}

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>("/rooms");
  return response.data;
};

export const fetchRoomById = async (roomId: string): Promise<Room> => {
  const response = await api.get<Room>(`/rooms/${roomId}`);
  return response.data;
};

export const fetchReservationsByDate = async (
  roomId: string,
  date: string
): Promise<ExistingReservation[]> => {
  const response = await api.get<ReservationByDateResponse[]>(
    `/reservations?roomId=${roomId}&date=${date}`
  );
  return response.data.map((res) => ({
    start: new Date(res.start),
    end:   new Date(res.end),
  }));
};

export const fetchMyBookedDates = async (): Promise<string[]> => {
  const response = await api.get<string[]>("/reservations/my-reservations");
  return response.data;
};

/**
 * Create a new reservation.
 * 🆕 Ahora soporta implícitamente discountCodeId porque viene en el payload.
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

/**
 * 🆕 EXTENDER RESERVA (Lo último que añadimos para el Dashboard)
 * Permite al usuario pagar por tiempo extra desde su panel.
 */
export const extendReservation = async (
  reservationId: string, 
  additionalHours: number
): Promise<{ clientSecret: string; totalAmount: number }> => {
  const response = await api.post(`/reservations/${reservationId}/extend`, {
    additionalHours
  });
  return response.data;
};

export const fetchBusinnesConfig = async () => {
  const response = await api.get("/admin/settings/business");
  return response.data;
}