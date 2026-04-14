/**
 * ══════════════════════════════════════════════════════════════
 * ADMIN-SETTINGS FEATURE — CONTAINER
 * ══════════════════════════════════════════════════════════════
 *
 * Orchestrates 6 configuration tabs:
 * - Location & Hours (BusinessConfig)
 * - Cancellation Policy (BusinessConfig refund fields)
 * - Wi-Fi (Room.wifi_ssid/wifi_pass)
 * - Terms & Conditions (TermsConfig + US-07 dynamic variables)
 * - Packages (PricePackage CRUD — US-08-A)
 * - Base Rates (RoomBaseRate — US-08-B)
 *
 * Container wires useAdminSettings hook → presentational tab components.
 * Each tab gets ONLY the data and callbacks it needs. No God Object.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSignIcon, FileTextIcon, MapPinIcon, WifiIcon,
  PackageIcon, ShieldIcon, Building2Icon, ArrowLeftIcon,Loader2, AlertCircle,
} from "lucide-react";
import { SETTINGS_TAB, type SettingsTab } from "./models";
import { useAdminSettings } from "./hooks/UseAdminSettings";

// Tab components
import LocationTab from "./components/LocationTab";
import CancellationTab from "./components/CancellationTab";
import RoomsTab from "./components/RoomsTab";
import WifiTab from "./components/WifiTab";
import TermsEditorTab from "./components/TermsEditorTab";
import PackagesTab from "./components/PackagesTab";
import RatesTab from "./components/RatesTab";
import RoomSelector from "./components/RoomSelector";

// ─── Tab config ───────────────────────────────────────────────

const TAB_CONFIG = [
  { key: SETTINGS_TAB.LOCATION, label: "Ubicación y Horarios", icon: MapPinIcon },
  { key: SETTINGS_TAB.CANCELLATION, label: "Política de Cancelación", icon: ShieldIcon },
  { key: SETTINGS_TAB.ROOMS, label: "Gestión de Salas", icon: Building2Icon },
  { key: SETTINGS_TAB.WIFI, label: "Configuración Wi-Fi", icon: WifiIcon },
  { key: SETTINGS_TAB.TERMS, label: "Términos y Condiciones", icon: FileTextIcon },
  { key: SETTINGS_TAB.PACKAGES, label: "Paquetes de Precios", icon: PackageIcon },
  { key: SETTINGS_TAB.RATES, label: "Tarifa Base por Sala", icon: DollarSignIcon },
] as const;

// ─── Empty state helper ───────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-8 text-center border border-zinc-700 animate-in fade-in duration-300">
      <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
      <p className="text-gray-300 text-sm">{message}</p>
      <p className="text-gray-500 text-xs mt-2">
        Verifica que hayas seleccionado una sala o que el servidor esté funcionando.
      </p>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────

export default function AdminSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>(SETTINGS_TAB.LOCATION);
  const settings = useAdminSettings();

  // ── Loading state ─────────────────────────────────────────
  if (settings.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Cargando configuraciones...</p>
      </div>
    );
  }

  // ── Render active tab ─────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case SETTINGS_TAB.LOCATION:
        return settings.businessConfig ? (
          <LocationTab
            data={settings.businessConfig}
            onChange={settings.setBusinessConfig as (d: NonNullable<typeof settings.businessConfig>) => void}
            onSave={settings.saveBusiness}
            saving={settings.businessSave.saving}
            saveSuccess={settings.businessSave.success}
          />
        ) : (
          <EmptyState message="No se pudo cargar la configuración de ubicación para esta sala" />
        );

      case SETTINGS_TAB.CANCELLATION:
        return settings.businessConfig ? (
          <CancellationTab
            data={settings.businessConfig}
            onChange={settings.setBusinessConfig as (d: NonNullable<typeof settings.businessConfig>) => void}
            onSave={settings.saveBusiness}
            saving={settings.businessSave.saving}
            saveSuccess={settings.businessSave.success}
          />
        ) : (
          <EmptyState message="No se pudo cargar la política de cancelación" />
        );

      case SETTINGS_TAB.ROOMS:
        return (
          <RoomsTab
            rooms={settings.roomsFull}
            businessConfigExists={!!settings.businessConfig}
            onCreateRoom={settings.createNewRoom}
            onUpdateRoom={settings.updateExistingRoom}
            onDeleteRoom={settings.deleteExistingRoom}
          />
        );

      case SETTINGS_TAB.WIFI:
        return settings.roomWifi ? (
          <WifiTab
            data={settings.roomWifi}
            onChange={settings.setRoomWifi as (d: NonNullable<typeof settings.roomWifi>) => void}
            onSave={settings.saveWifi}
            saving={settings.wifiSave.saving}
            saveSuccess={settings.wifiSave.success}
          />
        ) : (
          <EmptyState message="Selecciona una sala en la parte superior para configurar su Wi-Fi" />
        );

      case SETTINGS_TAB.TERMS:
        return settings.termsConfig ? (
          <TermsEditorTab
            data={settings.termsConfig}
            onChange={settings.setTermsConfig as (d: NonNullable<typeof settings.termsConfig>) => void}
            onSave={settings.saveTerms}
            saving={settings.termsSave.saving}
            saveSuccess={settings.termsSave.success}
            businessConfig={settings.businessConfig}
            roomWifi={settings.roomWifi}
            packages={settings.packages}
            rates={settings.rates}
          />
        ) : (
          <EmptyState message="No se pudo cargar la plantilla de términos y condiciones" />
        );

      case SETTINGS_TAB.PACKAGES:
        return (
          <PackagesTab
            packages={settings.packages}
            rates={settings.rates}
            rooms={settings.rooms}
            onSave={settings.savePackage}
            onToggle={settings.togglePkg}
            onDelete={settings.deletePkg}
          />
        );

      case SETTINGS_TAB.RATES:
        return (
          <RatesTab
            rates={settings.rates}
            rooms={settings.rooms}
            onSave={settings.saveRate}
          />
        );

      default:
        return null;
    }
  };

return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Error banner */}
      {settings.loadError && (
        <div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-center animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0" />
          <p className="text-red-300 text-sm font-medium">{settings.loadError}</p>
        </div>
      )}

      {/* HEADER GLOBAL REDISEÑADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-zinc-800 pb-6">
        
        {/* 🚀 Lado Izquierdo: Botón Atrás + Títulos */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')} 
            className="p-2 bg-zinc-800/50 border border-zinc-700 text-gray-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-all shadow-sm shrink-0"
            title="Volver al panel principal"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Configuración del Sistema
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Gestiona ubicaciones, precios y reglas de tu negocio.
            </p>
          </div>
        </div>
        
        {/* SELECTOR GLOBAL DE SALA (Actúa sobre todas las pestañas) */}
        <div className="shrink-0">
          <RoomSelector
            rooms={settings.rooms}
            selectedRoomId={settings.selectedRoomId}
            onSelectRoom={settings.setSelectedRoomId}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl shadow-lg overflow-hidden sticky top-6">
            <nav className="flex flex-col py-2">
              {TAB_CONFIG.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-5 py-3.5 text-left text-sm font-medium transition-all relative ${
                      isActive
                        ? "text-white bg-zinc-800/80"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md" />
                    )}
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-zinc-500"}`} />
                      {label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}