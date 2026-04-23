/**
 * USER-DASHBOARD FEATURE — CONTAINER
 *
 * US-09: Dashboard with reservations, access codes, cancel/extend.
 *
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@infrastructure/AuthContext";
import { useUserDashboard } from "./hooks/useUserDashboard";
import type { UserReservation } from "./models";

import DashboardStats from "./components/DashboardStats";
import DiscountCards from "./components/DiscountCards";
import UserPlanCard from "./components/UserPlanCard";
import ReservationList from "./components/ReservationList";
import AdditionalServices from "./components/AdditionalServices";
import DetailsModal from "./components/DetailsModal";
import CancelModal from "./components/CancelModal";
import ExtendModal from "./components/ExtendModal";
import Toast from "./components/Toast";

// ExtensionPaymentModal lives in booking feature (Scope Rule: shared via import)
import ExtensionPaymentModal from "@features/booking/components/ExtensionPaymentModal";

export default function UserDashboard() {
  const { user } = useAuth();
  const dashboard = useUserDashboard();

  // Modal states
  const [detailRes, setDetailRes] = useState<UserReservation | null>(null);
  const [cancelRes, setCancelRes] = useState<UserReservation | null>(null);
  const [extendRes, setExtendRes] = useState<UserReservation | null>(null);

  // Loading
  if (dashboard.isLoading && !dashboard.data) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center ">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      </div>
    );
  }

  const stats = dashboard.data?.stats ?? {
    activeReservations: 0,
    totalHours: 0,
    nextReservationDate: "--",
  };
  const upcoming = dashboard.data?.upcoming ?? [];
  const past = dashboard.data?.past ?? [];

  // TODO: Wire when backend adds user plan endpoint
  const activePlan = null;

  return (
    <div className="w-full min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://uploadthingy.s3.us-west-1.amazonaws.com/mnx4A3B36Dy2nyF5i8QPC8/PHOTO-2025-02-03-12-44-43.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Mi Panel</h1>
          <p className="text-white mt-2">
            Bienvenido, {user?.name}. Gestiona tus reservas desde aquí.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats stats={stats} />

        {/* Discounts / Gift cards */}
        <DiscountCards discounts={dashboard.discounts} />

        {/* Plan card */}
        <UserPlanCard
          planName={activePlan}
          planDescription={
            activePlan
              ? "Plan personalizado con beneficios exclusivos para clientes frecuentes."
              : null
          }
          isActive={!!activePlan}
        />

        {/* Reservations */}
        <ReservationList
          upcoming={upcoming}
          past={past}
          onViewDetails={setDetailRes}
          onCancel={setCancelRes}
          onExtend={setExtendRes}
        />

        {/* Additional services */}
        <AdditionalServices userName={user?.name ?? "Cliente"} />
      </div>

      {/* ── Modals ── */}
      {detailRes && (
        <DetailsModal
          reservation={detailRes}
          onClose={() => setDetailRes(null)}
        />
      )}

      {cancelRes && (
        <CancelModal
          reservation={cancelRes}
          onConfirm={() => {
            dashboard.handleCancel(cancelRes.id);
            setCancelRes(null);
          }}
          onClose={() => setCancelRes(null)}
          loading={dashboard.actionLoading}
        />
      )}

      {extendRes && (
        <ExtendModal
          reservation={extendRes}
          onConfirm={(hours) => {
            dashboard.handleExtend(extendRes, hours);
            setExtendRes(null);
          }}
          onClose={() => setExtendRes(null)}
          loading={dashboard.actionLoading}
        />
      )}

      {dashboard.extensionClientSecret && (
        <ExtensionPaymentModal
          clientSecret={dashboard.extensionClientSecret}
          amount={dashboard.extendingAmount}
          onClose={dashboard.clearExtension}
          onSuccess={dashboard.onExtensionSuccess}
        />
      )}

      {/* Toast */}
      {dashboard.toast && (
        <Toast
          msg={dashboard.toast.msg}
          type={dashboard.toast.type}
          onClose={dashboard.clearToast}
        />
      )}
    </div>
  );
}