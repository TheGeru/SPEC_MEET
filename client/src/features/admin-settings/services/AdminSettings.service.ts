/**
 * ══════════════════════════════════════════════════════════════
 * ADMIN-SETTINGS FEATURE — SERVICE
 * ══════════════════════════════════════════════════════════════
 * * Ahora conectado directamente a los endpoints refactorizados del backend.
 * Cero adaptadores necesarios.
 */

import api from "@infrastructure/axios";
import type {
  BusinessConfigData,
  BusinessConfigPayload,
  TermsConfigData,
  TermsConfigPayload,
  RoomWifiData,
  RoomWifiPayload,
  RoomData,
  RoomCreatePayload,
  PricePackageData,
  PricePackagePayload,
  RoomBaseRateData,
  RoomBaseRatePayload,
  RoomSummary,
} from "../models";

// ─── Business Config (Ubicación, Horarios y Reembolsos) ────────

export const fetchBusinessConfig = async (): Promise<BusinessConfigData> => {
  const { data } = await api.get<BusinessConfigData>("/admin/settings/business");
  return data;
};

export const updateBusinessConfig = async (payload: BusinessConfigPayload): Promise<BusinessConfigData> => {
  const { data } = await api.put<BusinessConfigData>("/admin/settings/business", payload);
  return data;
};

// ─── Terms & Conditions ───────────────────────────────────────

export const fetchTermsConfig = async (): Promise<TermsConfigData> => {
  const { data } = await api.get<TermsConfigData>("/admin/settings/terms");
  return data;
};

export const updateTermsConfig = async (payload: TermsConfigPayload): Promise<TermsConfigData> => {
  const { data } = await api.put<TermsConfigData>("/admin/settings/terms", payload);
  return data;
};

// ─── Wi-Fi (Por sala específica) ──────────────────────────────

export const fetchRoomWifi = async (roomId: string): Promise<RoomWifiData> => {
  const { data } = await api.get<RoomWifiData>(`/admin/settings/wifi/${roomId}`);
  return data;
};

export const updateRoomWifi = async (roomId: string, payload: RoomWifiPayload): Promise<RoomWifiData> => {
  const { data } = await api.put<RoomWifiData>(`/admin/settings/wifi/${roomId}`, payload);
  return data;
};

// ─── Price Packages ───────────────────────────────────────────

export const fetchPackages = async (): Promise<PricePackageData[]> => {
  const { data } = await api.get<PricePackageData[]>("/admin/settings/packages");
  return data;
};

export const createPackage = async (payload: PricePackagePayload): Promise<PricePackageData> => {
  const { data } = await api.post<PricePackageData>("/admin/settings/packages", payload);
  return data;
};

export const updatePackage = async (id: string, payload: PricePackagePayload): Promise<PricePackageData> => {
  const { data } = await api.put<PricePackageData>(`/admin/settings/packages/${id}`, payload);
  return data;
};

export const togglePackageActive = async (id: string, isActive: boolean): Promise<PricePackageData> => {
  const { data } = await api.patch<PricePackageData>(`/admin/settings/packages/${id}/toggle`, { isActive });
  return data;
};

export const deletePackage = async (id: string): Promise<void> => {
  await api.delete(`/admin/settings/packages/${id}`);
};

// ─── Room Base Rates ──────────────────────────────────────────

export const fetchBaseRates = async (): Promise<RoomBaseRateData[]> => {
  const { data } = await api.get<RoomBaseRateData[]>("/admin/settings/rates");
  return data;
};

export const createBaseRate = async (payload: RoomBaseRatePayload): Promise<RoomBaseRateData> => {
  const { data } = await api.post<RoomBaseRateData>("/admin/settings/rates", payload);
  return data;
};

// ─── Rooms (CRUD + summaries) ─────────────────────────────────

export const fetchRooms = async (): Promise<RoomSummary[]> => {
  const { data } = await api.get<RoomSummary[]>("/rooms/summary");
  return data;
};

export const fetchRoomsFull = async (): Promise<RoomData[]> => {
  // ⚠️ Corrección: Antes esto apuntaba a /rooms/summary por error. Ahora apunta a la lista completa.
  const { data } = await api.get<RoomData[]>("/rooms");
  return data;
};

export const createRoom = async (payload: RoomCreatePayload): Promise<RoomData> => {
  const { data } = await api.post<{ room: RoomData } | RoomData>("/rooms", payload);
  return 'room' in data ? data.room : data;
};

export const updateRoom = async (id: string, payload: Partial<RoomCreatePayload>): Promise<RoomData> => {
  const { data } = await api.put<{ room: RoomData } | RoomData>(`/rooms/${id}`, payload);
  return 'room' in data? data.room:data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  await api.delete(`/rooms/${id}`);
};