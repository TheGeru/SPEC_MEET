/**
 * ══════════════════════════════════════════════════════════════
 * BACKEND VALIDATION SCHEMAS (THE VAULT DOORS)
 * ══════════════════════════════════════════════════════════════
 * * EVERY route that receives a body (POST, PUT, PATCH) MUST pass through
 * * these schemas via the validateSchema middleware before hitting the controller.
 * * This file is aligned 1:1 with schema.prisma.
 */

import { z } from 'zod';

// ─── AUTHENTICATION SCHEMAS ───────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// ─── CORE SCHEMAS (ROOMS & RESERVATIONS) ──────────────────────

export const roomSchema = z.object({
  name: z.string().min(3, "El nombre de la sala es muy corto"),
  wifi_ssid: z.string().min(1, "El nombre del WiFi (SSID) es obligatorio"),
  wifi_pass: z.string().min(1, "La contraseña del WiFi es obligatoria"),
  capacity: z.number().int().positive("La capacidad debe ser mayor a 0").default(10),
  status: z.string().default("INACTIVO"),
  ttlock_lock_id: z.string().nullable().optional(),
  amenities: z.array(z.string()).default([]),
  locationId: z.number().int().positive().optional()
});

export const reservationSchema = z.object({
  roomId: z.string().uuid({ message: "ID de sala inválido" }),
  packageId: z.string().uuid().optional(),
  startTime: z.coerce.date({ message: "Fecha de inicio inválida" }),
  endTime: z.coerce.date({ message: "Fecha de fin inválida" }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones"
  }),
  acceptedVersion: z.string().min(1, "La versión de los términos es requerida"),

}).superRefine((data, ctx) => {
  const now = new Date();
  if (data.startTime < now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "No puedes hacer una reserva en el pasado",
      path: ["startTime"]
    });
  }
  if (data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La hora de fin debe ser después de la hora de inicio",
      path: ["endTime"]
    });
  }

  const MAX_ADVANCE_DAYS = 90;
  const maxAllowedDate = new Date();
  maxAllowedDate.setDate(maxAllowedDate.getDate() +  MAX_ADVANCE_DAYS);

  if (data.startTime > maxAllowedDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No puedes reservar con más de ${MAX_ADVANCE_DAYS} días de anticipación`,
      path: ["endTime"]
    });
  }
});

// ─── ADMIN SETTINGS SCHEMAS ───────────────────────────────────

// 1. Business Config
export const businessConfigSchema = z.object({
  locationName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().min(5, "La dirección es muy corta"),
  accessInstructions: z.string().nullable().optional(),
  openingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })),
  refundFullHours: z.number().int().min(0, "No puede ser negativo"),
  refundPartialHours: z.number().int().min(0, "No puede ser negativo"),
  refundPartialPct: z.number().int().min(0).max(100, "Debe ser entre 0 y 100"),
});

// 2. Terms & Conditions
export const termsConfigSchema = z.object({
  templateContent: z.string().min(10, "La plantilla no puede estar vacía"), // 🔧 Corregido
  additionalClauses: z.string().nullable().optional(),
  privacyOptions: z.object({
    collectEmail: z.boolean(),
    shareData: z.boolean(),
    cctvNotice: z.boolean(),
    cookieConsent: z.boolean(),
  }).default({
    collectEmail: true,
    shareData: false,
    cctvNotice: true,
    cookieConsent: true
  }),
});

// 3. Room Wi-Fi (Subset of Room)
export const roomWifiSchema = z.object({
  wifi_ssid: z.string().min(1, "El SSID es requerido"),
  wifi_pass: z.string().min(1, "La contraseña es requerida"),
});

// ─── ESQUEMA DE METADATA─────────────────────────────
export const packageMetadataSchema = z.object({
  discountPct: z.number().min(0).max(100).optional(),
  blockHours: z.number().positive().optional(),
  bulkEligible: z.boolean().optional(),
  
  // Soporte para tu estructura exacta de "fixed_blocks"
  schedule: z.object({
    type: z.enum(["fixed_blocks", "flexible", "custom"]).default("fixed_blocks"),
    options: z.array(
      z.object({
        label: z.string(), // Ej: "Mañana", "Tarde"
        startTime: z.string(), // Ej: "08:00"
        endTime: z.string(),   // Ej: "13:30"
      })
    ).optional(),
  }).optional(),
  
  custom_description: z.string().optional(),
}).default({});


// ─── PAYLOAD DE GUARDADO (NO REQUIERE PRECIO) ─────────────────
export const pricePackagePayloadSchema = z.object({
  roomId: z.string().uuid("ID de sala inválido"),
  name: z.string().min(3, "Nombre muy corto"),
  description: z.string().optional(),
  billingUnit: z.enum(["hour", "half_day", "full_day", "flat", "custom"]),
  minDuration: z.number().int().optional(),
  maxDuration: z.number().int().optional(),
  isActive: z.boolean().default(true),
  metadata: packageMetadataSchema,
});

export type PricePackagePayload = z.infer<typeof pricePackagePayloadSchema>;

// 5. Room Base Rates
export const roomBaseRateSchema = z.object({
  roomId: z.string().uuid("ID de sala inválido"),
  hourlyRate: z.number().positive("La tarifa debe ser mayor a 0"),
  currency: z.string().length(3).default("MXN"),
});

export const extensionSchema = z.object({
    additionalHours: z.number({
        message: "El número de horas es requerido y debe ser numerico",
    })
    .int("Las horas deben ser un número entero")
    .positive("Debes extender al menos 1 hora") // Asegura que sea mayor a 0 y no negativo
});