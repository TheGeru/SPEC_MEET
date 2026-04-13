import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchPublicPlans } from './public-plans.service';
import type { PublicPackageData } from './models';
import { BILLING_UNIT } from './models';
import { useNavigate } from 'react-router-dom';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<PublicPackageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSelectPlan = (plan: PublicPackageData) => {
  navigate('/booking', { 
    state: { 
      selectedPlan: plan,
    } 
  });
};

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchPublicPlans();
        // Filtramos "custom" para dejarlos en la sección inferior
        setPlans(data.filter(p => p.billingUnit !== BILLING_UNIT.CUSTOM));
      } catch (err) {
        setError("Error cargando los planes de reserva.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin h-8 w-8 text-white" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* TU HEADER ORIGINAL */}
        <div className="text-center mb-12">
          <h1 className=" text-4xl font-bold text-white mb-4">
            Nuestros Planes
          </h1>
          <p className="font-custom text-xl text-gray-300 max-w-3xl mx-auto">
            Selecciona el plan que mejor se adapte a tus necesidades de reuniones y presentaciones
          </p>
        </div>

        {/* EL GRID CON EL DISEÑO DE TU IMAGEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
          {plans.map((plan) => {
            const isHourly = plan.billingUnit === BILLING_UNIT.HOUR;
            const isFullDay = plan.billingUnit === BILLING_UNIT.FULL_DAY;

            
            // Datos dinámicos de Prisma
            const blockHours = plan.metadata?.blockHours || 1;
            const discountPct = plan.metadata?.discountPct || 0;
            const scheduleOptions = plan.metadata?.schedule?.options || [];
            
            // Matemáticas inversas para la tarjeta
            const effectiveRate = plan.price / blockHours;
            const baseRate = discountPct > 0 ? effectiveRate / (1 - discountPct / 100) : effectiveRate;
            const savings = (baseRate * blockHours) - plan.price;

            const borderColor = isHourly ? "border-gray-100" : "border-[#9A7B4F] border-1";
            const btnStyle = isHourly 
              ? "bg-white bg-opacity-5 border-transparent text-white hover:bg-white hover:bg-opacity-15" 
              : "bg-[#9A7B4F] text-white hover:bg-[#8e7149]";

            return (
              <div key={plan.id} className={`bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg  relative flex flex-col p-8 ${borderColor}`}>
                
                {/* Badge Descuento (Top Right) */}
                {!isHourly && discountPct > 0 && (
                  <div className="absolute -top-3 -right-3 bg-[#9A7B4F] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    -{discountPct}%
                  </div>
                )}

                {/* Cabecera */}
                <h3 className="text-2xl font-serif font-bold text-white mb-3">{plan.name}</h3>
                <p className="text-sm text-gray-200 mb-6 min-h-[40px]">
                  {plan.description || "Reserva el tiempo que necesites."}
                </p>

                {/* Precio */}
                <div className="mb-2">
                  <span className="text-4xl  font-bold text-white">
                    ${plan.price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-gray-300  ml-1">
                    / {isHourly ? "hora" : isFullDay ? "día" : "bloque"}
                  </span>
                </div>

                {/* Subtexto Dorado */}
                <div className="text-[13px] text-[#9A7B4F] mb-6 pb-6 border-b border-gray-200">
                  {isHourly ? (
                    "Tarifa base · Sin descuento"
                  ) : (
                    `$${effectiveRate.toFixed(0)}/hr efectivo · Ahorras $${savings.toFixed(0)}`
                  )}
                </div>

                {/* Tabla de Info */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{isHourly ? "Mínimo" : "Duración"}</span>
                    <span className="font-bold text-white">{isHourly ? "1 hora" : `${blockHours} horas fijas`}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{isHourly ? "Horario" : "Descuento"}</span>
                    {isHourly ? (
                      <span className="font-bold text-white">Flexible</span>
                    ) : (
                      <span className="font-bold text-emerald-700">{discountPct}% off</span>
                    )}
                  </div>
                  
                  {isHourly && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Descuento</span>
                      <span className="font-bold text-white">—</span>
                    </div>
                  )}

                  {/* Horarios (Pills) */}
                  {!isHourly && scheduleOptions.length > 0 && (
                    <div className="space-y-3 mt-6">
                      {scheduleOptions.map((opt: any, idx: number) => {
                        const dotColor = opt.label.toLowerCase() === "mañana" ? "bg-amber-400" : 
                                         opt.label.toLowerCase() === "tarde" ? "bg-purple-500" : "bg-emerald-500";
                        return (
                          <div key={idx} className="flex items-center bg-[#f7f7f7] rounded-md p-3">
                            <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${dotColor}`}></span>
                            <span className="text-sm font-bold text-white w-24">{opt.label}</span>
                            <span className="text-sm text-gray-300">{opt.startTime} – {opt.endTime}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Botón */}
                <button
                onClick={() => handleSelectPlan(plan)}
                className={`block w-full py-3.5 px-4 rounded-lg text-center font-bold text-sm transition-colors mt-auto ${btnStyle}`}
                >
                  {isHourly ? "Reservar" : `Reservar ${plan.name.replace("Plan ", "")}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* TU SECCIÓN INFERIOR ORIGINAL */}
        <div className="mt-16 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-8 ">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿Necesitas un plan personalizado?
          </h2>
          <p className="text-gray-300 mb-6">
            Si ninguno de nuestros planes estándar se adapta a tus necesidades,
            podemos crear un plan personalizado para ti o tu empresa.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="inline-flex items-center px-6 py-3  text-base font-medium bg-white bg-opacity-15 backdrop-blur-sm text-white rounded-md hover:bg-opacity-30 transition-all border border-white border-opacity-30 disabled:opacity-50">
              Contáctanos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlansPage;