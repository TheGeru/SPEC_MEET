import { Routes, Route, Outlet, BrowserRouter } from "react-router-dom";

// ─── INFRAESTRUCTURA (Usando el nuevo alias) ───
import ProtectedRoute from "@infrastructure/ProtectedRoute";
import PublicRoute from "@infrastructure/PublicRoute";
import { AuthProvider } from "@infrastructure/AuthContext";

// ─── FEATURES ───
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@features/auth/Auth";
import Booking from "@features/booking/Booking";
import AdminSettings from "@features/admin-settings/AdminSettings";
import AdminDashboard from "@features/admin-dashboard/AdminDashboard";

// ─── PAGES (Manteniendo tus carpetas actuales sin cambios) ───
import Layout from "./shared/Layout";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import GalleryPage from "./pages/GalleryPage";
import PlansPage from "./shared/plans/PlansPage";
import TCPage from "./pages/TCPage";
import UserDashboard from "./pages/user/UserDashboard";

// Importamos desde la ruta original que NO moviste
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminReports from "./pages/admin/AdminReports";
import UserManagement from "./pages/admin/UserManagement";
import AdminCalendar from "./pages/admin/AdminCalendar";
import ContactPage from "./pages/ContactPage";

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/terms-and-conditions" element={<TCPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* RUTAS DE AUTH (PÚBLICAS) */}
      <Route element={<PublicRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* RUTAS PROTEGIDAS USUARIO */}
      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/booking" element={<Booking />} />
        </Route>
      </Route>

      {/* RUTAS PROTEGIDAS ADMIN */}
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

      <Route path="*" element={<Layout><div className="text-white text-center py-20">404 - No encontrado</div></Layout>} />
    </Routes>
  );
}

// ─── EL ROUTER PRINCIPAL ───
export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}