/**
 * ══════════════════════════════════════════════════════════════
 * AUTH FEATURE — CONTAINER
 * ══════════════════════════════════════════════════════════════
 *
 * Main entry point for ALL auth views:
 * - Login
 * - Register
 * - Forgot Password
 * - Reset Password
 *
 * Each view is a separate presentational component.
 * The container wires useAuth + useAuthForm to the forms.
 *
 * NOTE: This is NOT a route-level component.
 * Each view is exported individually for use in the router.
 * The container pattern here means each exported function is a
 * mini-container that composes hook + presentational component.
 *
 * Container name matches feature name: auth.tsx ✓
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@infrastructure/AuthContext";
import { useAuthForm } from "./hooks/UseAuthForm"; 
import {
  forgotPasswordRequest,
  resetPasswordRequest,
} from "./services/Auth.service";
import { USER_ROLE } from "./models";

// Presentational components
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm";

// ─── Shared Layout Wrapper ────────────────────────────────────

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN — Container
// ═══════════════════════════════════════════════════════════════

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error, setError, isLoading} = useAuthForm();

  // Direct submit handler that receives form data
  const onSubmitDirect = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setError("");
    try {
      const userLogged = await login(email, password, rememberMe);
      if (userLogged.role === USER_ROLE.ADMIN) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ha ocurrido un error inesperado");
      }
    }
  };

  return (
    <AuthPageWrapper>
      <LoginForm
        onSubmit={onSubmitDirect}
        error={error}
        isLoading={isLoading}
      />
    </AuthPageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGISTER — Container
// ═══════════════════════════════════════════════════════════════

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (
    name: string,
    email: string,
    password: string
  ) => {
    setError("");
    setIsLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado al registrar al usuario");
      }
      throw err; // Re-throw so RegisterForm knows submission failed
    } finally {
      setIsLoading(false);
    }
  };

  const onRegistrationComplete = () => {
    navigate("/dashboard");
  };

  return (
    <AuthPageWrapper>
      <RegisterForm
        onSubmit={onSubmit}
        onRegistrationComplete={onRegistrationComplete}
        error={error}
        isLoading={isLoading}
      />
    </AuthPageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
// FORGOT PASSWORD — Container
// ═══════════════════════════════════════════════════════════════

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { error, message, setMessage, isLoading, handleSubmit } =
    useAuthForm();

  const onSubmit = handleSubmit(async () => {
    const responseMessage = await forgotPasswordRequest(email);
    setMessage(
      responseMessage || "Si el correo existe, recibirás un enlace."
    );
  });

  return (
    <AuthPageWrapper>
      <ForgotPasswordForm
        email={email}
        onEmailChange={setEmail}
        onSubmit={onSubmit}
        error={error}
        message={message}
        isLoading={isLoading}
      />
    </AuthPageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESET PASSWORD — Container
// ═══════════════════════════════════════════════════════════════

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { error, setError, message, setMessage, isLoading, handleSubmit } =
    useAuthForm();

  const onSubmit = async (password: string) => {
    if (!token) {
      setError("Token inválido");
      return;
    }

    const wrappedSubmit = handleSubmit(async () => {
      const responseMessage = await resetPasswordRequest(token, password);
      setMessage(responseMessage);
      setTimeout(() => navigate("/login"), 3000);
    });

    // Execute the wrapped handler with a synthetic event
    await wrappedSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <AuthPageWrapper>
      <ResetPasswordForm
        onSubmit={onSubmit}
        error={error}
        message={message}
        isLoading={isLoading}
      />
    </AuthPageWrapper>
  );
}