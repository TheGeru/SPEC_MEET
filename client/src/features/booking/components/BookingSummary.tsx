import { CalendarIcon, ClockIcon, BuildingIcon, PackageIcon, TagIcon } from "lucide-react";
import type { BookingSummary as BookingSummaryType } from "../models";

interface BookingSummaryProps {
  summary: BookingSummaryType;
}

export default function BookingSummary({ summary }: BookingSummaryProps) {
  // Determinamos si es un plan o reserva normal para la etiqueta
  const isPlan = !!summary.packageId;

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-xl mt-6 border border-white/10 shadow-xl">
      <h4 className="text-xs font-black text-white/60 mb-4 uppercase tracking-[0.2em]">Resumen de tu reserva</h4>

      <div className="space-y-3">
        {/* Sala */}
        <div className="flex items-center">
          <BuildingIcon className="h-4 w-4 text-white mr-3 opacity-70" />
          <span className="text-white text-sm font-medium">{summary.roomName}</span>
        </div>

        {/* Tipo de Reserva / Paquete */}
        <div className="flex items-center">
          <PackageIcon className="h-4 w-4 text-purple-400 mr-3 opacity-90" />
          <span className="text-white text-sm">
            {isPlan ? "✨ Plan Especial" : "🕒 Reserva Regular"}
          </span>
        </div>

        {/* Fecha y hora */}
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-white mr-3 opacity-70" />
          <span className="text-white text-sm">{summary.formattedDate}</span>
        </div>
        <div className="flex items-center pb-4">
          <ClockIcon className="h-4 w-4 text-white mr-3 opacity-70" />
          <span className="text-white text-sm">
            {summary.startTime} – {summary.endTime} ({summary.duration}h)
          </span>
        </div>
      </div>

      {/* Sección de Precio y Beneficios */}
      <div className="border-t border-white/20 mt-2 pt-4 space-y-2">
        
        {/* Si hubo descuento de horas (GIFT CARD), lo mostramos aquí */}
        {(summary.discountHours ?? 0) > 0 && (
          <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 mb-3">
            <div className="flex items-center gap-2">
              <TagIcon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Beneficio Aplicado</span>
            </div>
            {/* ⬇️ Aquí también lo usamos para mostrar el número ⬇️ */}
            <span className="text-xs font-bold">-{summary.discountHours}h</span>
          </div>
        )}

        <div className="flex justify-between items-baseline">
          <div className="flex flex-col">
            <span className="text-white text-[10px] opacity-50 uppercase font-bold tracking-tight">
              {isPlan ? "Precio del paquete" : `Tarifa: $${summary.pricePerHour}/h`}
            </span>
            <span className="text-[10px] text-gray-500">IVA Incluido (16%)</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">
              ${summary.total.toFixed(2)}
            </span>
            <span className="text-[10px] text-white/50 ml-1">MXN</span>
          </div>
        </div>
      </div>
    </div>
  );
}