/**
 * RegisterForm — Presentational Component
 *
 * Renders the registration form with terms acceptance.
 * PlansModal is shown after successful registration (kept local per Scope Rule).
 *
 * UI preserved EXACTLY as original RegisterPage.tsx design.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { UserIcon, AtSignIcon, LockIcon, CheckIcon } from "lucide-react";
import PlansModal from "./PlansModal";

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  onRegistrationComplete: () => void;
  error: string;
  isLoading: boolean;
}

export default function RegisterForm({
  onSubmit,
  onRegistrationComplete,
  error,
  isLoading,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }
    if (!acceptTerms) {
      setFormError("Debes aceptar los términos y condiciones");
      return;
    }

    try {
      await onSubmit(name, email, password);
      setShowPlansModal(true);
    } catch {
      // Error handled by parent via error prop
    }
  };

  const handlePlansModalClose = () => {
    setShowPlansModal(false);
    onRegistrationComplete();
  };

  const displayError = formError || error;

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Crear Cuenta</h2>
        </div>

        {displayError && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Nombre Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSignIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-white/50">
              Mínimo 8 caracteres con letras y números
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckIcon className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl shadow-sm bg-black/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/30 text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="terms"
                className="text-white/70 leading-relaxed cursor-pointer"
              >
                Acepto los{" "}
                <Link
                  to="/terms-and-conditions"
                  className="font-medium text-gray-400 hover:text-gray-200 underline underline-offset-2 transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-gray-400 hover:text-gray-300 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      <PlansModal isOpen={showPlansModal} onClose={handlePlansModalClose} />
    </>
  );
}