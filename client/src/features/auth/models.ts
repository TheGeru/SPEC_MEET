/**
 * ══════════════════════════════════════════════════════════════
 * AUTH FEATURE — MODELS (Types + Zod Schemas)
 * ══════════════════════════════════════════════════════════════
 *
 * Single source of truth for auth-related types.
 * Zod schemas handle form validation (Zod 4 syntax).
 *
 * Scope Rule:
 * - User interface → shared via infrastructure/auth (used by ALL features)
 * - Auth form types → LOCAL here (only used by auth forms)
 * - Zod schemas → LOCAL here (only used by auth forms)
 */

import { z } from "zod";

// ─── CONST TYPES ──────────────────────────────────────────────

export const USER_ROLE = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const AUTH_VIEW = {
  LOGIN: "login",
  REGISTER: "register",
  FORGOT_PASSWORD: "forgot-password",
  RESET_PASSWORD: "reset-password",
} as const;

export type AuthView = (typeof AUTH_VIEW)[keyof typeof AUTH_VIEW];

// ─── INTERFACES ───────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface AuthError {
  error: string;
}

// ─── ZOD SCHEMAS (Zod 4 syntax) ──────────────────────────────

export const loginSchema = z.object({
  email: z.email({ error: "Correo electrónico inválido" }),
  password: z.string().min(1, { error: "La contraseña es requerida" }),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, { error: "El nombre es requerido" }),
    email: z.email({ error: "Correo electrónico inválido" }),
    password: z
      .string()
      .min(8, { error: "Mínimo 8 caracteres" })
      .refine((val) => /[A-Za-z]/.test(val) && /[0-9]/.test(val), {
        message: "Debe contener letras y números",
      }),
    confirmPassword: z.string().min(1, { error: "Confirma tu contraseña" }),
    acceptTerms: z.literal(true, {
      error: "Debes aceptar los términos y condiciones",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Correo electrónico inválido" }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { error: "Mínimo 6 caracteres" }),
    confirmPassword: z.string().min(1, { error: "Confirma tu contraseña" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;