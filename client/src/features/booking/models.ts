/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — MODELS (Types + Zod Schemas)
 * ══════════════════════════════════════════════════════════════
 *
 * Single source of truth for ALL booking-related types.
 * Uses const types pattern (required by TS skill) and Zod 4 schemas.
 */

import { z } from "zod";

// ─── CONST TYPES (Single source of truth) ─────────────────────

export const BOOKING_STEP = {
  DATE: "date",
  PAYMENT: "payment",
  CONFIRMATION: "confirmation",
} as const;

export type BookingStep = (typeof BOOKING_STEP)[keyof typeof BOOKING_STEP];

export const RESERVATION_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const PAYMENT_METHOD = {
  CARD: "card",
  APPLE_PAY: "applepay",
  GOOGLE_PAY: "googlepay",
  SPEI: "spei",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// ─── FLAT INTERFACES (No inline nesting) ──────────────────────

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ReservationSlot {
  startTime: string;
  endTime: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface BookingSelection {
  roomId: string;
  date: string;
  timeSlot: string;
  duration: number;
}

export interface BookingSummary {
  date: string;
  formattedDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricePerHour: number;
  subtotal: number;
  iva: number;
  total: number;
}

export interface BookingConfirmation {
  reservationId: string;
  accessCode: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPaid: number;
}

export interface ExistingReservation {
  start: Date;
  end: Date;
}

// ─── ZOD SCHEMAS (Zod 4 syntax) ──────────────────────────────

export const createReservationSchema = z.object({
  roomId: z.string().min(1, { error: "Room ID es requerido" }),
  startTime: z.string().min(1, { error: "Hora de inicio es requerida" }),
  endTime: z.string().min(1, { error: "Hora de fin es requerida" }),
  termsAccepted: z.literal(true, {
    error: "Debes aceptar los términos y condiciones",
  }),
  acceptedVersion: z.string().min(1),
});

export type CreateReservationPayload = z.infer<typeof createReservationSchema>;

// ─── CONSTANTS ────────────────────────────────────────────────

export const BOOKING_CONFIG = {
  PRICE_PER_HOUR: 200,
  IVA_RATE: 0.16,
  CLEANING_BUFFER_MINUTES: 30,
  OPERATION_START_HOUR: 9,
  OPERATION_END_HOUR: 18,
  MAX_DURATION_HOURS: 4,
  TERMS_VERSION: "1.0",
} as const;