/**
 * ══════════════════════════════════════════════════════════════
 * BRIDGE FILE — Transitional Re-export
 * ══════════════════════════════════════════════════════════════
 *
 * This file exists ONLY during migration.
 * Old pages that import from '../../context/AuthContext' will
 * still work because this file re-exports from the new location.
 *
 * DELETE THIS FILE once all pages are migrated to @features/.
 *
 * Files still using this bridge:
 *   - pages/LandingPage.tsx (useAuth)
 *   - pages/user/UserDashboard.tsx (useAuth)
 *   - pages/admin/AdminDashboard.tsx (useAuth — via api calls)
 *   - pages/admin/AdminCalendar.tsx
 *   - pages/admin/AdminFinancial.tsx
 *   - pages/admin/AdminReports.tsx
 *   - pages/admin/UserManagement.tsx
 *   - components/Navbar.tsx (useAuth)
 */

export { AuthProvider, useAuth } from "@infrastructure/AuthContext";