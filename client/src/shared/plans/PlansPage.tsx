import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchPublicPlans } from './public-plans.service';
import type { PublicPackageData } from './models';
import { BILLING_UNIT } from './models';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<PublicPackageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-300"><Loader2 className="animate-spin h-8 w-8 text-[#9A7B4F]" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-300 text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* TU HEADER ORIGINAL */}
        <div className="text-center mb-12">
          <h1 className=" text-4xl font-bold text-background mb-4">
            Nuestros Planes
          </h1>
          <p className="font-custom text-xl text-gray-700 max-w-3xl mx-auto">
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

            // Clases dinámicas basadas en la imagen
            const borderColor = isHourly ? "border-gray-300" : "border-[#9A7B4F] border-2";
            const btnStyle = isHourly 
              ? "bg-white text-[#9A7B4F] border border-[#9A7B4F] hover:bg-[#9A7B4F] hover:text-white" 
              : "bg-[#9A7B4F] text-white hover:bg-[#8e7149]";

            return (
              <div key={plan.id} className={`bg-white rounded-xl shadow-lg relative flex flex-col p-8 ${borderColor}`}>
                
                {/* Badge Descuento (Top Right) */}
                {!isHourly && discountPct > 0 && (
                  <div className="absolute -top-3 -right-3 bg-[#9A7B4F] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    -{discountPct}%
                  </div>
                )}

                {/* Cabecera */}
                <h3 className="text-2xl font-serif font-bold text-black mb-3">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                  {plan.description || "Reserva el tiempo que necesites."}
                </p>

                {/* Precio */}
                <div className="mb-2">
                  <span className="text-4xl font-serif font-bold text-black">
                    ${plan.price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-gray-500 font-serif ml-1">
                    / {isHourly ? "hora" : isFullDay ? "día" : "bloque"}
                  </span>
                </div>

                {/* Subtexto Dorado */}
                <div className="text-[13px] font-bold text-[#9A7B4F] mb-6 pb-6 border-b border-gray-200">
                  {isHourly ? (
                    "Tarifa base · Sin descuento"
                  ) : (
                    `$${effectiveRate.toFixed(0)}/hr efectivo · Ahorras $${savings.toFixed(0)}`
                  )}
                </div>

                {/* Tabla de Info */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{isHourly ? "Mínimo" : "Duración"}</span>
                    <span className="font-bold text-black">{isHourly ? "1 hora" : `${blockHours} horas fijas`}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{isHourly ? "Horario" : "Descuento"}</span>
                    {isHourly ? (
                      <span className="font-bold text-black">Flexible</span>
                    ) : (
                      <span className="font-bold text-emerald-700">{discountPct}% off</span>
                    )}
                  </div>
                  
                  {isHourly && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Descuento</span>
                      <span className="font-bold text-black">—</span>
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
                            <span className="text-sm font-bold text-black w-24">{opt.label}</span>
                            <span className="text-sm text-gray-500">{opt.startTime} – {opt.endTime}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Botón */}
                <Link 
                  to={`/booking?planId=${plan.id}&roomId=${plan.roomId}`} 
                  className={`block w-full py-3.5 px-4 rounded-lg text-center font-bold text-sm transition-colors mt-auto ${btnStyle}`}
                >
                  {isHourly ? "Reservar" : `Reservar ${plan.name.replace("Plan ", "")}`}
                </Link>
              </div>
            );
          })}
        </div>

        {/* TU SECCIÓN INFERIOR ORIGINAL */}
        <div className="mt-16 bg-zinc-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿Necesitas un plan personalizado?
          </h2>
          <p className="text-gray-300 mb-6">
            Si ninguno de nuestros planes estándar se adapta a tus necesidades,
            podemos crear un plan personalizado para ti o tu empresa.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="inline-flex items-center px-6 py-3 border border-gray-700 text-base font-medium rounded-md shadow-sm text-white bg-zinc-700 hover:bg-zinc-600">
              Contáctanos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlansPage;