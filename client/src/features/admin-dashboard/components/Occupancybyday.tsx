import type { OccupancyDay } from "../models";

interface OccupancyByDayProps {
  data: OccupancyDay[];
}

export default function OccupancyByDay({ data }: OccupancyByDayProps) {
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-lg font-medium text-white">Ocupación por Día Promedio</h2>
      </div>
      <div className="p-6 space-y-4">
        {data.map((d) => (
          <div key={d.day}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">{d.day}</span>
              <span className="text-sm text-gray-300">{d.percentage}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${d.percentage >= 70 ? "bg-green-500" : d.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${d.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}