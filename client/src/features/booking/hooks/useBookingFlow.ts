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

import { useEffect, useState } from "react";
import {
  BOOKING_STEP,
  BOOKING_CONFIG,
  type BookingStep,
  type PaymentMethod,
  type BookingSummary,
  type Room,
} from "../models";
import { createReservation } from "../services/booking.service";
import { useLocation } from "react-router-dom";
import type { PublicPackageData } from "@shared/plans/models";
import api from "../../../api/axios";

interface UseBookingFlowReturn {
  // Step navigation
  selectedDiscountId: string | null,
  setSelectedDiscountId: (id: string | null) => void;
  myDiscounts: any[];
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

  isPlanFlow: boolean;
  // Payment
  clientSecret: string;

  // Loading & errors
  isProcessing: boolean;
  paymentError: string;
  setPaymentError: (error: string) => void;
}

export const useBookingFlow = (): UseBookingFlowReturn => {
  const location = useLocation();
  const [activePlan] = useState<PublicPackageData | null>(location.state?.selectedPlan || null)
  const isPlanFlow = !!activePlan;
  // ── Step state ──────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<BookingStep>(BOOKING_STEP.ROOM);

  // ── Selection state ─────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [taxRate, setTaxRate] = useState(0.16);

  const [myDiscounts, setMyDiscounts] = useState<any[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    activePlan ? "08:00" : ""
  );
  // Reemplaza tu const [selectedDuration, ...] por esto:
  const [selectedDuration, setSelectedDuration] = useState(() => {
  if (activePlan) {
    const raw = activePlan.minDuration || activePlan.metadata?.blockHours || 1;
    return raw > 24 ? raw / 60 : raw;
  }
  return 1; 
});

  console.log("🔥 1. PLAN RECIBIDO EN HOOK:", activePlan?.name || "NINGUNO");
  console.log("⏱️ 2. DURACIÓN CALCULADA:", selectedDuration, "tipo:", typeof selectedDuration);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // ── Payment state ───────────────────────────────────────────
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const fetchDiscounts =  async () =>{
      try{
        const res = await api.get('/user/my-discounts');
        setMyDiscounts(res.data);
      } catch(err){
        console.error("Error cargando beneficios", err);
      }
    };
    fetchDiscounts();
  }, []);

  useEffect(() => {
    if(selectedRoom?.location?.taxRate) {
      setTaxRate(Number(selectedRoom.location.taxRate));
    }
  }, [selectedRoom]);

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
          const activeDiscount = myDiscounts.find(d => d.id === selectedDiscountId);
          
          let total = 0;
          let pPerHour = pricePerHour;
          let appliedDiscountHours = 0;

          // 1. ESCENARIO: PLANES (Prioridad Máxima)
          if (activePlan) {
            total = Number(activePlan.price);
            pPerHour = 0;
          } 
          // 2. ESCENARIO: CÓDIGO DE DESCUENTO (Modelo Proporcional)
          else if (activeDiscount) {
            // Calculamos cuántas horas realmente se van a cobrar
            // Si el cupón tiene 5h y reservo 2h -> billable es 0
            // Si el cupón tiene 2h y reservo 5h -> billable es 3
            const billableHours = Math.max(0, selectedDuration - activeDiscount.hours);
            total = billableHours * pricePerHour;
            pPerHour = pricePerHour;
            appliedDiscountHours = Math.min(selectedDuration, activeDiscount.hours);
          } 
          // 3. ESCENARIO: RESERVA NORMAL
          else {
            total = pricePerHour * selectedDuration;
            pPerHour = pricePerHour;
          }

          const subtotal = total / (1 + taxRate);
          const iva = total - subtotal;

          return { 
            roomName:      selectedRoom.name,
            date:          selectedDate,
            formattedDate: formatDate(selectedDate),
            startTime:     selectedTimeSlot,
            endTime:       calculateEndTime(selectedTimeSlot, selectedDuration),
            duration:      selectedDuration,
            pricePerHour:  pPerHour,
            total:         total,
            subtotal,
            iva,
            packageId:     activePlan?.id || undefined,
            discountCodeId: selectedDiscountId || undefined,
            // Dato extra para mostrar en el resumen visual si quieres
            discountHours: appliedDiscountHours 
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
    setSelectedDate("");
    setSelectedTimeSlot("");
    setCurrentStep(BOOKING_STEP.DATE);
  };
  // ── Actions ────────────────────────────────────────────────

const goToPayment = async () => {
    if (!canProceedToPayment || !summary) return;

    setIsProcessing(true);
    setPaymentError("");

    try {
      // 🚀 SOLUCIÓN AL DESFASE: Construimos la fecha manualmente para evitar el salto de UTC
      // En lugar de .toISOString(), enviamos el formato YYYY-MM-DDTHH:mm:ss
      const startISO = `${selectedDate}T${selectedTimeSlot}:00`;
      
      // Calculamos el fin sumando las horas a la fecha inicial
      const startDate = new Date(`${selectedDate}T${selectedTimeSlot}:00`);
      const endDate = new Date(startDate.getTime() + (selectedDuration * 60 * 60 * 1000));
      
      // Formateamos el fin manualmente para mantenerlo local
      const endISO = endDate.getFullYear() + "-" + 
                     String(endDate.getMonth() + 1).padStart(2, '0') + "-" + 
                     String(endDate.getDate()).padStart(2, '0') + "T" + 
                     String(endDate.getHours()).padStart(2, '0') + ":" + 
                     String(endDate.getMinutes()).padStart(2, '0') + ":00";

      console.log("Enviando a Backend:", { startISO, endISO, duration: selectedDuration });

      const result = await createReservation({
        roomId:          selectedRoom!.id,
        startTime:       startISO, // Ahora viaja como "2026-03-31T08:00:00"
        endTime:         endISO,   // Ahora viaja como "2026-03-31T20:00:00"
        packageId:       activePlan?.id || undefined,
        termsAccepted:   true,
        acceptedVersion: BOOKING_CONFIG.TERMS_VERSION,
        discountCodeId:  selectedDiscountId
      });

      if (summary.total === 0) {
        setCurrentStep(BOOKING_STEP.CONFIRMATION);
      } else if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setCurrentStep(BOOKING_STEP.PAYMENT);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || "Error al crear la reserva";
      setPaymentError(message);
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
    selectedDiscountId,
    setSelectedDiscountId,
    myDiscounts,
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

    isPlanFlow,

    clientSecret,

    isProcessing,
    paymentError,
    setPaymentError,
  };
};