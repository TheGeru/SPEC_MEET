/**
 * WifiTab — Presentational Component
 *
 * Manages: Room.wifi_ssid, Room.wifi_pass
 * Prisma: Room model (wifi subset)
 *
 * Note: Wi-Fi lives on the Room, NOT a separate table.
 * US-07: {WIFI_NETWORK} template variable uses wifi_ssid.
 */

import { SaveIcon, Loader2, WifiIcon } from "lucide-react";
import type { RoomWifiData } from "../models";

interface WifiTabProps {
  data: RoomWifiData;
  onChange: (updated: RoomWifiData) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saveSuccess: boolean;
}

export default function WifiTab({
  data,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: WifiTabProps) {
  return (
    <div className="space-y-8 pb-10">
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <WifiIcon className="h-5 w-5 mr-2" />
          Configuración Wi-Fi
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Sala: <span className="text-gray-900 font-medium">{data.name}</span> — Esta información se usa en la variable {"{WIFI_NETWORK}"} de los T&C.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Red (SSID)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <WifiIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={data.wifi_ssid}
                onChange={(e) => onChange({ ...data, wifi_ssid: e.target.value })}
                className="bg-white block w-full pl-10 py-2 rounded-md border border-gray-200 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ej: SPEC.MEET_Guest"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="text"
              value={data.wifi_pass}
              onChange={(e) => onChange({ ...data, wifi_pass: e.target.value })}
              className="bg-white block w-full py-2 px-3 rounded-md border border-gray-200 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Contraseña de la red"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving} className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-secondary hover:opacity-70  disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <SaveIcon className="mr-2 h-4 w-4" />}
          {saveSuccess ? "¡Guardado!" : "Guardar Wi-Fi"}
        </button>
      </div>
    </div>
  );
}