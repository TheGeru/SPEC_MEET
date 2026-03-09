/**
 * ══════════════════════════════════════════════════════════════
 * AUTH FEATURE — SERVICE (API Layer)
 * ══════════════════════════════════════════════════════════════
 *
 * ALL auth-related HTTP calls live here. NOWHERE else.
 *
 * Previously these were scattered across:
 * - AuthContext.tsx (login, register, logout, verify)
 * - ForgotPasswordPage.tsx (forgot-password)
 * - ResetPasswordPage.tsx (reset-password)
 *
 * Now: ONE file, ONE responsibility.
 *
 * Scope Rule: LOCAL to auth feature, BUT also consumed by
 * infrastructure/auth/AuthContext.tsx for login/register/logout/verify.
 * This is acceptable because AuthContext IS auth infrastructure.
 */

import api from "@infrastructure/axios";
import type { AuthUser, LoginResponse } from "../models";

/**
 * Verify the current session (cookie-based).
 * Called on app load to restore auth state.
 */
export const verifySession = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>("/auth/verify");
  return data;
};

/**
 * Login with email + password.
 * Backend sets httpOnly cookie on success.
 */
export const loginRequest = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthUser> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
    rememberMe,
  });
  return response.data.user;
};

/**
 * Register a new user account.
 */
export const registerRequest = async (
  name: string,
  email: string,
  password: string
): Promise<void> => {
  await api.post("/auth/register", { name, email, password });
};

/**
 * Logout — clears the session cookie server-side.
 */
export const logoutRequest = async (): Promise<void> => {
  await api.post("/auth/logout");
};

/**
 * Request a password reset email.
 */
export const forgotPasswordRequest = async (
  email: string
): Promise<string> => {
  const response = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { email }
  );
  return response.data.message;
};

/**
 * Reset password using the token from the email link.
 */
export const resetPasswordRequest = async (
  token: string,
  newPassword: string
): Promise<string> => {
  const response = await api.post<{ message: string }>(
    `/auth/reset-password/${token}`,
    { newPassword }
  );
  return response.data.message;
};