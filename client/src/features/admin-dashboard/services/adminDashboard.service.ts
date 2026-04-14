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

// ─── Calendario y Bloqueos (Migrados de admin.api.ts) ────────

export const getAdminCalendarEvents = async (roomId: string, month: number, year: number) => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    
    return await api.get(`/reservations/range`, { 
        params: { roomId, startDate, endDate } 
    });
};

export const createBlock = async (data: { roomId: string, startTime: string, endTime: string, reason: string }) => {
    return await api.post('/admin/settings/blocks', data);
};

export const deleteBlock = async (blockId: string) => {
    return await api.delete(`/admin/settings/blocks/${blockId}`);
};