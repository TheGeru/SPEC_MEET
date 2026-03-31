/**
 * ══════════════════════════════════════════════════════════════
 * ADMIN-SETTINGS FEATURE — MODELS
 * ══════════════════════════════════════════════════════════════
 *
 * Types ALIGNED to Prisma schema. No more mismatches.
 *
 * Prisma → Frontend mapping:
 *   BusinessConfig → BusinessConfigData (location + cancellation + hours)
 *   TermsConfig    → TermsConfigData
 *   Room           → RoomWifiData (wifi_ssid, wifi_pass subset)
 *   PricePackage   → PricePackageData (full CRUD)
 *   RoomBaseRate   → RoomBaseRateData (temporal rates)
 */

import { z } from "zod";

// ─── CONST TYPES ──────────────────────────────────────────────

export const SETTINGS_TAB = {
  LOCATION: "location",
  CANCELLATION: "cancellation",
  ROOMS: "rooms",
  WIFI: "wifi",
  TERMS: "terms",
  PACKAGES: "packages",
  RATES: "rates",
} as const;

export type SettingsTab = (typeof SETTINGS_TAB)[keyof typeof SETTINGS_TAB];

export const BILLING_UNIT = {
  HOUR: "hour",
  HALF_DAY: "half_day",
  FULL_DAY: "full_day",
  FLAT: "flat",
  CUSTOM: "custom",
} as const;

export type BillingUnit = (typeof BILLING_UNIT)[keyof typeof BILLING_UNIT];

export const BILLING_LABELS: Record<BillingUnit, string> = {
  [BILLING_UNIT.HOUR]: "Por Hora",
  [BILLING_UNIT.HALF_DAY]: "Medio Día",
  [BILLING_UNIT.FULL_DAY]: "Día Completo",
  [BILLING_UNIT.FLAT]: "Tarifa Fija",
  [BILLING_UNIT.CUSTOM]: "Personalizado",
};

export const BILLING_STYLES: Record<BillingUnit, string> = {
  [BILLING_UNIT.HOUR]: "bg-blue-50 text-blue-700 border-blue-200",
  [BILLING_UNIT.HALF_DAY]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [BILLING_UNIT.FULL_DAY]: "bg-amber-50 text-amber-700 border-amber-200",
  [BILLING_UNIT.FLAT]: "bg-purple-50 text-purple-700 border-purple-200",
  [BILLING_UNIT.CUSTOM]: "bg-rose-50 text-rose-700 border-rose-200",
};

// ─── INTERFACES — Aligned to Prisma ──────────────────────────

/** Maps to Prisma: BusinessConfig (singleton, id=1) */
export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessConfigData {
  id: number;
  locationName: string;
  address: string;
  accessInstructions: string | null;
  openingHours: Record<string, DaySchedule>;
  refundFullHours: number;
  refundPartialHours: number;
  refundPartialPct: number;
}

/** Maps to Prisma: TermsConfig */
export interface TermsConfigData {
  id: string;
  version: string;
  isActive: boolean;
  templateContent: string;
  additionalClauses: string | null;
  privacyOptions: PrivacyOptions;
}

export interface PrivacyOptions {
  collectEmail: boolean;
  shareData: boolean;
  cctvNotice: boolean;
  cookieConsent: boolean;
}

/** Maps to Prisma: Room (wifi subset) */
export interface RoomWifiData {
  id: string;
  name: string;
  wifi_ssid: string;
  wifi_pass: string;
  capacity: number;
}

/** Maps to Prisma: Room (full model for CRUD) */
export interface RoomData {
  id: string;
  name: string;
  wifi_ssid: string;
  wifi_pass: string;
  capacity: number;
  status: string;
  ttlock_lock_id: string | null;
  amenities: string[];
  locationId: number;
  createdAt: string;
}

/** Room summary (for dropdowns + selector) */
export interface RoomSummary {
  id: string;
  name: string;
}

/** Maps to Prisma: PricePackage */
export interface ScheduleOption {
  label: string;
  startTime: string;
  endTime: string;
}

export interface PackageMetadata {
  discountPct?: number;
  blockHours?: number;
  bulkEligible?: boolean;
  schedule?: {
    type: string;
    options: ScheduleOption[];
  };
  [key: string]: unknown;
}

export interface PricePackageData {
  id: string;
  name: string;
  description: string | null;
  billingUnit: BillingUnit;
  minDuration: number | null;
  maxDuration: number | null;
  metadata: PackageMetadata;
  roomId: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Maps to Prisma: RoomBaseRate */
export interface RoomBaseRateData {
  id: string;
  roomId: string;
  hourlyRate: number;
  currency: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  createdAt: string;
}

// ─── ZOD SCHEMAS ──────────────────────────────────────────────

export const businessConfigSchema = z.object({
  locationName: z.string().min(1, { error: "Nombre requerido" }),
  address: z.string().min(1, { error: "Dirección requerida" }),
  accessInstructions: z.string().nullable(),
  openingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })),
  refundFullHours: z.number().int().min(0),
  refundPartialHours: z.number().int().min(0),
  refundPartialPct: z.number().int().min(0).max(100),
});

