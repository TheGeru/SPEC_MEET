import { Link } from "react-router-dom";
import { CalendarIcon, PlusCircleIcon } from "lucide-react";
import type { Discount } from "../models";

interface DiscountCardsProps {
  discounts: Discount[];
}

export default function DiscountCards({ discounts }: DiscountCardsProps) {
  if (discounts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <PlusCircleIcon className="h-5 w-5 text-white" />
        <h2 className="text-xl font-bold text-white">Mis Beneficios</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="group relative overflow-hidden bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-5 border border-white border-opacity-20 shadow-xl transition-all hover:bg-opacity-15"
          >
            {/* Ticket cutout circles */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full border-r border-white/20" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full border-l border-white/20" />

            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  Cortesía Meet
                </p>
                <h4 className="text-2xl font-black text-white">
                  {discount.hours} Horas Gratis
                </h4>
                <p className="text-xs text-gray-400 mt-1 italic">
                  {discount.description || "Válido para cualquier sala"}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono font-bold text-white border border-white/10">
                  {discount.code}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Vence: {new Date(discount.expiresAt).toLocaleDateString()}
              </span>
              <Link
                to="/booking"
                className="text-[10px] font-bold text-white hover:underline uppercase tracking-tighter"
              >
                Usar ahora →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}