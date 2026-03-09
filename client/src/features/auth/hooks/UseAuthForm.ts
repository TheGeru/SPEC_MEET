/**
 * ══════════════════════════════════════════════════════════════
 * AUTH FEATURE — useAuthForm Hook
 * ══════════════════════════════════════════════════════════════
 *
 * Generic hook for auth form state management.
 * Handles: loading state, error messages, form submission wrapper.
 *
 * Used by: LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm
 * All 4 forms need the same loading/error/submit pattern — DRY it up.
 */

import { useState } from "react";
import { type AxiosError } from "axios";

interface UseAuthFormReturn {
  error: string;
  setError: (error: string) => void;
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  handleSubmit: (fn: () => Promise<void>) => (e: React.FormEvent) => void;
}

export function useAuthForm(): UseAuthFormReturn {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (fn: () => Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setMessage("");
      setIsLoading(true);

      try {
        await fn();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          const axiosError = err as AxiosError<{ error: string }>;
          setError(
            axiosError.response?.data?.error || "Ha ocurrido un error inesperado"
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
  };

  return {
    error,
    setError,
    message,
    setMessage,
    isLoading,
    handleSubmit,
  };
}