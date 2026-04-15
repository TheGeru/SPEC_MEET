/**
 * ══════════════════════════════════════════════════════════════
 * ADMIN-SETTINGS FEATURE — useAdminSettings Hook
 * ══════════════════════════════════════════════════════════════
 *
 * Manages ALL settings state:
 * - Parallel data loading on mount (BusinessConfig + Terms + Wi-Fi + Packages + Rates)
 * - Independent save functions per section
 * - Room list for dropdowns
 *
 * WHY one hook for all tabs?
 * Because US-07 requires that changing cancellation policy in BusinessConfig
 * IMMEDIATELY reflects in the Terms template preview. If we split into
 * separate hooks, we'd need cross-hook communication — worse than one hook.
 */

import { useState, useEffect } from "react";
import type {
  BusinessConfigData,
  TermsConfigData,
  RoomWifiData,
  RoomData,
  PricePackageData,
  RoomBaseRateData,
  RoomSummary,
  DaySchedule,
  PricePackagePayload,
  RoomBaseRatePayload,
} from "../models";
import { DEFAULT_DAY_SCHEDULE, WEEKDAYS } from "../models";
import {
  fetchBusinessConfig,
  updateBusinessConfig,
  fetchTermsConfig,
  updateTermsConfig,
  fetchRoomWifi,
  updateRoomWifi,
  fetchPackages,
  createPackage,
  updatePackage,
  togglePackageActive,
  deletePackage,
  fetchBaseRates,
  createBaseRate,
  fetchRoomsFull,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../services/AdminSettings.service";

// ─── Save status per section ──────────────────────────────────

interface SaveStatus {
  saving: boolean;
  success: boolean;
  error: string | null;
}

const INITIAL_SAVE: SaveStatus = { saving: false, success: false, error: null };

// ─── Return type ──────────────────────────────────────────────

interface UseAdminSettingsReturn {
  // Loading
  isLoading: boolean;
  loadError: string | null;

  // Data
  businessConfig: BusinessConfigData | null;
  termsConfig: TermsConfigData | null;
  roomWifi: RoomWifiData | null;
  packages: PricePackageData[];
  rates: RoomBaseRateData[];
  rooms: RoomSummary[];
  roomsFull: RoomData[];

  // Selected room (for room-dependent tabs)
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;

  // Setters (for form binding)
  setBusinessConfig: React.Dispatch<React.SetStateAction<BusinessConfigData | null>>;
  setTermsConfig: React.Dispatch<React.SetStateAction<TermsConfigData | null>>;
  setRoomWifi: React.Dispatch<React.SetStateAction<RoomWifiData | null>>;

  // Save functions (independent per section)
  saveBusiness: () => Promise<void>;
  saveTerms: () => Promise<void>;
  saveWifi: () => Promise<void>;

  // Room CRUD
  createNewRoom: (data: { name: string; capacity: number; wifi_ssid: string; wifi_pass: string; status: string; amenities: string[] }) => Promise<void>;
  updateExistingRoom: (id: string, data: { name: string; capacity: number; wifi_ssid: string; wifi_pass: string; status: string; amenities: string[] }) => Promise<void>;
  deleteExistingRoom: (id: string) => Promise<void>;

  // Package CRUD
  savePackage: (id: string | null, payload: PricePackagePayload) => Promise<void>;
  togglePkg: (id: string, isActive: boolean) => Promise<void>;
  deletePkg: (id: string) => Promise<void>;

  // Rate management
  saveRate: (payload: RoomBaseRatePayload) => Promise<void>;

  // Save statuses
  businessSave: SaveStatus;
  termsSave: SaveStatus;
  wifiSave: SaveStatus;
  packageSave: SaveStatus;
  rateSave: SaveStatus;
}

export function useAdminSettings(): UseAdminSettingsReturn {
  // ── Loading state ───────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Data state ──────────────────────────────────────────────
  const [businessConfig, setBusinessConfig] = useState<BusinessConfigData | null>(null);
  const [termsConfig, setTermsConfig] = useState<TermsConfigData | null>(null);
  const [roomWifi, setRoomWifi] = useState<RoomWifiData | null>(null);
  const [packages, setPackages] = useState<PricePackageData[]>([]);
  const [rates, setRates] = useState<RoomBaseRateData[]>([]);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [roomsFull, setRoomsFull] = useState<RoomData[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // ── Save statuses ───────────────────────────────────────────
  const [businessSave, setBusinessSave] = useState<SaveStatus>(INITIAL_SAVE);
  const [termsSave, setTermsSave] = useState<SaveStatus>(INITIAL_SAVE);
  const [wifiSave, setWifiSave] = useState<SaveStatus>(INITIAL_SAVE);
  const [packageSave, setPackageSave] = useState<SaveStatus>(INITIAL_SAVE);
  const [rateSave, setRateSave] = useState<SaveStatus>(INITIAL_SAVE);

  // ── Load all data in parallel ───────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [businessRes, termsRes, roomsRes, pkgRes, ratesRes] =
          await Promise.allSettled([
            fetchBusinessConfig(),
            fetchTermsConfig(),
            fetchRoomsFull(),
            fetchPackages(),
            fetchBaseRates(),
          ]);

        // Business Config
        if (businessRes.status === "fulfilled") {
          const bc = businessRes.value;
          // Ensure all weekdays exist in openingHours
          const normalizedHours: Record<string, DaySchedule> = {};
          for (const day of WEEKDAYS) {
            normalizedHours[day] = bc.openingHours?.[day] ?? { ...DEFAULT_DAY_SCHEDULE };
          }
          setBusinessConfig({ ...bc, openingHours: normalizedHours });
        }

        // Terms
        if (termsRes.status === "fulfilled") {
          setTermsConfig(termsRes.value);
        }

        // Rooms
        if (roomsRes.status === "fulfilled") {
          const fullRooms = roomsRes.value;
          setRoomsFull(fullRooms);
          setRooms(fullRooms.map((r) => ({ id: r.id, name: r.name })));
          
          // Auto-select first room
          if (fullRooms.length > 0) {
            setSelectedRoomId(fullRooms[0].id);
            // Load wifi for first room
            try {
              const wifi = await fetchRoomWifi(fullRooms[0].id);
              setRoomWifi(wifi);
            } catch {
              console.error("Error loading wifi config");
            }
          }
        }

        // Packages & Rates
        if (pkgRes.status === "fulfilled") setPackages(pkgRes.value);
        if (ratesRes.status === "fulfilled") setRates(ratesRes.value);
      } catch {
        setLoadError("Error general al cargar la configuración");
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  // ── Escuchar cambios en el dropdown de salas ─────────────────
  useEffect(() => {
    // Evitar hacer la petición si es la carga inicial o no hay sala
    if (isLoading || !selectedRoomId) return;

    const fetchSpecificRoomData = async () => {
      try {
        // Actualiza el estado con el Wi-Fi de la nueva sala seleccionada
        const newWifi = await fetchRoomWifi(selectedRoomId);
        setRoomWifi(newWifi);
      } catch (error) {
        console.error("Error al cargar el Wi-Fi de la sala", error);
      }
    };

    fetchSpecificRoomData();
  }, [selectedRoomId, isLoading]);
  

  // ── Save helpers ────────────────────────────────────────────

  const withSave = (
    setter: React.Dispatch<React.SetStateAction<SaveStatus>>
  ) => {
    return async (fn: () => Promise<void>) => {
      setter({ saving: true, success: false, error: null });
      try {
        await fn();
        setter({ saving: false, success: true, error: null });
        setTimeout(() => setter(INITIAL_SAVE), 3000);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al guardar";
        setter({ saving: false, success: false, error: message });
      }
    };
  };

  // ── Save: Business Config ───────────────────────────────────
  const saveBusiness = async () => {
    await withSave(setBusinessSave)(async () => {
      if (!businessConfig) return;
      const updated = await updateBusinessConfig({
        locationName: businessConfig.locationName,
        address: businessConfig.address,
        accessInstructions: businessConfig.accessInstructions,
        openingHours: businessConfig.openingHours,
        refundFullHours: businessConfig.refundFullHours,
        refundPartialHours: businessConfig.refundPartialHours,
        refundPartialPct: businessConfig.refundPartialPct,
      });
      setBusinessConfig(updated);
    });
  };

  // ── Save: Terms ─────────────────────────────────────────────
  const saveTerms = async () => {
    await withSave(setTermsSave)(async () => {
      if (!termsConfig) return;
      const updated = await updateTermsConfig({
        templateContent: termsConfig.templateContent,
        additionalClauses: termsConfig.additionalClauses,
        privacyOptions: termsConfig.privacyOptions,
      });
      setTermsConfig(updated);
    });
  };

  // ── Save: Wi-Fi ─────────────────────────────────────────────
  const saveWifi = async () => {
    await withSave(setWifiSave)(async () => {
      if (!roomWifi) return;
      const updated = await updateRoomWifi(roomWifi.id, {
        wifi_ssid: roomWifi.wifi_ssid,
        wifi_pass: roomWifi.wifi_pass,
      });
      setRoomWifi(updated);
    });
  };

  // ── Package CRUD ────────────────────────────────────────────
  const savePackage = async (id: string | null, payload: PricePackagePayload) => {
    await withSave(setPackageSave)(async () => {
      if (id) {
        const updated = await updatePackage(id, payload);
        setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      } else {
        const created = await createPackage(payload);
        setPackages((prev) => [...prev, created]);
      }
    });
  };

  const togglePkg = async (id: string, isActive: boolean) => {
    const updated = await togglePackageActive(id, isActive);
    setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deletePkg = async (id: string) => {
    await deletePackage(id);
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Rate management ─────────────────────────────────────────
  const saveRate = async (payload: RoomBaseRatePayload) => {
    await withSave(setRateSave)(async () => {
      const created = await createBaseRate(payload);
      // Archive old rate locally (backend handles DB archival)
      setRates((prev) => [
        created,
        ...prev.map((r) =>
          r.roomId === payload.roomId && !r.effectiveUntil
            ? { ...r, effectiveUntil: new Date().toISOString() }
            : r
        ),
      ]);
    });
  };

  // ── Room CRUD ────────────────────────────────────────────────
const createNewRoom = async (data: { 
    name: string; 
    capacity: number; 
    wifi_ssid: string; 
    wifi_pass: string; 
    status: string; 
    amenities: string[];
    ttlock_lock_id?: string | null; // 1. Aquí ya está bien
  }) => {
    if (!businessConfig) throw new Error("BusinessConfig must exist before creating rooms");

    const created = await createRoom({
      ...data,
      locationId: businessConfig.id,
      // 2. AGREGA ESTA LÍNEA AQUÍ ABAJO:
      ttlock_lock_id: data.ttlock_lock_id ?? null, 
    });

    setRoomsFull((prev) => [...prev, created]);
    setRooms((prev) => [...prev, { id: created.id, name: created.name }]);
    if (!selectedRoomId) setSelectedRoomId(created.id);
  };

  const updateExistingRoom = async (id: string, data: { name: string; capacity: number; wifi_ssid: string; wifi_pass: string; status: string; amenities: string[] }) => {
    const updated = await updateRoom(id, data);
    setRoomsFull((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setRooms((prev) => prev.map((r) => (r.id === id ? { id: updated.id, name: updated.name } : r)));
  };

  const deleteExistingRoom = async (id: string) => {
    await deleteRoom(id);
    setRoomsFull((prev) => prev.filter((r) => r.id !== id));
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (selectedRoomId === id) {
      const remaining = roomsFull.filter((r) => r.id !== id);
      setSelectedRoomId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  return {
    isLoading,
    loadError,
    businessConfig,
    termsConfig,
    roomWifi,
    packages,
    rates,
    rooms,
    roomsFull,
    selectedRoomId,
    setSelectedRoomId,
    setBusinessConfig,
    setTermsConfig,
    setRoomWifi,
    saveBusiness,
    saveTerms,
    saveWifi,
    createNewRoom,
    updateExistingRoom,
    deleteExistingRoom,
    savePackage,
    togglePkg,
    deletePkg,
    saveRate,
    businessSave,
    termsSave,
    wifiSave,
    packageSave,
    rateSave,
  };
}