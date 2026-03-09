/**
 * ADMIN-DASHBOARD FEATURE — SERVICE
 * Single endpoint. The backend aggregates everything.
 */

import api from "@infrastructure/axios";
import type { DashboardData } from "../models";

export const fetchDashboardStats = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>("/dashboard/stats");
  return data;
};