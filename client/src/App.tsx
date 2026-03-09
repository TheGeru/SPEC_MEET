/**
 * ══════════════════════════════════════════════════════════════
 * APP ROUTES — Transitional State
 * ══════════════════════════════════════════════════════════════
 *
 * MIGRATED features use @features/ and @infrastructure/ aliases.
 * NON-MIGRATED pages still use old ./pages/ paths.
 *
 * As you migrate each feature, move its import from the
 * "NOT YET MIGRATED" section to the "MIGRATED" section.
 *
 * React 19: No `import React from 'react'`
 */

import { Routes, Route, Outlet } from "react-router-dom";

// ─── INFRASTRUCTURE (Migrated ✅) ─────────────────────────────
import ProtectedRoute from "@infrastructure/ProtectedRoute";
import PublicRoute from "@infrastructure/PublicRoute";

// ─── MIGRATED FEATURES ✅ ─────────────────────────────────────
// Auth
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@features/auth/Auth";

// Booking
import Booking from "@features/booking/Booking";

// Admin Settings (includes Pricing Packages + Base Rates)
import AdminSettings from "@features/admin-settings/AdminSettings";

// Admin Dashboard 
import AdminDashboard from "@features/admin-dashboard/AdminDashboard";

// ─── NOT YET MIGRATED ⏳ (still in old pages/ structure) ──────
// Move these to @features/ as you refactor each one.
// When done, delete the old file from pages/.
import Layout from "./shared/Layout";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import GalleryPage from "./pages/GalleryPage";
import PlansPage from "./shared/plans/PlansPage";
import TCPage from "./pages/TCPage";
import UserDashboard from "./pages/user/UserDashboard";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminReports from "./pages/admin/AdminReports";
import UserManagement from "./pages/admin/UserManagement";
import AdminCalendar from "./pages/admin/AdminCalendar";


// ─── Layout Wrapper ───────────────────────────────────────────
function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// ─── Routes ───────────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Routes>
      {/* ─────────────────────────────────────────────────────
          GROUP 1: PUBLIC ROUTES (accessible by everyone)
          All wrapped in Layout (Navbar + Footer)
      ────────────────────────────────────────────────────── */}
      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/terms-and-conditions" element={<TCPage />} />
      </Route>

      {/* ─────────────────────────────────────────────────────
          GROUP 2: AUTH ROUTES (only for non-authenticated)
          PublicRoute redirects logged-in users to dashboard
      ────────────────────────────────────────────────────── */}
      <Route element={<PublicRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* ─────────────────────────────────────────────────────
          GROUP 3: USER PROTECTED ROUTES
          Requires authentication. Redirects to /login if not.
      ────────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/booking" element={<Booking />} />
        </Route>
      </Route>

      {/* ─────────────────────────────────────────────────────
          GROUP 4: ADMIN PROTECTED ROUTES
          Requires authentication + ADMIN role.
      ────────────────────────────────────────────────────── */}
      <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<LayoutWrapper />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="financial" element={<AdminFinancial />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="calendar" element={<AdminCalendar />} />

          
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="flex items-center justify-center min-h-screen text-white">
              Página no encontrada
            </div>
          </Layout>
        }
      />
    </Routes>
  );
}