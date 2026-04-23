/**
 * USER-DASHBOARD FEATURE — MODELS
 *
 * Endpoints (REAL):
 *   GET  /dashboard/user-stats       → DashboardData
 *   GET  /user/my-discounts          → Discount[]
 *   POST /cancellations/:id/cancel   → cancel reservation
 *   POST /reservations/:id/extend    → { clientSecret, totalExtra }
 */

// ─── CONST TYPES ──────────────────────────────────────────────

export const DASHBOARD_TAB = {
  UPCOMING: "upcoming",
  PAST: "past",
} as const;

export type DashboardTab = (typeof DASHBOARD_TAB)[keyof typeof DASHBOARD_TAB];

export const TOAST_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type ToastType = (typeof TOAST_TYPE)[keyof typeof TOAST_TYPE];

// ─── INTERFACES (matching real backend response) ──────────────

export interface UserStats {
  activeReservations: number;
  totalHours: number;
  nextReservationDate: string;
}

export interface UserReservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  accessCode: string | null;
  status: string;
  totalAmount: number;
  canCancel: boolean;
  canExtend: boolean;
  invoiceRequested: boolean;
}

export interface DashboardData {
  stats: UserStats;
  upcoming: UserReservation[];
  past: UserReservation[];
}

// ─── DISCOUNTS / GIFT CARDS ───────────────────────────────────

export interface Discount {
  id: string;
  hours: number;
  description: string | null;
  code: string;
  expiresAt: string;
}

// ─── EXTENSION RESPONSE ───────────────────────────────────────

export interface ExtensionResponse {
  clientSecret: string;
  totalExtra: number;
}

// ─── TOAST ────────────────────────────────────────────────────

export interface ToastData {
  msg: string;
  type: ToastType;
}

// ─── USER PLAN (from user's requirements) ─────────────────────

export interface UserPlan {
  name: string;
  description: string;
  isActive: boolean;
}

// ─── ADDITIONAL SERVICES (from user's requirements) ───────────

export const CONTACT_EMAIL = "info@spec.meet";

export const ADDITIONAL_SERVICES = [
  {
    id: "locker",
    name: "Locker con llave",
    description:
      "Guarda tus pertenencias de forma segura durante tu reserva. Solicítalo por correo.",
    emailSubject: "Solicitud de Locker — SPEC.MEET",
    emailBody:
      "Hola, me gustaría solicitar un locker con llave para mi próxima reserva.\n\nNombre: \nFecha de reserva: \nHorario: \n\nGracias.",
  },
] as const;