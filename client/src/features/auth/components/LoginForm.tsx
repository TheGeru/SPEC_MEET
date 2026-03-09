/**
 * LoginForm — Presentational Component
 *
 * Renders the login form with glassmorphism styling.
 * Business logic delegated to useAuth (via parent container).
 *
 * UI preserved EXACTLY as original LoginPage.tsx design.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { AtSignIcon, LockIcon, ArrowRightIcon } from "lucide-react";

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  error: string;
  isLoading: boolean;
}

export default function LoginForm({
  onSubmit,
  error,
  isLoading,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, rememberMe);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Iniciar Sesión</h2>
        <p className="mt-2 text-white/80">
          Accede a tu cuenta para gestionar tus reservas
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/90 mb-1"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSignIcon className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-white/90 mb-1"
          >
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 border-white/20 bg-black/30 text-gray-500 focus:ring-2 focus:ring-white/30 focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-400 cursor-pointer"
            >
              Recordarme
            </label>
          </div>
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-gray-400 hover:text-gray-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              "Cargando..."
            ) : (
              <>
                Iniciar Sesión
                <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="font-medium text-gray-400 hover:text-gray-300"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}