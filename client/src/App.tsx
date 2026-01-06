import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserDashboard from './pages/user/UserDashboard';
import BookingPage from './pages/user/BookingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminFinancial from './pages/admin/AdminFinancial';
import AdminReports from './pages/admin/AdminReports';
import UserManagement from './pages/admin/UserManagement';
import AdminCalendar from './pages/admin/AdminCalendar';
import FeaturesPage from './pages/FeaturesPage';
import GalleryPage from './pages/GalleryPage';
import PlansPage from './pages/PlansPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
export function App() {
  return <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout>
                <LandingPage />
              </Layout>} />
          <Route path="/features" element={<Layout>
                <FeaturesPage />
              </Layout>} />
          <Route path="/gallery" element={<Layout>
                <GalleryPage />
              </Layout>} />
          <Route path="/plans" element={<Layout>
                <PlansPage />
              </Layout>} />
          <Route path="/login" element={<Layout>
                <LoginPage />
              </Layout>} />
          <Route path="/register" element={<Layout>
                <RegisterPage />
              </Layout>} />
          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute>
                <Layout>
                  <BookingPage />
                </Layout>
              </ProtectedRoute>} />
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminSettings />
                </Layout>
              </ProtectedRoute>} />
          <Route path="/admin/financial" element={<ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminFinancial />
                </Layout>
              </ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminReports />
                </Layout>
              </ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>} />
          <Route path="/admin/calendar" element={<ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminCalendar />
                </Layout>
              </ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>;
}