import { CheckCircleIcon, AlertCircleIcon, XCircleIcon } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PAID":
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-30 backdrop-blur-sm text-white">
          <CheckCircleIcon className="w-3 h-3 mr-1" /> Confirmada
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-30 backdrop-blur-sm text-white">
          <AlertCircleIcon className="w-3 h-3 mr-1" /> Pendiente
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 bg-opacity-30 backdrop-blur-sm text-white">
          <CheckCircleIcon className="w-3 h-3 mr-1" /> Completada
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 bg-opacity-30 backdrop-blur-sm text-white">
          <XCircleIcon className="w-3 h-3 mr-1" /> Cancelada
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500 bg-opacity-30 backdrop-blur-sm text-white">
          {status}
        </span>
      );
  }
}