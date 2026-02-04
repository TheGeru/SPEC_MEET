import React, { useState, useEffect } from 'react';
import { DollarSignIcon, ClockIcon, WifiIcon, CoffeeIcon, FileTextIcon, MapPinIcon, SaveIcon, PlusIcon, TrashIcon, AlertCircle,Loader2,Eye,Code } from 'lucide-react';
// Types
interface Package {
  id: number;
  name: string;
  hours: number;
  price: number;
  discount: number;
}

interface CancellationPolicy {
  fullRefund: number;
  partialRefund: number;
  partialRefundPercentage: number;
}

interface PricingSettings {
  hourlyRate: number;
  packages: Package[];
  cancellationPolicy: CancellationPolicy;
}

interface Beverage {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

interface WifiSettings {
  networkName: string;
  password: string;
  showPassword: boolean;
}

interface ResourcesSettings {
  beverages: Beverage[];
  wifiSettings: WifiSettings;
}

interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface LocationSettings {
  name: string;
  address: string;
  openingHours: OpeningHours;
  capacity: number;
  accessInstructions: string;
}

interface TermsSettings {
  template: string;
  additionalClauses: string;
  privacyOptions: {
    collectEmail: boolean;
    shareData: boolean;
    cctvNotice: boolean;
    cookieConsent: boolean;
  };
}

// Variable placeholders for the template
const TEMPLATE_VARIABLES = [
  { key: '{HOURLY_RATE}', label: 'Tarifa por hora', example: '$200 MXN' },
  { key: '{FULL_REFUND_HOURS}', label: 'Horas para reembolso completo', example: '24' },
  { key: '{PARTIAL_REFUND_HOURS}', label: 'Horas para reembolso parcial', example: '12' },
  { key: '{PARTIAL_REFUND_PERCENTAGE}', label: 'Porcentaje de reembolso parcial', example: '50%' },
  { key: '{LOCATION_NAME}', label: 'Nombre de la sala', example: 'SPEC.MEET Central' },
  { key: '{LOCATION_ADDRESS}', label: 'Dirección', example: 'Av. Insurgentes Sur 1602...' },
  { key: '{CAPACITY}', label: 'Capacidad', example: '8 personas' },
  { key: '{WIFI_NETWORK}', label: 'Red WiFi', example: 'SPEC.MEET_Guest' },
  { key: '{PACKAGES_LIST}', label: 'Lista de paquetes', example: 'Paquete 5 horas: $900...' }
];

const DEFAULT_TEMPLATE = `1. **Reservas y Pagos**: El pago debe realizarse al momento de la reserva. La tarifa por hora es de {HOURLY_RATE} + IVA.

2. **Política de Cancelación**: Se realizará un reembolso completo si la cancelación ocurre con más de {FULL_REFUND_HOURS} horas de anticipación. Las cancelaciones entre {PARTIAL_REFUND_HOURS} y {FULL_REFUND_HOURS} horas recibirán un reembolso del {PARTIAL_REFUND_PERCENTAGE}.

3. **Paquetes Disponibles**: {PACKAGES_LIST}

4. **Acceso**: El código de acceso es válido únicamente durante el período de la reserva en {LOCATION_NAME}. El ingreso anticipado o la salida tardía pueden generar cargos adicionales.

5. **Uso de Recursos**: Los recursos seleccionados (incluyendo WiFi: {WIFI_NETWORK}) estarán disponibles durante el período de reserva. Cualquier daño será responsabilidad del usuario.

6. **Capacidad**: La sala tiene capacidad para {CAPACITY}. No se permite exceder este límite.`;

// API simulation (replace with actual API calls)
const api = {
  async fetchSettings() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      pricing: {
        hourlyRate: 200,
        packages: [
          { id: 1, name: 'Paquete 5 horas', hours: 5, price: 900, discount: 10 },
          { id: 2, name: 'Paquete 10 horas', hours: 10, price: 1700, discount: 15 }
        ],
        cancellationPolicy: {
          fullRefund: 24,
          partialRefund: 12,
          partialRefundPercentage: 50
        }
      },
      resources: {
        beverages: [
          { id: 'coffee', name: 'Café', price: 30, enabled: true },
          { id: 'water', name: 'Agua', price: 20, enabled: true },
          { id: 'soda', name: 'Refresco', price: 25, enabled: true }
        ],
        wifiSettings: {
          networkName: 'SPEC.MEET_Guest',
          password: 'meetspec2023',
          showPassword: true
        }
      },
      location: {
        name: 'SPEC.MEET Central',
        address: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
        openingHours: {
          monday: { open: '09:00', close: '19:00', closed: false },
          tuesday: { open: '09:00', close: '19:00', closed: false },
          wednesday: { open: '09:00', close: '19:00', closed: false },
          thursday: { open: '09:00', close: '19:00', closed: false },
          friday: { open: '09:00', close: '19:00', closed: false },
          saturday: { open: '10:00', close: '14:00', closed: false },
          sunday: { open: '10:00', close: '14:00', closed: true }
        },
        capacity: 8,
        accessInstructions: 'La sala se encuentra en el piso 4, oficina 405. Usa el código de acceso en la puerta principal.'
      },
      terms: {
        template: DEFAULT_TEMPLATE,
        additionalClauses: '',
        privacyOptions: {
          collectEmail: true,
          shareData: false,
          cctvNotice: true,
          cookieConsent: true
        }
      }
    };
  },
  
  async saveSettings(settings: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Saving settings:', settings);
    return { success: true };
  }
};

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'resources' | 'terms' | 'location'>('pricing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Settings state
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    hourlyRate: 200,
    packages: [],
    cancellationPolicy: {
      fullRefund: 24,
      partialRefund: 12,
      partialRefundPercentage: 50
    }
  });
  
  const [resourcesSettings, setResourcesSettings] = useState<ResourcesSettings>({
    beverages: [],
    wifiSettings: {
      networkName: '',
      password: '',
      showPassword: true
    }
  });
  
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    name: '',
    address: '',
    openingHours: {},
    capacity: 0,
    accessInstructions: ''
  });
  
  const [termsSettings, setTermsSettings] = useState<TermsSettings>({
    template: DEFAULT_TEMPLATE,
    additionalClauses: '',
    privacyOptions: {
      collectEmail: true,
      shareData: false,
      cctvNotice: true,
      cookieConsent: true
    }
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.fetchSettings();
        setPricingSettings(data.pricing);
        setResourcesSettings(data.resources);
        setLocationSettings(data.location);
        setTermsSettings(data.terms);
        setError(null);
      } catch (err) {
        setError('Error al cargar la configuración');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate preview of T&C with current values
  const generatePreview = () => {
    let preview = termsSettings.template;
    
    // Replace all variables
    preview = preview
      .replace(/{HOURLY_RATE}/g, `$${pricingSettings.hourlyRate} MXN`)
      .replace(/{FULL_REFUND_HOURS}/g, String(pricingSettings.cancellationPolicy.fullRefund))
      .replace(/{PARTIAL_REFUND_HOURS}/g, String(pricingSettings.cancellationPolicy.partialRefund))
      .replace(/{PARTIAL_REFUND_PERCENTAGE}/g, `${pricingSettings.cancellationPolicy.partialRefundPercentage}%`)
      .replace(/{LOCATION_NAME}/g, locationSettings.name)
      .replace(/{LOCATION_ADDRESS}/g, locationSettings.address)
      .replace(/{CAPACITY}/g, `${locationSettings.capacity} personas`)
      .replace(/{WIFI_NETWORK}/g, resourcesSettings.wifiSettings.networkName);
    
    // Generate packages list
    const packagesList = pricingSettings.packages
      .map(pkg => `${pkg.name}: $${pkg.price} MXN (${pkg.hours} horas, ${pkg.discount}% descuento)`)
      .join(', ');
    preview = preview.replace(/{PACKAGES_LIST}/g, packagesList || 'No hay paquetes disponibles');
    
    // Add additional clauses if any
    if (termsSettings.additionalClauses.trim()) {
      preview += '\n\n**Cláusulas Adicionales:**\n' + termsSettings.additionalClauses;
    }
    
    return preview;
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      await api.saveSettings({
        pricing: pricingSettings,
        resources: resourcesSettings,
        location: locationSettings,
        terms: termsSettings
      });
      alert('Cambios guardados correctamente');
      setError(null);
    } catch (err) {
      setError('Error al guardar los cambios');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('termsTemplate') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = termsSettings.template;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      setTermsSettings(prev => ({
        ...prev,
        template: newText
      }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const renderPricingSettings = () => {
    const updatePackage = (id: number, field: string, value: any) => {
      setPricingSettings(prev => ({
        ...prev,
        packages: prev.packages.map(pkg =>
          pkg.id === id ? { ...pkg, [field]: value } : pkg
        )
      }));
    };

    const addPackage = () => {
      const newId = Math.max(...pricingSettings.packages.map(p => p.id), 0) + 1;
      setPricingSettings(prev => ({
        ...prev,
        packages: [...prev.packages, {
          id: newId,
          name: 'Nuevo Paquete',
          hours: 1,
          price: 200,
          discount: 0
        }]
      }));
    };

    const removePackage = (id: number) => {
      setPricingSettings(prev => ({
        ...prev,
        packages: prev.packages.filter(pkg => pkg.id !== id)
      }));
    };

    return (
      <div className="space-y-8">
        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Tarifa Base</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-1">
                Precio por hora (MXN)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSignIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="hourlyRate"
                  value={pricingSettings.hourlyRate}
                  onChange={e => setPricingSettings(prev => ({
                    ...prev,
                    hourlyRate: Number(e.target.value)
                  }))}
                  className="bg-zinc-900 block w-full pl-10 pr-12 py-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 sm:text-sm">MXN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Paquetes con Descuento</h3>
            <button
              type="button"
              onClick={addPackage}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Agregar
            </button>
          </div>
          <div className="space-y-4">
            {pricingSettings.packages.map(pkg => (
              <div key={pkg.id} className="bg-zinc-900 p-4 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={e => updatePackage(pkg.id, 'name', e.target.value)}
                      className="bg-zinc-800 w-full py-1 px-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackage(pkg.id)}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Horas</label>
                    <input
                      type="number"
                      value={pkg.hours}
                      onChange={e => updatePackage(pkg.id, 'hours', Number(e.target.value))}
                      className="bg-zinc-800 w-full py-1 px-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Precio (MXN)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={e => updatePackage(pkg.id, 'price', Number(e.target.value))}
                      className="bg-zinc-800 w-full py-1 px-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Descuento (%)</label>
                    <input
                      type="number"
                      value={pkg.discount}
                      onChange={e => updatePackage(pkg.id, 'discount', Number(e.target.value))}
                      className="bg-zinc-800 w-full py-1 px-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Política de Cancelación</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullRefund" className="block text-sm font-medium text-gray-300 mb-1">
                Reembolso completo si se cancela con más de:
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="fullRefund"
                  value={pricingSettings.cancellationPolicy.fullRefund}
                  onChange={e => setPricingSettings(prev => ({
                    ...prev,
                    cancellationPolicy: {
                      ...prev.cancellationPolicy,
                      fullRefund: Number(e.target.value)
                    }
                  }))}
                  className="bg-zinc-900 block w-full pl-10 pr-12 py-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 sm:text-sm">horas</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="partialRefund" className="block text-sm font-medium text-gray-300 mb-1">
                Reembolso parcial si se cancela con más de:
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="partialRefund"
                  value={pricingSettings.cancellationPolicy.partialRefund}
                  onChange={e => setPricingSettings(prev => ({
                    ...prev,
                    cancellationPolicy: {
                      ...prev.cancellationPolicy,
                      partialRefund: Number(e.target.value)
                    }
                  }))}
                  className="bg-zinc-900 block w-full pl-10 pr-12 py-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 sm:text-sm">horas</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="partialRefundPercentage" className="block text-sm font-medium text-gray-300 mb-1">
                Porcentaje de reembolso parcial:
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="partialRefundPercentage"
                  value={pricingSettings.cancellationPolicy.partialRefundPercentage}
                  onChange={e => setPricingSettings(prev => ({
                    ...prev,
                    cancellationPolicy: {
                      ...prev.cancellationPolicy,
                      partialRefundPercentage: Number(e.target.value)
                    }
                  }))}
                  className="bg-zinc-900 block w-full py-2 pr-12 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResourcesSettings = () => {
    const updateBeverage = (id: string, field: string, value: any) => {
      setResourcesSettings(prev => ({
        ...prev,
        beverages: prev.beverages.map(beverage =>
          beverage.id === id ? { ...beverage, [field]: value } : beverage
        )
      }));
    };

    return (
      <div className="space-y-8">
        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Bebidas y Amenidades</h3>
          <div className="space-y-3">
            {resourcesSettings.beverages.map(beverage => (
              <div key={beverage.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`beverage-${beverage.id}`}
                    checked={beverage.enabled}
                    onChange={e => updateBeverage(beverage.id, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-700 rounded bg-zinc-800"
                  />
                  <label htmlFor={`beverage-${beverage.id}`} className="ml-2 text-white">
                    {beverage.name}
                  </label>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Precio:</span>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-400 sm:text-xs">$</span>
                    </div>
                    <input
                      type="number"
                      value={beverage.price}
                      onChange={e => updateBeverage(beverage.id, 'price', Number(e.target.value))}
                      className="bg-zinc-800 w-20 pl-5 py-1 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Configuración Wi-Fi</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="networkName" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de Red
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <WifiIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="networkName"
                  value={resourcesSettings.wifiSettings.networkName}
                  onChange={e => setResourcesSettings(prev => ({
                    ...prev,
                    wifiSettings: {
                      ...prev.wifiSettings,
                      networkName: e.target.value
                    }
                  }))}
                  className="bg-zinc-900 block w-full pl-10 py-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="wifiPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type={resourcesSettings.wifiSettings.showPassword ? 'text' : 'password'}
                id="wifiPassword"
                value={resourcesSettings.wifiSettings.password}
                onChange={e => setResourcesSettings(prev => ({
                  ...prev,
                  wifiSettings: {
                    ...prev.wifiSettings,
                    password: e.target.value
                  }
                }))}
                className="bg-zinc-900 block w-full py-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTermsSettings = () => {
    return (
      <div className="space-y-8">
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Editor de Plantilla T&C</h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-1 border border-zinc-600 text-sm rounded-md text-white hover:bg-zinc-700"
            >
              {showPreview ? <Code className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showPreview ? 'Editar' : 'Vista Previa'}
            </button>
          </div>

          {!showPreview ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Usa las variables dinámicas para que los términos se actualicen automáticamente:
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map(variable => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => insertVariable(variable.key)}
                      className="inline-flex items-center px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                      title={`Ejemplo: ${variable.example}`}
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      {variable.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="termsTemplate" className="block text-sm font-medium text-gray-300 mb-1">
                  Plantilla de Términos y Condiciones
                </label>
                <textarea
                  id="termsTemplate"
                  rows={12}
                  value={termsSettings.template}
                  onChange={e => setTermsSettings(prev => ({
                    ...prev,
                    template: e.target.value
                  }))}
                  className="bg-zinc-900 block w-full py-2 px-3 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                  placeholder="Escribe la plantilla aquí..."
                />
              </div>
            </>
          ) : (
            <div className="bg-zinc-900 p-4 rounded-md">
              <h4 className="font-medium text-white mb-3">Vista Previa con Valores Actuales:</h4>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {generatePreview()}
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Cláusulas Adicionales</h3>
          <div>
            <label htmlFor="additionalClauses" className="block text-sm font-medium text-gray-300 mb-1">
              Texto Adicional (se agregará al final de los términos)
            </label>
            <textarea
              id="additionalClauses"
              rows={6}
              value={termsSettings.additionalClauses}
              onChange={e => setTermsSettings(prev => ({
                ...prev,
                additionalClauses: e.target.value
              }))}
              className="bg-zinc-900 block w-full py-2 px-3 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
              placeholder="Ingresa cláusulas adicionales aquí..."
            />
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Política de Privacidad</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="collectEmail"
                type="checkbox"
                checked={termsSettings.privacyOptions.collectEmail}
                onChange={e => setTermsSettings(prev => ({
                  ...prev,
                  privacyOptions: {
                    ...prev.privacyOptions,
                    collectEmail: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-700 rounded bg-zinc-800"
              />
              <label htmlFor="collectEmail" className="ml-2 text-sm text-gray-300">
                Recopilar correos electrónicos para marketing
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="shareData"
                type="checkbox"
                checked={termsSettings.privacyOptions.shareData}
                onChange={e => setTermsSettings(prev => ({
                  ...prev,
                  privacyOptions: {
                    ...prev.privacyOptions,
                    shareData: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-700 rounded bg-zinc-800"
              />
              <label htmlFor="shareData" className="ml-2 text-sm text-gray-300">
                Compartir datos anónimos para mejoras del servicio
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="cctvNotice"
                type="checkbox"
                checked={termsSettings.privacyOptions.cctvNotice}
                onChange={e => setTermsSettings(prev => ({
                  ...prev,
                  privacyOptions: {
                    ...prev.privacyOptions,
                    cctvNotice: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-700 rounded bg-zinc-800"
              />
              <label htmlFor="cctvNotice" className="ml-2 text-sm text-gray-300">
                Incluir aviso de videovigilancia CCTV
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="cookieConsent"
                type="checkbox"
                checked={termsSettings.privacyOptions.cookieConsent}
                onChange={e => setTermsSettings(prev => ({
                  ...prev,
                  privacyOptions: {
                    ...prev.privacyOptions,
                    cookieConsent: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-700 rounded bg-zinc-800"
              />
              <label htmlFor="cookieConsent" className="ml-2 text-sm text-gray-300">
                Solicitar consentimiento de cookies
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLocationSettings = () => {
    const updateOpeningHours = (day: string, field: string, value: any) => {
      setLocationSettings(prev => ({
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [day]: {
            ...prev.openingHours[day],
            [field]: value
          }
        }
      }));
    };

    return (
      <div className="space-y-8">
        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Información de la Ubicación</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de la Sala
              </label>
              <input
                type="text"
                id="locationName"
                value={locationSettings.name}
                onChange={e => setLocationSettings(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                className="bg-zinc-900 block w-full py-2 px-3 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Dirección
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  value={locationSettings.address}
                  onChange={e => setLocationSettings(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                  className="bg-zinc-900 block w-full pl-10 py-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-1">
                Capacidad (personas)
              </label>
              <input
                type="number"
                id="capacity"
                value={locationSettings.capacity}
                onChange={e => setLocationSettings(prev => ({
                  ...prev,
                  capacity: Number(e.target.value)
                }))}
                className="bg-zinc-900 block w-full py-2 px-3 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Horario de Operación</h3>
          <div className="space-y-3">
            {Object.entries(locationSettings.openingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between bg-zinc-900 p-3 rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={!hours.closed}
                    onChange={e => updateOpeningHours(day, 'closed', !e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-700 rounded bg-zinc-800"
                  />
                  <label htmlFor={`day-${day}`} className="ml-2 text-white capitalize w-24">
                    {day}
                  </label>
                </div>
                {!hours.closed && (
                  <div className="flex items-center">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={e => updateOpeningHours(day, 'open', e.target.value)}
                      className="bg-zinc-800 w-32 py-1 px-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                    <span className="mx-2 text-gray-400">a</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={e => updateOpeningHours(day, 'close', e.target.value)}
                      className="bg-zinc-800 w-32 py-1 px-2 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white text-sm"
                    />
                  </div>
                )}
                {hours.closed && <span className="text-gray-400 text-sm">Cerrado</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Instrucciones de Acceso</h3>
          <div>
            <label htmlFor="accessInstructions" className="block text-sm font-medium text-gray-300 mb-1">
              Instrucciones para los usuarios
            </label>
            <textarea
              id="accessInstructions"
              rows={4}
              value={locationSettings.accessInstructions}
              onChange={e => setLocationSettings(prev => ({
                ...prev,
                accessInstructions: e.target.value
              }))}
              className="bg-zinc-900 block w-full py-2 px-3 rounded-md border border-zinc-700 focus:ring-purple-500 focus:border-purple-500 text-white"
              placeholder="Instrucciones detalladas para acceder a la sala..."
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pricing':
        return renderPricingSettings();
      case 'resources':
        return renderResourcesSettings();
      case 'terms':
        return renderTermsSettings();
      case 'location':
        return renderLocationSettings();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <button
          type="button"
          onClick={saveChanges}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden sticky top-4">
            <nav className="flex flex-col">
              <button
                className={`px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === 'pricing'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                }`}
                onClick={() => setActiveTab('pricing')}
              >
                <div className="flex items-center">
                  <DollarSignIcon className="h-5 w-5 mr-2" />
                  Precios y Paquetes
                </div>
              </button>
              <button
                className={`px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === 'resources'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                }`}
                onClick={() => setActiveTab('resources')}
              >
                <div className="flex items-center">
                  <CoffeeIcon className="h-5 w-5 mr-2" />
                  Bebidas y Amenidades
                </div>
              </button>
              <button
                className={`px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === 'terms'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                }`}
                onClick={() => setActiveTab('terms')}
              >
                <div className="flex items-center">
                  <FileTextIcon className="h-5 w-5 mr-2" />
                  Términos y Condiciones
                </div>
              </button>
              <button
                className={`px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === 'location'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                }`}
                onClick={() => setActiveTab('location')}
              >
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Ubicación y Horarios
                </div>
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AdminSettings;