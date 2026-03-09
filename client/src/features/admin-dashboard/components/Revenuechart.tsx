import type { RevenueWeek } from "../models";

interface RevenueChartProps {
  data: RevenueWeek[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">Ingresos por Semana (Últimas 7)</h2>
      </div>
      <div className="h-64 flex items-end justify-between px-2">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="flex flex-col items-center w-full group relative">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs p-1 rounded">
                ${item.amount.toLocaleString("es-MX")}
              </div>
              <div
                className="w-full mx-1 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-sm hover:from-purple-600 hover:to-purple-500 transition-colors cursor-pointer"
                style={{ height: `${item.heightPercent > 0 ? item.heightPercent : 1}%` }}
              />
              <div className="text-xs text-gray-400 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {item.week}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 w-full text-center">No hay datos de ingresos recientes.</p>
        )}
      </div>
    </div>
  );
}