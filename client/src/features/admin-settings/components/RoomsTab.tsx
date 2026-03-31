/**
 * RoomsTab — Presentational Component
 *
 * CRUD for Room management with card-based UI (Vercel-style).
 * - Search and filter rooms
 * - Create new room (requires BusinessConfig to exist)
 * - Edit room details
 * - Delete room (with confirmation)
 * - Shows room status, capacity, amenities
 *
 * RNF-19: "Escalabilidad a múltiples salas y ubicaciones"
 * This is the foundation for multi-room support.
 */

import { useState } from "react";
import {
  PlusIcon, SearchIcon, PencilIcon, TrashIcon, XIcon,
  WifiIcon, UsersIcon, Building2Icon, AlertTriangleIcon,
  CheckCircleIcon, XCircleIcon,
} from "lucide-react";
import type { RoomData } from "../models";

interface RoomsTabProps {
  rooms: RoomData[];
  businessConfigExists: boolean;
  onCreateRoom: (data: RoomFormData) => Promise<void>;
  onUpdateRoom: (id: string, data: RoomFormData) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
}

interface RoomFormData {
  name: string;
  capacity: number;
  wifi_ssid: string;
  wifi_pass: string;
  status: string;
  amenities: string[];
  ttlock_lock_id: string;
}

const EMPTY_FORM: RoomFormData = {
  name: "",
  capacity: 10,
  wifi_ssid: "",
  wifi_pass: "",
  status: "ACTIVO",
  amenities: [],
  ttlock_lock_id: "",
};

const AMENITY_OPTIONS = [
  "wifi", "hdmi", "ac", "privacidad", "acceso_autonomo",
  "pantalla_4k", "camara_hd", "pizarra", "microfonos",
] as const;

const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  hdmi: "HDMI",
  ac: "Aire Acondicionado",
  privacidad: "Privacidad",
  acceso_autonomo: "Acceso Autónomo",
  pantalla_4k: "Pantalla 4K",
  camara_hd: "Cámara HD",
  pizarra: "Pizarra Digital",
  microfonos: "Micrófonos",
};

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  ACTIVO: { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Activo" },
  INACTIVO: { bg: "bg-gray-100 text-gray-500 border-gray-200", label: "Inactivo" },
  MANTENIMIENTO: { bg: "bg-amber-100 text-amber-700 border-amber-200", label: "Mantenimiento" },
};

export default function RoomsTab({
  rooms,
  businessConfigExists,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
}: RoomsTabProps) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
  const [form, setForm] = useState<RoomFormData>(EMPTY_FORM);
  const [deletingRoom, setDeletingRoom] = useState<RoomData | null>(null);

  const filtered = (rooms ?? []).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingRoom(null);
    setShowModal(true);
  };

  const openEdit = (room: RoomData) => {
    setForm({
      name: room.name,
      capacity: room.capacity,
      wifi_ssid: room.wifi_ssid,
      wifi_pass: room.wifi_pass,
      status: room.status,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      ttlock_lock_id: room.ttlock_lock_id || "",
    });
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editingRoom) {
      await onUpdateRoom(editingRoom.id, form);
    } else {
      await onCreateRoom(form);
    }
    setShowModal(false);
    setEditingRoom(null);
  };

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  // ── Guard: BusinessConfig must exist first ──────────────────
  if (!businessConfigExists) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-8 text-center">
        <Building2Icon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-300 mb-2">
          Configuración inicial requerida
        </h3>
        <p className="text-yellow-400/70 text-sm max-w-md mx-auto">
          Antes de crear salas, necesitas configurar la ubicación del negocio.
          Ve a la pestaña "Ubicación y Horarios" y guarda tu configuración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Search + Add button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar salas..."
            className="w-full bg-white text-gray-900 pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm  focus:ring-secondary focus:border-secondary"
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-900 bg-secondary rounded-lg hover:opacity-70 transition-colors shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva Sala
        </button>
      </div>

      {/* Room cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg py-16 text-center border border-gray-200">
          <Building2Icon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {(rooms ?? []).length === 0 ? "No hay salas configuradas" : "No se encontraron resultados"}
          </p>
          {(rooms ?? []).length === 0 && (
            <button onClick={openCreate} className="mt-4 text-secondary/80 hover:text-secondary text-sm font-medium">
              + Crear tu primera sala
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((room) => {
            const statusStyle = STATUS_BADGE[room.status] || STATUS_BADGE.INACTIVO;
            const amenities = Array.isArray(room.amenities) ? room.amenities : [];

            return (
              <div
                key={room.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-secondary transition-colors"
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-background">{room.name}</h3>
                      <span
                        className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border mt-1 ${statusStyle.bg}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(room)}
                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingRoom(room)}
                        className="p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="h-4 w-4" />
                      <span>{room.capacity} personas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <WifiIcon className="h-4 w-4" />
                      <span>{room.wifi_ssid || "Sin Wi-Fi"}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {amenities.map((a) => (
                        <span
                          key={a}
                          className="inline-flex px-2 py-0.5 text-[10px] bg-zinc-700 text-gray-300 rounded-md"
                        >
                          {AMENITY_LABELS[a] || a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Create/Edit Modal ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRoom ? "Editar Sala" : "Nueva Sala"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-zinc-800 text-gray-400">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Nombre de la sala
                </label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Sala Focus"
                />
              </div>

              {/* Capacity + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Estado
                  </label>
                  <select
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>
              </div>

              {/* Wi-Fi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Red Wi-Fi
                  </label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500"
                    value={form.wifi_ssid}
                    onChange={(e) => setForm((f) => ({ ...f, wifi_ssid: e.target.value }))}
                    placeholder="SSID"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Contraseña Wi-Fi
                  </label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500"
                    value={form.wifi_pass}
                    onChange={(e) => setForm((f) => ({ ...f, wifi_pass: e.target.value }))}
                    placeholder="Password"
                  />
                </div>
              </div>
              
              {/* TTLock ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  ID de Cerradura TTLock (Opcional)
                </label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                  value={form.ttlock_lock_id}
                  onChange={(e) => setForm((f) => ({ ...f, ttlock_lock_id: e.target.value }))}
                  placeholder="Ej: 12345678"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Amenidades
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        form.amenities.includes(amenity)
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-zinc-800 border-zinc-600 text-gray-400 hover:border-zinc-500"
                      }`}
                    >
                      {form.amenities.includes(amenity) ? (
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                      ) : (
                        <XCircleIcon className="h-3.5 w-3.5" />
                      )}
                      {AMENITY_LABELS[amenity] || amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-700">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.name} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">
                {editingRoom ? "Guardar Cambios" : "Crear Sala"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeletingRoom(null)}>
          <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 text-center">
              <AlertTriangleIcon className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Eliminar Sala</h3>
              <p className="text-sm text-gray-400 mb-1">¿Estás seguro de eliminar</p>
              <p className="text-base font-bold text-white mb-3">{deletingRoom.name}?</p>
              <p className="text-xs text-red-400">
                Se eliminarán los paquetes y tarifas asociados a esta sala.
              </p>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-zinc-700">
              <button onClick={() => setDeletingRoom(null)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700">
                Cancelar
              </button>
              <button
                onClick={async () => { await onDeleteRoom(deletingRoom.id); setDeletingRoom(null); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}