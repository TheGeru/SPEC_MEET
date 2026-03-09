/**
 * LocationTab — Presentational Component
 *
 * Manages: BusinessConfig fields (location name, address, access instructions, opening hours)
 * Prisma model: BusinessConfig
 */

import { SaveIcon, Loader2, MapPinIcon } from "lucide-react";
import type { BusinessConfigData, DaySchedule } from "../models";
import { WEEKDAYS, DEFAULT_DAY_SCHEDULE } from "../models";

interface LocationTabProps {
  data: BusinessConfigData;
  onChange: (updated: BusinessConfigData) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saveSuccess: boolean;
}

export default function LocationTab({
  data,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: LocationTabProps) {
  const updateField = <K extends keyof BusinessConfigData>(
    field: K,
    value: BusinessConfigData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateHours = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    const currentDay = data.openingHours[day] ?? { ...DEFAULT_DAY_SCHEDULE };
    onChange({
      ...data,
      openingHours: {
        ...data.openingHours,
        [day]: { ...currentDay, [field]: value },
      },
    });
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Location info */}
      <div className="bg-gray-100 rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
          Información de la Ubicación
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configura los detalles físicos y horarios asociados a la sala seleccionada.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Ubicación / Sucursal</label>
            <input 
              type="text" 
              value={data.locationName} 
              onChange={(e) => updateField("locationName", e.target.value)} 
              className="bg-white block w-full py-2.5 px-3 rounded-md border border-gray-200 text-gray-900 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
              placeholder="Ej: SPEC.MEET Central"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Completa</label>
            <input 
              type="text" 
              value={data.address} 
              onChange={(e) => updateField("address", e.target.value)} 
              className="bg-white w-full py-2.5 px-3 rounded-md border border-gray-200 text-gray-900 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
              placeholder="Avenida, Calle, Número, Colonia..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones de Acceso</label>
            <textarea 
              rows={3} 
              value={data.accessInstructions ?? ""} 
              onChange={(e) => updateField("accessInstructions", e.target.value || null)} 
              className="bg-white block w-full py-2.5 px-3 rounded-md border border-gray-200 text-gray-900 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none" 
              placeholder="Ej: Pedir acceso al guardia mostrando la reserva..."
            />
          </div>
        </div>
      </div>

      {/* Opening hours */}
      <div className="bg-gray-100 rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Horario de Operación</h3>
        <div className="space-y-3">
          {WEEKDAYS.map((day) => {
            const hours = data.openingHours[day] ?? { ...DEFAULT_DAY_SCHEDULE };
            return (
              <div key={day} className="flex items-center justify-between bg-white/50 border border-gray-200 p-3 rounded-lg hover:bg-white transition-colors">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={!hours.closed} 
                    onChange={(e) => updateHours(day, "closed", !e.target.checked)} 
                    className="h-4 w-4 text-purple-600 rounded bg-zinc-800 border-zinc-600 focus:ring-purple-500 focus:ring-offset-zinc-900 cursor-pointer" 
                  />
                  <label className="ml-3 text-gray-900 capitalize w-24 cursor-pointer" onClick={() => updateHours(day, "closed", !hours.closed)}>
                    {day}
                  </label>
                </div>
                {!hours.closed ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={hours.open} 
                      onChange={(e) => updateHours(day, "open", e.target.value)} 
                      className="bg-white py-1.5 px-2.5 rounded-md border border-gray-200 text-gray-900 text-sm focus:ring-accent focus:border-accent transition-colors" 
                    />
                    <span className="text-gray-500 font-medium">a</span>
                    <input 
                      type="time" 
                      value={hours.close} 
                      onChange={(e) => updateHours(day, "close", e.target.value)} 
                      className="bg-white py-1.5 px-2.5 rounded-md border border-gray-200 text-gray-900 text-sm focus:ring-accent focus:border-accent transition-colors" 
                    />
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm italic pr-8">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={onSave} 
          disabled={saving} 
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-secondary hover:opacity-70 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <SaveIcon className="mr-2 h-4 w-4" />}
          {saveSuccess ? "¡Guardado con éxito!" : "Guardar Ubicación"}
        </button>
      </div>
    </div>
  );
}