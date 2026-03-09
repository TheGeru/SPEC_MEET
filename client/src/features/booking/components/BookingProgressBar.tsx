/**
 * BookingProgressBar — Presentational Component
 *
 * Shows the booking flow progress: Date → Payment → Confirmation
 * Receives ALL data via props. ZERO business logic.
 */

import { CheckIcon } from "lucide-react";
import { BOOKING_STEP, type BookingStep } from "../models";

interface ProgressStep {
  key: BookingStep;
  label: string;
}

const STEPS: ProgressStep[] = [
  { key: BOOKING_STEP.DATE, label: "Fecha" },
  { key: BOOKING_STEP.PAYMENT, label: "Pago" },
  { key: BOOKING_STEP.CONFIRMATION, label: "Fin" },
];

interface BookingProgressBarProps {
  currentStep: BookingStep;
}

export default function BookingProgressBar({
  currentStep,
}: BookingProgressBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between mb-8 w-full">
      {STEPS.map((step, idx) => (
        <div key={step.key} className="contents">
          <div
            className={`flex flex-col items-center z-10 ${
              idx <= currentIndex ? "opacity-100 font-bold" : "opacity-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center mb-1 ${
                idx <= currentIndex
                  ? "bg-white bg-opacity-30 text-white"
                  : "bg-white bg-opacity-10 text-white"
              }`}
            >
              {idx < currentIndex ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                idx + 1
              )}
            </div>
            <span className="text-xs text-white">{step.label}</span>
          </div>

          {idx < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                idx < currentIndex
                  ? "bg-white bg-opacity-50"
                  : "bg-white bg-opacity-10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}