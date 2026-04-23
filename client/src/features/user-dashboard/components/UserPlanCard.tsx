import { Link } from "react-router-dom";
import { SparklesIcon, PackageIcon } from "lucide-react";

interface UserPlanCardProps {
  planName: string | null;
  planDescription: string | null;
  isActive: boolean;
}

export default function UserPlanCard({
  planName,
  planDescription,
  isActive,
}: UserPlanCardProps) {
  if (!planName) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <PackageIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Mi Plan</h3>
            <p className="text-white/50 text-sm mb-3">
              No tienes un plan activo. Reserva por hora o explora nuestros
              paquetes con descuento.
            </p>
            <Link
              to="/plans"
              className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Ver planes disponibles →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-lg p-5 border border-purple-500/30 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/30 rounded-lg">
          <SparklesIcon className="h-5 w-5 text-purple-300" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold">{planName}</h3>
            {isActive && (
              <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-900/40 text-green-400 border border-green-700/50">
                Activo
              </span>
            )}
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            {planDescription}
          </p>
        </div>
      </div>
    </div>
  );
}