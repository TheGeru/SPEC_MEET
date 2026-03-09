import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { XIcon, Loader2 } from 'lucide-react';
import { fetchPublicPlans } from './public-plans.service';
import type { PublicPackageData } from './models';
import { BILLING_UNIT } from './models';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlansModal: React.FC<PlansModalProps> = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState<PublicPackageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    const loadPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchPublicPlans();
        setPlans(data.filter(p => p.billingUnit !== BILLING_UNIT.CUSTOM).slice(0, 3));
      } catch (err) {
        console.error("Error cargando planes para el modal", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* OVERLAY ORIGINAL */}
        <div className="fixed inset-0 bg-black bg-opacity-80 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* CONTENEDOR MODAL ORIGINAL */}
        <div className="inline-block align-bottom bg-zinc-900 rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-zinc-700">
          <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
            <button type="button" className="text-gray-400 hover:text-white bg-zinc-800 rounded-md p-1" onClick={onClose}>
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="px-4 pt-8 pb-8 sm:px-10">
            <div className="text-center mb-10">
              <h3 className="text-3xl leading-6 font-bold text-white mb-3" id="modal-title">
                Elige tu Plan
              </h3>
              <p className="text-gray-400">
                Comienza con el plan que mejor se adapte a tus necesidades
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin h-10 w-10 text-[#9A7B4F]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isHourly = plan.billingUnit === BILLING_UNIT.HOUR;
                  const blockHours = plan.metadata?.blockHours || 1;
                  const discountPct = plan.metadata?.discountPct || 0;
                  
                  const effectiveRate = plan.price / blockHours;
                  const baseRate = discountPct > 0 ? effectiveRate / (1 - discountPct / 100) : effectiveRate;
                  const savings = (baseRate * blockHours) - plan.price;

                  const borderColor = isHourly ? "border-gray-300" : "border-[#9A7B4F] border-2";
                  const btnStyle = isHourly 
                    ? "bg-white text-[#9A7B4F] border border-[#9A7B4F] hover:bg-[#9A7B4F] hover:text-white" 
                    : "bg-[#9A7B4F] text-white hover:bg-[#8e7149]";

                  return (
                    <div key={plan.id} className={`bg-white rounded-xl shadow-lg relative flex flex-col p-6 ${borderColor}`}>
                      {!isHourly && discountPct > 0 && (
                        <div className="absolute -top-3 -right-3 bg-[#9A7B4F] text-white text-xs font-bold px-3 py-1 rounded-full">
                          -{discountPct}%
                        </div>
                      )}

                      <h3 className="text-xl font-serif font-bold text-black mb-2">{plan.name}</h3>
                      
                      <div className="mb-2 mt-4">
                        <span className="text-3xl font-serif font-bold text-black">
                          ${plan.price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-sm text-gray-500 font-serif ml-1">
                          / {isHourly ? "hora" : "bloque"}
                        </span>
                      </div>

                      <div className="text-[12px] font-bold text-[#9A7B4F] mb-6 pb-4 border-b border-gray-200">
                        {isHourly 
                          ? "Tarifa base · Sin descuento" 
                          : `$${effectiveRate.toFixed(0)}/hr efectivo · Ahorras $${savings.toFixed(0)}`}
                      </div>

                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{isHourly ? "Mínimo" : "Duración"}</span>
                          <span className="font-bold text-black">{isHourly ? "1 hora" : `${blockHours} hrs`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Descuento</span>
                          {isHourly ? <span className="font-bold text-black">—</span> : <span className="font-bold text-emerald-700">{discountPct}% off</span>}
                        </div>
                      </div>

                      <Link 
                        to={`/booking?planId=${plan.id}&roomId=${plan.roomId}`} 
                        onClick={onClose}
                        className={`block w-full py-2.5 px-4 rounded-lg text-center font-bold text-sm transition-colors mt-auto ${btnStyle}`}
                      >
                        Seleccionar
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-10 text-center">
              <Link to="/plans" onClick={onClose} className="text-[#9A7B4F] hover:text-[#c4a16f] font-medium transition-colors">
                Ver todos los detalles de los planes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansModal;