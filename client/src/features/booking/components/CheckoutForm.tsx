/**
 * CheckoutForm — Presentational Component
 *
 * Wraps Stripe's PaymentElement and handles the confirm flow.
 * Must be rendered inside <Elements> provider.
 *
 * US-03: "El sistema debe procesar la transacción con Stripe"
 */

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  totalAmount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function CheckoutForm({
  totalAmount,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Error al procesar el pago");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-20">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white font-bold rounded-md hover:bg-opacity-30 transition-all border border-white border-opacity-30 shadow-lg disabled:opacity-50"
      >
        {isProcessing
          ? "Procesando pago..."
          : `Pagar $${totalAmount.toFixed(2)} MXN`}
      </button>
    </form>
  );
}