/* eslint-disable react-refresh/only-export-components */
/**
 * ══════════════════════════════════════════════════════════════
 * INFRASTRUCTURE — Auth Context
 * ══════════════════════════════════════════════════════════════
 *
 * WHY infrastructure and not features/auth?
 * Because useAuth() is consumed by EVERY feature:
 * - Navbar (isAuthenticated, isAdmin, logout)
 * - ProtectedRoute (isAuthenticated, user.role)
 * - PublicRoute (isAuthenticated, user.role)
 * - UserDashboard (user.name)
 * - BookingPage (indirectly via ProtectedRoute)
 * - AdminDashboard, AdminSettings, etc.
 */

import { useEffect, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { type AxiosError } from "axios";
import type { AuthUser } from "@features/auth/models";
import {
  verifySession,
  loginRequest,
  registerRequest,
  logoutRequest,
} from "@features/auth/services/Auth.service";

// ─── Context Type ─────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount (cookie-based auth)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await verifySession();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const userData = await loginRequest(email, password, rememberMe);
      setUser(userData);
      return userData;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      throw new Error(
        axiosError.response?.data?.error || "Credenciales inválidas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await registerRequest(name, email, password);
      // Auto-login after register
      await login(email, password);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      // BUG FIX: Was `error.response?.data?.console.error` — that's undefined always
      throw new Error(
        axiosError.response?.data?.error || "Error al registrar el usuario"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}