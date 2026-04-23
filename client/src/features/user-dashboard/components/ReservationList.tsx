import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, TagIcon } from "lucide-react";
import { DASHBOARD_TAB, type DashboardTab, type UserReservation } from "../models";
import ReservationCard from "./ReservationCard";

interface ReservationListProps {
  upcoming: UserReservation[];
  past: UserReservation[];
  onViewDetails: (r: UserReservation) => void;
  onCancel: (r: UserReservation) => void;
  onExtend: (r: UserReservation) => void;
}

export default function ReservationList({
  upcoming,
  past,
  onViewDetails,
  onCancel,
  onExtend,
}: ReservationListProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DASHBOARD_TAB.UPCOMING);

  const isUpcoming = activeTab === DASHBOARD_TAB.UPCOMING;
  const displayed = isUpcoming ? upcoming : past;

  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg mb-8 border border-white border-opacity-10">
      {/* Header with tabs + navigation buttons */}
      <div className="border-b border-white border-opacity-10 px-6 py-4 flex justify-between items-center">
        <div className="flex flex-wrap gap-4">
          {([
            { key: DASHBOARD_TAB.UPCOMING, label: "Próximas Reservas" },
            { key: DASHBOARD_TAB.PAST, label: "Historial de Reservas" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === key
                  ? "bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20 shadow-lg text-white"
                  : "bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg text-white hover:bg-opacity-20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg hover:bg-opacity-20 transition-all"
          >
            <TagIcon className="mr-2 h-4 w-4" />
            Ver Planes
          </Link>
          <Link
            to="/booking"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 shadow-lg hover:bg-opacity-20 transition-all"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Reservar
          </Link>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          {isUpcoming ? "Próximas Reservas" : "Historial de Reservas"}
        </h3>

        {displayed.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white mb-4">
              {isUpcoming ? "No tienes reservas próximas" : "No tienes reservas pasadas"}
            </p>
            {isUpcoming && (
              <Link
                to="/booking"
                className="inline-flex items-center px-4 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md shadow-sm text-white bg-white bg-opacity-15 hover:bg-opacity-30 backdrop-blur-sm transition-all"
              >
                Reservar Ahora
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                isUpcoming={isUpcoming}
                onViewDetails={onViewDetails}
                onCancel={onCancel}
                onExtend={onExtend}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}