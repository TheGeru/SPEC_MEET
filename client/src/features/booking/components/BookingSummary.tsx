/**
 * BookingSummary — Presentational Component
 *
 * Shows the booking summary before proceeding to payment.
 * Displays: date, time range, price breakdown (US-02).
 */

import { CalendarIcon, ClockIcon } from "lucide-react";
import type { BookingSummary as BookingSummaryType } from "../models";

interface BookingSummaryProps {
  summary: BookingSummaryType;
}

export default function BookingSummary({ summary }: BookingSummaryProps) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg mt-6">
      <h4 className="text-sm font-medium text-white mb-2">Resumen</h4>

      <div className="flex items-center mb-2">
        <CalendarIcon className="h-5 w-5 text-white mr-2" />
        <span className="text-white">{summary.formattedDate}</span>
      </div>

      <div className="flex items-center mb-2">
        <ClockIcon className="h-5 w-5 text-white mr-2" />
        <span className="text-white">
          {summary.startTime} - {summary.endTime}
        </span>
      </div>

      <div className="mt-2">
        <span className="text-lg font-semibold text-white">
          ${summary.total} MXN
        </span>
        <span className="text-sm text-white ml-1">+ IVA</span>
      </div>
    </div>
  );
}