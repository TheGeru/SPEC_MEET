import { useState, useEffect } from "react";
import type {
  DashboardData,
  Discount,
  UserReservation,
  ToastData,
} from "../models";
import {
  fetchUserStats,
  fetchMyDiscounts,
  cancelReservation as cancelApi,
  extendReservation as extendApi,
} from "../services/UserDashboard.service";

interface UseUserDashboardReturn {
  data: DashboardData | null;
  discounts: Discount[];
  isLoading: boolean;

  // Actions
  actionLoading: boolean;
  handleCancel: (reservationId: string) => Promise<void>;
  handleExtend: (
    reservation: UserReservation,
    hours: number
  ) => Promise<void>;

  // Extension payment
  extensionClientSecret: string | null;
  extendingAmount: number;
  clearExtension: () => void;
  onExtensionSuccess: () => void;

  // Toast
  toast: ToastData | null;
  clearToast: () => void;

  // Refresh
  refresh: () => Promise<void>;
}

export function useUserDashboard(): UseUserDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Extension payment state
  const [extensionClientSecret, setExtensionClientSecret] = useState<
    string | null
  >(null);
  const [extendingAmount, setExtendingAmount] = useState(0);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      const [statsRes, discountsRes] = await Promise.all([
        fetchUserStats(),
        fetchMyDiscounts(),
      ]);
      setData(statsRes);
      setDiscounts(discountsRes);
    } catch {
      showToast("No se pudieron cargar todos los datos del panel", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCancel = async (reservationId: string) => {
    try {
      setActionLoading(true);
      await cancelApi(reservationId);
      showToast("Reserva cancelada. Revisa tu email para el reembolso.");
      await refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al cancelar";
      showToast(message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async (
    reservation: UserReservation,
    hours: number
  ) => {
    try {
      setActionLoading(true);
      const result = await extendApi(reservation.id, hours);

      if (result.clientSecret) {
        showToast(
          "Intención de extensión creada. Procediendo al pago..."
        );
        setExtensionClientSecret(result.clientSecret);
        setExtendingAmount(result.totalExtra || 0);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No se puede extender en este momento.";
      showToast(message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const clearExtension = () => {
    setExtensionClientSecret(null);
    setExtendingAmount(0);
  };

  const onExtensionSuccess = () => {
    clearExtension();
    showToast("¡Pago de extensión exitoso!");
    refresh();
  };

  return {
    data,
    discounts,
    isLoading,
    actionLoading,
    handleCancel,
    handleExtend,
    extensionClientSecret,
    extendingAmount,
    clearExtension,
    onExtensionSuccess,
    toast,
    clearToast: () => setToast(null),
    refresh,
  };
}