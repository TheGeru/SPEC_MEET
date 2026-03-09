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
import { CreditCardIcon } from "lucide-react";

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

// Stripe public key — in production, use env variable
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
    "pk_test_51SuGE6R7CcXcMDYUm8apqxqrXheiJOYSBHT6Do6JOhOYmElKCzlcbJgoiW3YUAt4qKzYdANmnXoVde4Q6LCfxyQU00e1smFJUy"
);

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

// ── Container ─────────────────────────────────────────────────

export default function Booking() {
  const navigate = useNavigate();

  // Hooks — business logic lives HERE, not in JSX
  const flow = useBookingFlow();
  const availability = useAvailability();

  // Sync roomId from availability → flow
  useEffect(() => {
    if (availability.roomId) {
      flow.setRoomId(availability.roomId);
    }
  }, [availability.roomId]);

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

  // ── Step: Date Selection ──────────────────────────────────
  const renderDateStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">
        Selecciona fecha y hora
      </h3>

      <BookingCalendar
        selectedDate={flow.selectedDate}
        myBookedDates={availability.myBookedDates}
        onSelectDate={flow.setSelectedDate}
        hasDayReservations={availability.hasDayReservations}
      />

      <TimeSlotPicker
        date={flow.selectedDate}
        timeSlots={availability.getAvailableTimeSlots(flow.selectedDate)}
        selectedSlot={flow.selectedTimeSlot}
        duration={flow.selectedDuration}
        isSlotAvailable={availability.isSlotAvailable}
        onSelectSlot={flow.setSelectedTimeSlot}
        formatDate={formatDate}
      />

      <DurationSelector
        selectedDuration={flow.selectedDuration}
        onSelectDuration={flow.setSelectedDuration}
        visible={!!flow.selectedTimeSlot}
      />

      {flow.summary && <BookingSummary summary={flow.summary} />}
    </div>
  );

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