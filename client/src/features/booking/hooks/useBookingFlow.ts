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
  type Room,
} from "../models";
import { createReservation } from "../services/booking.service";

interface UseBookingFlowReturn {
  // Step navigation
  currentStep: BookingStep;
  goToDate: (room: Room) => void; // 🆕
  goToPayment: () => Promise<void>;
  goBackToRoom: () => void;                          // 🆕
  goBackToDate: () => void;
  goToConfirmation: () => void;

  selectedRoom: Room | null;
  // Selection state
  roomId: string;
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
  const [currentStep, setCurrentStep] = useState<BookingStep>(BOOKING_STEP.ROOM);

  // ── Selection state ─────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
    const pricePerHour = selectedRoom?.baseRates?.[0]
    ? Number(selectedRoom.baseRates[0].hourlyRate)
    : BOOKING_CONFIG.PRICE_PER_HOUR_FALLBACK;

  const summary: BookingSummary | null =
    selectedDate && selectedTimeSlot && selectedRoom
      ? (() => {
          const subtotal = pricePerHour * selectedDuration;
          const iva = subtotal * BOOKING_CONFIG.IVA_RATE;
          return {
            roomName:     selectedRoom.name,          // 🆕
            date:         selectedDate,
            formattedDate: formatDate(selectedDate),
            startTime:    selectedTimeSlot,
            endTime:      calculateEndTime(selectedTimeSlot, selectedDuration),
            duration:     selectedDuration,
            pricePerHour,
            subtotal,
            iva,
            total: subtotal,
          };
        })()
      : null;

  const canProceedToPayment = !!(
    selectedDate &&
    selectedTimeSlot &&
    selectedRoom
  );

  const goToDate = (room: Room) => {
    setSelectedRoom(room);
    // Limpiamos la fecha y hora si venían de una selección anterior
    // (por si el usuario regresa a cambiar de sala)
    setSelectedDate("");
    setSelectedTimeSlot("");
    setCurrentStep(BOOKING_STEP.DATE);
  };
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
        roomId:          selectedRoom.id,
        startTime:       startISO,
        endTime:         endISO,
        termsAccepted:   true,
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

    const goBackToRoom = () => {
    setSelectedDate("");
    setSelectedTimeSlot("");
    setCurrentStep(BOOKING_STEP.ROOM);
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
    goToDate,
    goToPayment,
    goBackToRoom,
    goBackToDate,
    goToConfirmation,

    selectedRoom,

    roomId: selectedRoom?.id ?? "",
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