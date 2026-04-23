import { CheckCircleIcon, AlertCircleIcon, XCircleIcon } from "lucide-react";
import type { ToastData } from "../models";

interface ToastProps extends ToastData {
  onClose: () => void;
}

export default function Toast({ msg, type, onClose }: ToastProps) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-sm ${
        type === "success"
          ? "bg-green-900/80 border-green-700/50 text-green-200"
          : "bg-red-900/80 border-red-700/50 text-red-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircleIcon className="h-4 w-4" />
      ) : (
        <AlertCircleIcon className="h-4 w-4" />
      )}
      {msg}
      <button onClick={onClose}>
        <XCircleIcon className="h-4 w-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
}