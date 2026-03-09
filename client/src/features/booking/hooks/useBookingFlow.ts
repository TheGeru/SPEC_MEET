/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — useBookingFlow Hook
 * ══════════════════════════════════════════════════════════════
 *
 * Manages the entire booking flow state:
 * - Current step (date → payment → confirmation)
 * - User selections (date, time, duration)
 * - Reservation creation → Stripe clientSecret
 *
 * WHY a hook instead of Zustand?
 * This state is ephemeral (lives only during the booking flow).
 * Zustand is for PERSISTENT state across features (e.g., auth user).
 * Don't use a cannon to kill a mosquito.
 *
 * React 19: No useMemo/useCallback needed — compiler handles it.
 */

import { useState } from "react";
import { type AxiosError } from "axios";
import {
  BOOKING_STEP,
  BOOKING_CONFIG,
  type BookingStep,
  type PaymentMethod,
  type BookingSummary,
} from "../models";
import { createReservation } from "../services/booking.service";

interface UseBookingFlowReturn {
  // Step navigation
  currentStep: BookingStep;
  goToPayment: () => Promise<void>;
  goBackToDate: () => void;
  goToConfirmation: () => void;

  // Selection state
  roomId: string;
  setRoomId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (time: string) => void;
  selectedDuration: number;
  setSelectedDuration: (hours: number) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;

  // Derived state
  summary: BookingSummary | null;
  canProceedToPayment: boolean;

  // Payment
  clientSecret: string;

  // Loading & errors
  isProcessing: boolean;
  paymentError: string;
  setPaymentError: (error: string) => void;
}

export const useBookingFlow = (): UseBookingFlowReturn => {
  // ── Step state ──────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<BookingStep>(BOOKING_STEP.DATE);

  // ── Selection state ─────────────────────────────────────────
  const [roomId, setRoomId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // ── Payment state ───────────────────────────────────────────
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ── Derived: Calculate end time ─────────────────────────────
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // ── Derived: Format date for display ────────────────────────
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ── Derived: Build summary ──────────────────────────────────
  const summary: BookingSummary | null =
    selectedDate && selectedTimeSlot
      ? (() => {
          const subtotal =
            BOOKING_CONFIG.PRICE_PER_HOUR * selectedDuration;
          const iva = subtotal * BOOKING_CONFIG.IVA_RATE;
          return {
            date: selectedDate,
            formattedDate: formatDate(selectedDate),
            startTime: selectedTimeSlot,
            endTime: calculateEndTime(selectedTimeSlot, selectedDuration),
            duration: selectedDuration,
            pricePerHour: BOOKING_CONFIG.PRICE_PER_HOUR,
            subtotal,
            iva,
            total: subtotal,
          };
        })()
      : null;

  const canProceedToPayment = !!(selectedDate && selectedTimeSlot && roomId);

  // ── Actions ─────────────────────────────────────────────────

  const goToPayment = async () => {
    if (!canProceedToPayment || !summary) return;

    setIsProcessing(true);
    setPaymentError("");

    try {
      const startISO = new Date(
        `${selectedDate}T${selectedTimeSlot}:00`
      ).toISOString();
      const endDate = new Date(`${selectedDate}T${selectedTimeSlot}:00`);
      endDate.setHours(endDate.getHours() + selectedDuration);
      const endISO = endDate.toISOString();

      const result = await createReservation({
        roomId,
        startTime: startISO,
        endTime: endISO,
        termsAccepted: true,
        acceptedVersion: BOOKING_CONFIG.TERMS_VERSION,
      });

      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setCurrentStep(BOOKING_STEP.PAYMENT);
      } else {
        throw new Error("El servidor no devolvió la información de pago");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      setPaymentError(
        axiosError.response?.data?.error || "Error al crear la reserva"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const goBackToDate = () => {
    setClientSecret("");
    setPaymentError("");
    setCurrentStep(BOOKING_STEP.DATE);
  };

  const goToConfirmation = () => {
    setCurrentStep(BOOKING_STEP.CONFIRMATION);
  };

  return {
    currentStep,
    goToPayment,
    goBackToDate,
    goToConfirmation,

    roomId,
    setRoomId,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    selectedDuration,
    setSelectedDuration,
    paymentMethod,
    setPaymentMethod,

    summary,
    canProceedToPayment,

    clientSecret,

    isProcessing,
    paymentError,
    setPaymentError,
  };
};