export type BusinessConfigPayload = z.infer<typeof businessConfigSchema>;

export const termsConfigSchema = z.object({
  templateContent: z.string().min(1, { error: "Plantilla requerida" }),
  additionalClauses: z.string().nullable(),
  privacyOptions: z.object({
    collectEmail: z.boolean(),
    shareData: z.boolean(),
    cctvNotice: z.boolean(),
    cookieConsent: z.boolean(),
  }),
});

export type TermsConfigPayload = z.infer<typeof termsConfigSchema>;

export const roomWifiSchema = z.object({
  wifi_ssid: z.string().min(1, { error: "Nombre de red requerido" }),
  wifi_pass: z.string(),
});

export type RoomWifiPayload = z.infer<typeof roomWifiSchema>;

export const roomCreateSchema = z.object({
  name: z.string().min(1, { error: "Nombre de sala requerido" }),
  wifi_ssid: z.string().default(""),
  wifi_pass: z.string().default(""),
  capacity: z.number().int().min(1).default(10),
  status: z.string().default("ACTIVO"),
  amenities: z.array(z.string()).default([]),
  locationId: z.number().int(),
  ttlock_lock_id: z.string().nullable().default(null),
});

export type RoomCreatePayload = z.infer<typeof roomCreateSchema>;

export const pricePackageSchema = z.object({
  name: z.string().min(1, { error: "Nombre requerido" }),
  description: z.string().nullable(),
  billingUnit: z.enum(["hour", "half_day", "full_day", "flat", "custom"]),
  minDuration: z.number().int().nullable(),
  maxDuration: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  roomId: z.string().nullable(),
  isActive: z.boolean(),
});

export type PricePackagePayload = z.infer<typeof pricePackageSchema>;

export const roomBaseRateSchema = z.object({
  roomId: z.string().min(1, { error: "Sala requerida" }),
  hourlyRate: z.number().min(0, { error: "Tarifa debe ser positiva" }),
});

export type RoomBaseRatePayload = z.infer<typeof roomBaseRateSchema>;

// ─── TEMPLATE VARIABLES (US-07) ──────────────────────────────

export const TEMPLATE_VARIABLES = [
  { key: "{HOURLY_RATE}", label: "Tarifa por hora", example: "$400 MXN" },
  { key: "{FULL_REFUND_HOURS}", label: "Horas reembolso completo", example: "24" },
  { key: "{PARTIAL_REFUND_HOURS}", label: "Horas reembolso parcial", example: "12" },
  { key: "{PARTIAL_REFUND_PERCENTAGE}", label: "% reembolso parcial", example: "50%" },
  { key: "{LOCATION_NAME}", label: "Nombre de la sala", example: "SPEC.MEET Central" },
  { key: "{LOCATION_ADDRESS}", label: "Dirección", example: "Av. Insurgentes..." },
  { key: "{CAPACITY}", label: "Capacidad", example: "10 personas" },
  { key: "{WIFI_NETWORK}", label: "Red WiFi", example: "SPEC_Guest" },
  { key: "{PACKAGES_LIST}", label: "Lista de paquetes", example: "Medio Día: $1,540..." },
] as const;

// ─── HELPERS ──────────────────────────────────────────────────

export const WEEKDAYS = [
  "monday", "tuesday", "wednesday", "thursday",
  "friday", "saturday", "sunday",
] as const;

export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  open: "09:00",
  close: "19:00",
  closed: false,
};

export const SCHEDULE_DOT_COLORS = [
  "bg-amber-400", "bg-violet-500", "bg-emerald-500",
  "bg-rose-400", "bg-blue-500",
] as const;

/** Check if billing type needs discount/schedule fields */
export const needsDiscount = (bu: BillingUnit): boolean =>
  bu !== BILLING_UNIT.HOUR && bu !== BILLING_UNIT.CUSTOM;

export const needsSchedule = (bu: BillingUnit): boolean =>
  bu === BILLING_UNIT.HALF_DAY || bu === BILLING_UNIT.FULL_DAY || bu === BILLING_UNIT.FLAT;

/** Format currency */
export const fmtCurrency = (n: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(n);

/** Format time 24h → 12h */
export const fmtTime = (t: string): string => {
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${hr12.toString().padStart(2, "0")}:${m} ${ampm}`;
};

/** Compute price from base rate + discount */
export const computePrice = (
  rate: number,
  discPct: number,
  hours: number
): { effective: number; total: number; savings: number } => {
  const effective = Math.round(rate * (1 - discPct / 100) * 100) / 100;
  const total = Math.round(effective * hours * 100) / 100;
  const savings = Math.round((rate * hours - total) * 100) / 100;
  return { effective, total, savings };
};