/**
 * BookingSummary — Presentational Component
 *
 * Shows the booking summary before proceeding to payment.
 * 🆕 Ahora muestra nombre de sala y paquete elegido.
 */

import { CalendarIcon, ClockIcon, BuildingIcon, PackageIcon } from "lucide-react";
import type { BookingSummary as BookingSummaryType } from "../models";

interface BookingSummaryProps {
  summary: BookingSummaryType;
}

export default function BookingSummary({ summary }: BookingSummaryProps) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg mt-6">
      <h4 className="text-sm font-medium text-white mb-3">Resumen de tu reserva</h4>

      {/* 🆕 Sala y paquete */}
      <div className="flex items-center mb-2">
        <BuildingIcon className="h-4 w-4 text-white mr-2 opacity-80" />
        <span className="text-white text-sm">{summary.roomName}</span>
      </div>
      <div className="flex items-center mb-2">
        <PackageIcon className="h-4 w-4 text-white mr-2 opacity-80" />
        <span className="text-white text-sm">{summary.packageName}</span>
      </div>

      {/* Fecha y hora */}
      <div className="flex items-center mb-2">
        <CalendarIcon className="h-4 w-4 text-white mr-2 opacity-80" />
        <span className="text-white text-sm">{summary.formattedDate}</span>
      </div>
      <div className="flex items-center mb-2">
        <ClockIcon className="h-4 w-4 text-white mr-2 opacity-80" />
        <span className="text-white text-sm">
          {summary.startTime} – {summary.endTime} ({summary.duration}h)
        </span>
      </div>

      {/* Precio */}
      <div className="border-t border-white border-opacity-20 mt-3 pt-3 flex justify-between items-baseline">
        <span className="text-white text-xs opacity-70">
          ${summary.pricePerHour}/hr × {summary.duration}h + IVA
        </span>
        <span className="text-lg font-semibold text-white">
          ${summary.total.toFixed(2)} MXN
        </span>
      </div>
    </div>
  );
}