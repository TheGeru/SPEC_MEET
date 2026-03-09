/**
 * ForgotPasswordForm — Presentational Component
 *
 * Renders the "forgot password" form.
 * Previously this component called api.post() DIRECTLY — now it delegates to parent.
 *
 * UI preserved EXACTLY as original ForgotPasswordPage.tsx design.
 */

import { Link } from "react-router-dom";
import {
  AtSignIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MailIcon,
} from "lucide-react";

interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  message: string;
  isLoading: boolean;
}

export default function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  error,
  message,
  isLoading,
}: ForgotPasswordFormProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <MailIcon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Recuperar Cuenta</h2>
        <p className="mt-2 text-white/80 text-sm">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 text-sm text-center">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded mb-6 text-sm text-center">
          {message}
        </div>
      )}

      {!message ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSignIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  Enviar Enlace
                  <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-white/60 text-sm mb-4">
            Revisa tu bandeja de entrada (y spam).
          </p>
        </div>
      )}

      <div className="mt-8 text-center border-t border-white/10 pt-6">
        <Link
          to="/login"
          className="inline-flex items-center font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver al Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}