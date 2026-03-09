/**
 * TermsEditorTab — Presentational Component
 *
 * US-07: "Los T&C se actualicen automáticamente cuando cambio las reglas"
 *
 * Features:
 * - Template editor with variable insertion buttons
 * - Live preview that replaces {VARIABLES} with CURRENT config values
 * - Additional clauses editor
 *
 * The preview function receives businessConfig + roomWifi from parent
 * so it ALWAYS shows the latest values — even unsaved ones.
 * This is the "reflejo en tiempo real" requirement.
 */

import { useState } from "react";
import { SaveIcon, Loader2, PlusIcon, Eye, Code, FileTextIcon } from "lucide-react";
import type { TermsConfigData, BusinessConfigData, RoomWifiData, PricePackageData, RoomBaseRateData } from "../models";
import { TEMPLATE_VARIABLES, fmtCurrency, computePrice } from "../models";

interface TermsEditorTabProps {
  data: TermsConfigData;
  onChange: (updated: TermsConfigData) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saveSuccess: boolean;
  // Cross-tab data for preview (US-07: reflect changes in real-time)
  businessConfig: BusinessConfigData | null;
  roomWifi: RoomWifiData | null;
  packages: PricePackageData[];
  rates: RoomBaseRateData[];
}

export default function TermsEditorTab({
  data,
  onChange,
  onSave,
  saving,
  saveSuccess,
  businessConfig,
  roomWifi,
  packages,
  rates,
}: TermsEditorTabProps) {
  const [showPreview, setShowPreview] = useState(false);

  // ── Variable insertion ──────────────────────────────────────
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("termsTemplate") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = data.templateContent;
    const newText = text.substring(0, start) + variable + text.substring(end);
    onChange({ ...data, templateContent: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  // ── Generate preview (US-07: real-time variable replacement) ──
  const generatePreview = (): string => {
    let preview = data.templateContent;

    if (businessConfig) {
      preview = preview
        .replace(/{LOCATION_NAME}/g, businessConfig.locationName)
        .replace(/{LOCATION_ADDRESS}/g, businessConfig.address)
        .replace(/{FULL_REFUND_HOURS}/g, String(businessConfig.refundFullHours))
        .replace(/{PARTIAL_REFUND_HOURS}/g, String(businessConfig.refundPartialHours))
        .replace(/{PARTIAL_REFUND_PERCENTAGE}/g, `${businessConfig.refundPartialPct}%`);
    }

    

    if (roomWifi) {
      preview = preview
        .replace(/{WIFI_NETWORK}/g, roomWifi.wifi_ssid || "Red Privada")
        .replace(/{CAPACITY}/g, `${roomWifi.capacity} personas`);
    }

    // Hourly rate from active base rate of first room
    const activeRate = rates.find((r) => !r.effectiveUntil);
    if (activeRate) {
      preview = preview.replace(/{HOURLY_RATE}/g, fmtCurrency(activeRate.hourlyRate));
    }

    // Packages list
    const activePackages = packages.filter((p) => p.isActive && p.name);
    const pkgList = activePackages.length > 0
      ? activePackages.map((pkg) => {
          const rate = rates.find((r) => r.roomId === pkg.roomId && !r.effectiveUntil);
          if (rate && pkg.metadata.discountPct && pkg.metadata.blockHours) {
            const price = computePrice(rate.hourlyRate, pkg.metadata.discountPct, pkg.metadata.blockHours);
            return `${pkg.name} (${fmtCurrency(price.total)})`;
          }
          return pkg.name;
        }).join(", ")
      : "Consultar paquetes vigentes";
    preview = preview.replace(/{PACKAGES_LIST}/g, pkgList);

    if (data.additionalClauses?.trim()) {
      preview += "\n\nCláusulas Adicionales:\n" + data.additionalClauses;
    }

    return preview;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Template editor */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileTextIcon className="h-5 w-5 mr-2" />
            Editor de Plantilla T&C
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm rounded-md text-gray-900 hover:bg-accent hover:text-gray-100 transition-colors"
          >
            {showPreview ? <Code className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPreview ? "Editar" : "Vista Previa"}
          </button>
        </div>

        {!showPreview ? (
          <>
            {/* Variable buttons */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Variables dinámicas disponibles:</p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="inline-flex items-center px-2 py-1 bg-accent hover:bg-accent/70 text-white text-xs rounded"
                    title={`${v.label} — Ej: ${v.example}`}
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="termsTemplate"
              rows={15}
              value={data.templateContent}
              onChange={(e) => onChange({ ...data, templateContent: e.target.value })}
              className="bg-white block w-full py-2 px-3 rounded-md border border-gray-200 text-gray-900 font-mono text-sm"
            />
          </>
        ) : (
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Así lo verá el usuario:</h4>
            <div className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
              {generatePreview()}
            </div>
          </div>
        )}
      </div>

      {/* Additional clauses */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cláusulas Adicionales</h3>
        <p className="text-sm text-gray-600 mb-3">
          Este texto se añadirá al final de los términos principales.
        </p>
        <textarea
          rows={5}
          value={data.additionalClauses ?? ""}
          onChange={(e) => onChange({ ...data, additionalClauses: e.target.value || null })}
          className="bg-white block w-full py-2 px-3 rounded-md border border-gray-200 text-gray-900 text-sm"
          placeholder="Ej: Políticas de uso de equipo, conducta, etc."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onSave} disabled={saving} className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-secondary hover:opacity-70  disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <SaveIcon className="mr-2 h-4 w-4" />}
          {saveSuccess ? "¡Guardado!" : "Guardar Términos"}
        </button>
      </div>
    </div>
  );
}