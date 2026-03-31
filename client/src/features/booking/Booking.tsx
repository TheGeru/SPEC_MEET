/**
 * ══════════════════════════════════════════════════════════════
 * BOOKING FEATURE — CONTAINER
 * ══════════════════════════════════════════════════════════════
 *
 * This is the main entry point for the booking feature.
 * Container name MATCHES feature name (Screaming Architecture).
 *
 * Container responsibilities:
 * 1. Wire hooks (useBookingFlow, useAvailability)
 * 2. Compose presentational components
 * 3. Handle step routing
 *
 * Container does NOT:
 * - Contain business logic (that's in hooks)
 * - Make API calls (that's in services)
 * - Render complex UI (that's in components)
 *
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CreditCardIcon, InfoIcon, TagIcon } from "lucide-react";

// Feature-local imports
import { BOOKING_STEP, PAYMENT_METHOD } from "./models";
import { useBookingFlow } from "./hooks/useBookingFlow";
import { useAvailability } from "./hooks/useAvailability";
import BookingProgressBar from "./components/BookingProgressBar";
import BookingCalendar from "./components/BookingCalendar";
import TimeSlotPicker from "./components/TimeSlotPicker";
import DurationSelector from "./components/DurationSelector";
import BookingSummary from "./components/BookingSummary";
import CheckoutForm from "./components/CheckoutForm";
import BookingConfirmation from "./components/BookingConfirmation";
import RoomSelector from "./components/RoomSelector";

// Stripe public key — in production, use env variable
const stripekey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if(!stripekey){
  throw new Error("Falta VITE_STRIPE_PUBLIC_KEY en las variables de entorno.");
}

const stripePromise = loadStripe(stripekey);
// ── Helper: format date for display ───────────────────────────
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

// ── Container ─────────────────────────────────────────────────ey

export default function Booking() {
  const navigate = useNavigate();

  // Hooks — business logic lives HERE, not in JSX
  const flow = useBookingFlow();
  const availability = useAvailability({roomId: flow.roomId});
  const { isPlanFlow, selectedDuration } = flow;
  const { isDayValidForPlan } = availability;
  // Refresh availability when date changes
  useEffect(() => {
    if (flow.selectedDate) {
      availability.refreshAvailability(flow.selectedDate);
    }
  }, [flow.selectedDate]);

  // Refresh my bookings after payment completes
  useEffect(() => {
    if (flow.clientSecret) {
      availability.refreshMyBookings();
    }
  }, [flow.clientSecret]);

  // Paso 1 seleccionar sala_________________________-
  // paso 1_seleccion de sla
  const renderRoomStep = () => (
    <RoomSelector
    rooms={availability.rooms}
    isLoading={availability.isLoadingRoom}
    onSelectRoom={flow.goToDate}
    />
  );

// ── Step: Date Selection ──────────────────────────────────
  const renderDateStep = () => {
    // 1. Declaramos la lógica antes del return
    const isFullDay = flow.isPlanFlow && flow.selectedDuration >= 10;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white mb-4">
            Selecciona fecha y hora
          </h3>
          <button
            onClick={flow.goBackToRoom}
            className="text-white text-sm opacity-60 hover:opacity-100 underline">
            ← Cambiar sala
          </button>
        </div>

        <BookingCalendar
          selectedDate={flow.selectedDate}
          myBookedDates={availability.myBookedDates}
          onSelectDate={(date) => {
            flow.setSelectedDate(date);
            // 🚀 IMPORTANTE: Si es día completo, forzamos las 8:00 AM al hacer clic en el día
            if (isFullDay) {
              flow.setSelectedTimeSlot("08:00");
            }
          }}
          hasDayReservations={availability.hasDayReservations}
          isPlanFlow={isPlanFlow}
          selectedDuration={selectedDuration}
          isDayValidForPlan={availability.isDayValidForPlan}
        />

        {/* 2. Si es plan de día completo, mostramos aviso en vez de dejarlo elegir hora */}
        {isFullDay && flow.selectedDate ? (
          <div className="bg-purple-500/20 border border-purple-500/40 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <InfoIcon className="h-5 w-5 text-purple-400 shrink-0" />
            <p className="text-sm text-purple-100">
              Este plan reserva la sala de <strong>08:00 AM a 08:00 PM</strong> (12h) automáticamente.
            </p>
          </div>
        ) : (
          <TimeSlotPicker
            date={flow.selectedDate}
            timeSlots={availability.getAvailableTimeSlots(flow.selectedDate).filter(slot => 
              availability.isSlotAvailable(flow.selectedDate, slot, flow.selectedDuration)
            )}
            selectedSlot={flow.selectedTimeSlot}
            duration={flow.selectedDuration}
            isSlotAvailable={availability.isSlotAvailable}
            onSelectSlot={flow.setSelectedTimeSlot}
            formatDate={formatDate}
          />
        )}

        <DurationSelector
          selectedDuration={flow.selectedDuration}
          onSelectDuration={flow.setSelectedDuration}
          // 🚀 SOLO visible si NO es flujo de plan
          visible={!!flow.selectedTimeSlot && !flow.isPlanFlow}
        />

        {/* ── SECCIÓN DE BENEFICIOS Y CUPONES ── */}
        {!!flow.selectedTimeSlot && !isPlanFlow && (
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <TagIcon className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Beneficios Disponibles
              </span>
            </div>

            {flow.myDiscounts.length > 0 ? (
              <div className="relative group">
                <select
                  value={flow.selectedDiscountId || ""}
                  onChange={(e) => flow.setSelectedDiscountId(e.target.value || null)}
                  className="w-full bg-zinc-900/50 text-white rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer text-sm"
                >
                  <option value="" className="bg-zinc-900">No aplicar ningún beneficio</option>
                  {flow.myDiscounts.map((discount) => (
                    <option key={discount.id} value={discount.id} className="bg-zinc-900">
                      🎁 {discount.hours}h de cortesía — {discount.code}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="py-2 flex items-start gap-3 opacity-60">
                <InfoIcon className="h-5 w-5 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-400 leading-relaxed">
                  No tienes códigos de descuento activos.
                </p>
              </div>
            )}

            {flow.selectedDiscountId && (
              <div className="mt-4 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Beneficio aplicado correctamente
                </p>
              </div>
            )}
          </div>
        )}

        {flow.summary && <BookingSummary summary={flow.summary} />}
      </div>
    );
  };

  // ── Step: Payment ─────────────────────────────────────────
  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">
        Información de pago
      </h3>

      {/* Price summary */}
      {flow.summary && (
        <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg mb-6">
          <div className="flex justify-between text-white mb-2">
            <span>Reserva ({flow.summary.duration}h)</span>
            <span>${flow.summary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg border-t pt-2 border-white border-opacity-20">
            <span>Total</span>
            <span>${flow.summary.total.toFixed(2)} MXN</span>
          </div>
        </div>
      )}

      {/* Payment method selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => flow.setPaymentMethod(PAYMENT_METHOD.CARD)}
          className={`py-3 px-4 rounded-md flex justify-center ${
            flow.paymentMethod === PAYMENT_METHOD.CARD
              ? "bg-white bg-opacity-30 text-white"
              : "bg-white bg-opacity-10 text-white"
          }`}
        >
          <CreditCardIcon className="mr-2" /> Tarjeta
        </button>
        <button
          onClick={() => flow.setPaymentMethod(PAYMENT_METHOD.SPEI)}
          className={`py-3 px-4 rounded-md flex justify-center ${
            flow.paymentMethod === PAYMENT_METHOD.SPEI
              ? "bg-white bg-opacity-30 text-white"
              : "bg-white bg-opacity-10 text-white"
          }`}
        >
          Transferencia
        </button>
      </div>

      {/* Stripe checkout */}
      {flow.paymentMethod === PAYMENT_METHOD.CARD && flow.clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: flow.clientSecret,
            appearance: { theme: "night", labels: "floating" },
          }}
        >
          <CheckoutForm
            totalAmount={flow.summary?.total ?? 0}
            onSuccess={flow.goToConfirmation}
            onError={flow.setPaymentError}
          />
        </Elements>
      )}

      {flow.paymentMethod === PAYMENT_METHOD.SPEI && (
        <div className="text-white bg-white bg-opacity-10 p-4 rounded">
          Sistema de SPEI en construcción (usa tarjeta por ahora).
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen relative py-10 px-4">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://uploadthingy.s3.us-west-1.amazonaws.com/mnx4A3B36Dy2nyF5i8QPC8/PHOTO-2025-02-03-12-44-43.jpg')",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Reservar Sala</h1>

        <BookingProgressBar currentStep={flow.currentStep} />

        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
          {/* Step content */}
          {flow.currentStep === BOOKING_STEP.ROOM && renderRoomStep()}
          {flow.currentStep === BOOKING_STEP.DATE && renderDateStep()}
          {flow.currentStep === BOOKING_STEP.PAYMENT && renderPaymentStep()}
          {flow.currentStep === BOOKING_STEP.CONFIRMATION && flow.summary && (
            <BookingConfirmation
              summary={flow.summary}
              onGoToDashboard={() => navigate("/dashboard")}
            />
          )}

          {/* Error display */}
          {flow.paymentError && (
            <div className="mt-4 p-3 bg-red-500 bg-opacity-80 text-white rounded-md text-center">
              {flow.paymentError}
            </div>
          )}

          {/* Navigation buttons */}
          {flow.currentStep === BOOKING_STEP.DATE && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={flow.goToPayment}
                disabled={flow.isProcessing || !flow.canProceedToPayment}
                className="px-6 py-2 bg-white bg-opacity-15 backdrop-blur-sm text-white rounded-md hover:bg-opacity-30 transition-all border border-white border-opacity-30 disabled:opacity-50"
              >
                {flow.isProcessing ? "Cargando..." : "Continuar al Pago"}
              </button>
            </div>
          )}

          {flow.currentStep === BOOKING_STEP.PAYMENT && (
            <div className="mt-4">
              <button
                onClick={flow.goBackToDate}
                className="text-white underline text-sm opacity-70 hover:opacity-100"
              >
                Cancelar y volver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}