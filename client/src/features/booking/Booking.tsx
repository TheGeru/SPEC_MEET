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
import { CreditCardIcon, InfoIcon, TagIcon} from "lucide-react";

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
  // throw new Error("Falta VITE_STRIPE_PUBLIC_KEY en las variables de entorno.");
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
  const renderRoomStep = () => (
    <RoomSelector
    rooms={availability.rooms}
    isLoading={availability.isLoadingRoom}
    onSelectRoom={flow.goToDate}
    />
  );

// ── Step: Date & Time ───────────────────────────────────────
const renderDateStep = () => (
    <div className="flex flex-col gap-8">
      
      {/* Sección 1: Calendario (Arriba) */}
      <div className="w-full">
        <h3 className="text-lg font-medium text-white mb-4">Selecciona Fecha</h3>
        <BookingCalendar
          selectedDate={flow.selectedDate}
          onSelectDate={flow.setSelectedDate}
          myBookedDates={availability.myBookedDates}
          hasDayReservations={availability.hasDayReservations}
          isPlanFlow={isPlanFlow}
          selectedDuration={selectedDuration}
          isDayValidForPlan={isPlanFlow ? isDayValidForPlan : () => true} 
          businessConfig={availability.businessConfig}
        />

        {/* 🚀 NUEVO: Selector de Beneficios (DiscountCodes del usuario) */}
        {!isPlanFlow && flow.myDiscounts.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-indigo-400" /> Mis Beneficios Disponibles
            </h4>
            <div className="flex flex-wrap gap-2">
              {flow.myDiscounts.map(discount => (
                <button
                  key={discount.id}
                  onClick={() => flow.setSelectedDiscountId(
                    flow.selectedDiscountId === discount.id ? null : discount.id
                  )}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all border ${
                    flow.selectedDiscountId === discount.id 
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-lg" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {discount.code} ({discount.hours}h)
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isPlanFlow && flow.activeDiscount && (
           <div className="mt-4 p-3 bg-indigo-900/40 border border-indigo-400 rounded-md flex items-start gap-2">
              <TagIcon className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-100">Plan Activo: {flow.activeDiscount.code}</p>
                <p className="text-xs text-indigo-200">Tienes {flow.activeDiscount.hours} horas disponibles.</p>
              </div>
           </div>
        )}
      </div>

      {/* Sección 2: Horas, Duración y Resumen (Abajo) */}
      <div className="w-full flex flex-col gap-6">
        
        {/* 🚀 CAMBIO: Ocultamos el selector de duración si es un flujo de PLAN */}
        {!isPlanFlow && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
               Selecciona Duración
            </h3>
            <DurationSelector
              selectedDuration={selectedDuration}
              onSelectDuration={flow.setSelectedDuration}
              visible={true}
            />
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            Horarios Disponibles para {formatDate(flow.selectedDate)}
          </h3>
          {flow.selectedDate ? (
            <TimeSlotPicker
              date={flow.selectedDate}
              /* 🚀 CAMBIO CRÍTICO: Filtramos los slots para mostrar solo donde cabe el bloque completo */
              timeSlots={availability.getAvailableTimeSlots(flow.selectedDate).filter(slot => 
                availability.isSlotAvailable(flow.selectedDate, slot, selectedDuration)
              )}
              selectedSlot={flow.selectedTimeSlot}
              duration={selectedDuration}
              isSlotAvailable={availability.isSlotAvailable}
              onSelectSlot={flow.setSelectedTimeSlot}
              formatDate={formatDate}
            />
          ) : (
            <p className="text-sm text-gray-400">
              Selecciona una fecha en el calendario primero.
            </p>
          )}
        </div>

        {flow.summary && (
          <div className="mt-auto">
            <BookingSummary summary={flow.summary} />
            <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
              <InfoIcon className="w-4 h-4 shrink-0" />
              <p>
                Al continuar, aceptas nuestros términos y condiciones y políticas de cancelación.
              </p>
            </div>
          </div>
        )}
      </div>
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