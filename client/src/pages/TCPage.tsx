import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchTermsConfig,
  fetchBusinessConfig,
  fetchBaseRates,
  fetchPackages,
  fetchRooms,
} from '../features/admin-settings/services/AdminSettings.service';
import type {
  TermsConfigData,
  BusinessConfigData,
  RoomBaseRateData,
  PricePackageData,
  RoomData,
} from '../features/admin-settings/models';

// ─── Types ────────────────────────────────────────────────────

interface TCPageData {
  terms: TermsConfigData;
  business: BusinessConfigData;
  rates: RoomBaseRateData[];
  packages: PricePackageData[];
  rooms: RoomData[];
}

// ─── Component ───────────────────────────────────────────────

const TCPage = () => {
  const [data, setData] = useState<TCPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllConfig = async () => {
      try {
        setLoading(true);

        // ✅ Using service functions — not raw api.get()
        // ✅ Endpoints that ACTUALLY exist in your backend
        const [terms, business, rates, packages, rooms] = await Promise.all([
          fetchTermsConfig(),
          fetchBusinessConfig(),
          fetchBaseRates(),
          fetchPackages(),
          fetchRooms(),
        ]);

        setData({ terms, business, rates, packages, rooms });
      } catch (err) {
        console.error('Error al cargar términos:', err);
        setError('No se pudo cargar la información legal. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadAllConfig();
  }, []);

  // ─── Template processor ─────────────────────────────────────

  const renderProcessedTemplate = (template: string): string => {
    if (!data) return template;

    const { business, rates, packages, rooms } = data;

    // Get the first active base rate (most recent, effectiveUntil = null)
    const activeRate = rates.find(r => r.effectiveUntil === null);
    const hourlyRate = activeRate?.hourlyRate ?? 0;

    // Get room capacity from the first room linked to the active rate
    const rateRoom = activeRate
      ? rooms.find(r => r.id === activeRate.roomId)
      : rooms[0];
    const capacity = rateRoom?.capacity ?? 0;
    const wifiNetwork = rateRoom?.wifi_ssid ?? 'Red Privada';

    // Build packages list from active packages only
    const activePackages = packages.filter(p => p.isActive);
    const packagesList = activePackages.length > 0
      ? activePackages
          .map(pkg => {
            const blockHours = pkg.metadata.blockHours;
            return blockHours
              ? `${pkg.name} ($${pkg.metadata.discountPct ?? 0}% desc. | ${blockHours}h)`
              : pkg.name;
          })
          .join(', ')
      : 'Consultar paquetes vigentes';

    return template
      .replace(/{HOURLY_RATE}/g, `$${hourlyRate} MXN`)
      .replace(/{LOCATION_NAME}/g, business.locationName)
      .replace(/{LOCATION_ADDRESS}/g, business.address)
      .replace(/{CAPACITY}/g, `${capacity} personas`)
      .replace(/{WIFI_NETWORK}/g, wifiNetwork)
      .replace(/{PACKAGES_LIST}/g, packagesList)
      .replace(/{FULL_REFUND_HOURS}/g, String(business.refundFullHours))
      .replace(/{PARTIAL_REFUND_HOURS}/g, String(business.refundPartialHours))
      .replace(/{PARTIAL_REFUND_PERCENTAGE}/g, `${business.refundPartialPct}%`);
  };

  // ─── Render states ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-10 w-10 text-background animate-spin mb-4" />
        <p className="text-gray-500 animate-pulse">Cargando términos y condiciones...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-background underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto pt-16 pb-8 px-6 border-b border-gray-100">
        <h1 className="text-3xl font-light text-center text-gray-900 tracking-tight">
          TÉRMINOS Y CONDICIONES DE SERVICIO.MEET
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-purple max-w-none">

          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px] text-justify">
            {renderProcessedTemplate(data.terms.templateContent)}
          </div>

          {data.terms.additionalClauses && (
            <div className="mt-12 pt-12 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">
                Disposiciones Complementarias
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] bg-gray-50 p-6 rounded-xl border border-gray-100 text-justify">
                {data.terms.additionalClauses}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TCPage;