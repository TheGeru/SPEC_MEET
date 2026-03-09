/**
 * ResetPasswordForm — Presentational Component
 *
 * Renders the "set new password" form (accessed via email link with token).
 *
 * UI preserved EXACTLY as original ResetPasswordPage.tsx design.
 */

import { useState } from "react";
import {
  LockIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
} from "lucide-react";

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  error: string;
  message: string;
  isLoading: boolean;
}

export default function ResetPasswordForm({
  onSubmit,
  error,
  message,
  isLoading,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    await onSubmit(password);
  };

  const displayError = formError || error;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <LockIcon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Nueva Contraseña</h2>
        <p className="mt-2 text-white/80 text-sm">
          Ingresa tu nueva contraseña para recuperar el acceso.
        </p>
      </div>

      {displayError && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 text-sm text-center">
          {displayError}
        </div>
      )}

      {message && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded mb-6 text-sm text-center flex flex-col items-center">
          <CheckCircleIcon className="h-8 w-8 mb-2 text-green-400" />
          <p>{message}</p>
          <p className="text-xs mt-2 text-green-300/70">
            Redirigiendo al login...
          </p>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-10 py-2 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircleIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                "Actualizando..."
              ) : (
                <>
                  Cambiar Contraseña
                  <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}