/**
 * AppRouter — Root application wrapper
 *
 * Provides: AuthContext + BrowserRouter
 * React 19: No `import React from 'react'`
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@infrastructure/AuthContext";
import { AppRoutes } from "./App";

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}