/**
 * USER-DASHBOARD FEATURE — SERVICE
 *
 * REAL endpoints 
 *   GET  /dashboard/user-stats
 *   GET  /user/my-discounts
 *   POST /cancellations/:id/cancel
 *   POST /reservations/:id/extend
 */

import api from "@infrastructure/axios";
import type { DashboardData, Discount, ExtensionResponse } from "../models";

export const fetchUserStats = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>("/dashboard/user-stats");
  return data;
};

export const fetchMyDiscounts = async (): Promise<Discount[]> => {
  const { data } = await api.get<Discount[]>("/user/my-discounts");
  return data;
};

export const cancelReservation = async (reservationId: string): Promise<void> => {
  await api.post(`/cancellations/${reservationId}/cancel`);
};

export const extendReservation = async (
  reservationId: string,
  additionalHours: number
): Promise<ExtensionResponse> => {
  const { data } = await api.post<ExtensionResponse>(
    `/reservations/${reservationId}/extend`,
    { additionalHours }
  );
  return data;
};