/**
 * CancellationTab — Presentational Component
 *
 * Manages: BusinessConfig refund fields
 * Prisma: refundFullHours, refundPartialHours, refundPartialPct
 *
 * US-07: Changes here MUST reflect in T&C via template variables
 * {FULL_REFUND_HOURS}, {PARTIAL_REFUND_HOURS}, {PARTIAL_REFUND_PERCENTAGE}
 */

import { SaveIcon, Loader2, ShieldIcon } from "lucide-react";
import type { BusinessConfigData } from "../models";

interface CancellationTabProps {
  data: BusinessConfigData;
  onChange: (updated: BusinessConfigData) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saveSuccess: boolean;
}

export default function CancellationTab({
  data,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: CancellationTabProps) {
  const updateField = (field: keyof BusinessConfigData, value: number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <ShieldIcon className="h-5 w-5 mr-2" />
          Política de Cancelación
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Estos valores se reflejan automáticamente en los Términos y Condiciones
          mediante las variables {"{FULL_REFUND_HOURS}"}, {"{PARTIAL_REFUND_HOURS}"} y {"{PARTIAL_REFUND_PERCENTAGE}"}.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reembolso 100% — horas antes de la reserva
            </label>
            <input
              type="number"
              min={0}
              value={data.refundFullHours}
              onChange={(e) => updateField("refundFullHours", Number(e.target.value))}
              className="bg-white w-full py-2 px-3 rounded-md border border-gray-200 text-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si cancela con {data.refundFullHours}+ horas de anticipación → 100% reembolso
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reembolso parcial — horas antes de la reserva
            </label>
            <input
              type="number"
              min={0}
              value={data.refundPartialHours}
              onChange={(e) => updateField("refundPartialHours", Number(e.target.value))}
              className="bg-white w-full py-2 px-3 rounded-md border border-gray-200 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje de reembolso parcial (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={data.refundPartialPct}
              onChange={(e) => updateField("refundPartialPct", Number(e.target.value))}
              className="bg-white w-full py-2 px-3 rounded-md border border-gray-200 text-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si cancela entre {data.refundPartialHours} y {data.refundFullHours} horas → {data.refundPartialPct}% reembolso
            </p>
          </div>
        </div>
      </div>

      {/* Visual summary */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <p className="text-xs text-blue-300">
          <strong>Resumen:</strong> Más de {data.refundFullHours}h → 100% | Entre {data.refundPartialHours}h y {data.refundFullHours}h → {data.refundPartialPct}% | Menos de {data.refundPartialHours}h → Sin reembolso
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onSave} disabled={saving} className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-secondary hover:opacity-70  disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <SaveIcon className="mr-2 h-4 w-4" />}
          {saveSuccess ? "¡Guardado!" : "Guardar Política"}
        </button>
      </div>
    </div>
  );
}