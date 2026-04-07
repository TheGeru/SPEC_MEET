/**
 * PackagesTab — Presentational Component
 *
 * US-08-A: Full CRUD for PricePackage
 * - List with search/filter
 * - Create/Edit modal with conditional fields per billingUnit
 * - Toggle active/inactive
 * - Delete with confirmation
 * - Live price preview from RoomBaseRate
 *
 * This is the most complex tab. Each scenario from US-08-A Gherkin is covered.
 */

import { useState } from "react";
import {
  PlusIcon, TrashIcon, SearchIcon, PencilIcon, XIcon,
  FilterIcon, ToggleLeftIcon, ToggleRightIcon, AlertTriangleIcon,
  ChevronDownIcon, ClockIcon, PackageIcon,
} from "lucide-react";
import type {
  PricePackageData, PricePackagePayload, PackageMetadata,
  RoomBaseRateData, RoomSummary, ScheduleOption, BillingUnit,
} from "../models";
import {
  BILLING_LABELS, BILLING_STYLES, BILLING_UNIT,
  SCHEDULE_DOT_COLORS, needsDiscount, needsSchedule,
  fmtCurrency, fmtTime, computePrice,
} from "../models";

interface PackagesTabProps {
  packages: PricePackageData[];
  rates: RoomBaseRateData[];
  rooms: RoomSummary[];
  onSave: (id: string | null, payload: PricePackagePayload) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ─── Form state type ──────────────────────────────────────────

interface PkgFormData {
  name: string;
  description: string;
  billingUnit: BillingUnit;
  minDuration: string;
  maxDuration: string;
  discountPct: string;
  blockHours: string;
  roomId: string;
  isActive: boolean;
  bulkEligible: boolean;
  scheduleOptions: ScheduleOption[];
}

const EMPTY_FORM: PkgFormData = {
  name: "", description: "", billingUnit: BILLING_UNIT.HOUR,
  minDuration: "60", maxDuration: "", discountPct: "0", blockHours: "",
  roomId: "", isActive: true, bulkEligible: false, scheduleOptions: [],
};

const toFormData = (p: PricePackageData): PkgFormData => ({
  name: p.name,
  description: p.description || "",
  billingUnit: p.billingUnit,
  minDuration: p.minDuration ? (p.minDuration / 60).toString() : "",
  maxDuration: p.maxDuration ? (p.maxDuration / 60).toString() : "",
  discountPct: (p.metadata.discountPct ?? 0).toString(),
  blockHours: (p.metadata.blockHours ?? "").toString(),
  roomId: p.roomId || "",
  isActive: p.isActive,
  bulkEligible: p.metadata.bulkEligible ?? false,
  scheduleOptions: p.metadata.schedule?.options || [],
});

// ─── Helper: get active rate for a room ───────────────────────

const getActiveRate = (roomId: string | null, rates: RoomBaseRateData[]): number => {
  if (!roomId) return 0;
  return rates.find((r) => r.roomId === roomId && !r.effectiveUntil)?.hourlyRate ?? 0;
};

// ─── Styles ───────────────────────────────────────────────────

const inputClass = "w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

// ═══════════════════════════════════════════════════════════════

export default function PackagesTab({
  packages, rates, rooms, onSave, onToggle, onDelete,
}: PackagesTabProps) {
  const [search, setSearch] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterBilling, setFilterBilling] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PricePackageData | null>(null);
  const [form, setForm] = useState<PkgFormData>(EMPTY_FORM);
  const [deletingPkg, setDeletingPkg] = useState<PricePackageData | null>(null);

  // ── Handlers ──────────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_FORM); setEditingPkg(null); setShowModal(true); };
  const openEdit = (pkg: PricePackageData) => { setForm(toFormData(pkg)); setEditingPkg(pkg); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingPkg(null); };
  const setField = (key: keyof PkgFormData, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const buildMetadata = (): PackageMetadata => {
    if (form.billingUnit === BILLING_UNIT.HOUR) return {};
    if (form.billingUnit === BILLING_UNIT.CUSTOM) return editingPkg?.metadata || {};
    const meta: PackageMetadata = { discountPct: parseFloat(form.discountPct) || 0 };
    if (form.blockHours) meta.blockHours = parseFloat(form.blockHours);
    if (form.bulkEligible) meta.bulkEligible = true;
    if (form.scheduleOptions.length > 0) {
      meta.schedule = { type: "fixed_blocks", options: form.scheduleOptions };
    }
    return meta;
  };

  const handleSave = async () => {
    const payload: PricePackagePayload = {
      name: form.name,
      description: form.description || null,
      billingUnit: form.billingUnit,
      minDuration: form.minDuration ? Math.round(parseFloat(form.minDuration) * 60) : null,
      maxDuration: form.maxDuration ? Math.round(parseFloat(form.maxDuration) * 60) : null,
      metadata: buildMetadata(),
      roomId: form.roomId ? form.roomId : (rooms.length > 0 ? rooms[0].id : ""),
      isActive: form.isActive,
    };
    await onSave(editingPkg?.id || null, payload);
    closeModal();
  };

  // ── Schedule option helpers ───────────────────────────────
  const addScheduleOption = () => setField("scheduleOptions", [...form.scheduleOptions, { label: "", startTime: "08:00", endTime: "13:30" }]);
  const updateScheduleOption = (i: number, field: keyof ScheduleOption, val: string) => {
    setField("scheduleOptions", form.scheduleOptions.map((opt, idx) => idx === i ? { ...opt, [field]: val } : opt));
  };
  const removeScheduleOption = (i: number) => setField("scheduleOptions", form.scheduleOptions.filter((_, idx) => idx !== i));

  // ── Filtering ─────────────────────────────────────────────
  const filtered = packages.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchRoom = filterRoom === "all" || (filterRoom === "global" ? p.roomId === null : p.roomId === filterRoom);
    const matchBilling = filterBilling === "all" || p.billingUnit === filterBilling;
    return matchSearch && matchRoom && matchBilling;
  });

  const getRoomName = (id: string | null) => id ? rooms.find((r) => r.id === id)?.name || id : "Todas las salas";

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">
      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200 hover:bg-gray-100 shrink-0">
            <FilterIcon className="h-3.5 w-3.5" /> Filtros <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center flex-1 px-3">
            <SearchIcon className="h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar paquetes..." className="w-full bg-transparent border-none px-2 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none" />
          </div>
          <div className="pr-2">
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-gray-900 bg-secondary hover:opacity-70  rounded-md">
              <PlusIcon className="h-4 w-4" /> Nuevo
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sala</label>
              <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700">
                <option value="all">Todas</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                <option value="global">Globales</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select value={filterBilling} onChange={(e) => setFilterBilling(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700">
                <option value="all">Todos</option>
                {Object.entries(BILLING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {(filterRoom !== "all" || filterBilling !== "all" || search) && (
              <button onClick={() => { setFilterRoom("all"); setFilterBilling("all"); setSearch(""); }} className="self-end text-xs text-purple-600 hover:text-purple-800 font-medium py-1.5">Limpiar filtros</button>
            )}
          </div>
        )}
      </div>

      {/* Package list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
          <PackageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No se encontraron paquetes</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
          {filtered.map((pkg) => {
            const rate = getActiveRate(pkg.roomId, rates);
            const disc = pkg.metadata.discountPct ?? 0;
            const hrs = pkg.metadata.blockHours ?? 1;
            const price = computePrice(rate, disc, pkg.billingUnit === BILLING_UNIT.HOUR ? 1 : hrs);
            const schedOpts: ScheduleOption[] = pkg.metadata.schedule?.options || [];

            return (
              <div key={pkg.id} className={`px-4 py-3.5 hover:bg-gray-50/80 transition-colors ${!pkg.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">{pkg.name}</span>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${BILLING_STYLES[pkg.billingUnit]}`}>{BILLING_LABELS[pkg.billingUnit]}</span>
                      {!pkg.isActive && <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">Inactivo</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{getRoomName(pkg.roomId)}</span>
                      {pkg.metadata.blockHours && <span>{pkg.metadata.blockHours}h bloque</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-36">
                    {rate > 0 && pkg.billingUnit !== BILLING_UNIT.CUSTOM ? (
                      <>
                        <div className="text-base font-bold text-gray-900">{fmtCurrency(pkg.billingUnit === BILLING_UNIT.HOUR ? rate : price.total)}</div>
                        {disc > 0 && <div className="text-[11px] text-emerald-600 font-medium">-{disc}% · {fmtCurrency(price.effective)}/hr</div>}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">{pkg.billingUnit === BILLING_UNIT.CUSTOM ? "Programa especial" : "Sin tarifa"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onToggle(pkg.id, !pkg.isActive)} className="p-1.5 rounded-md text-gray-400 hover:text-yellow-700 hover:bg-yellow-50">
                      {pkg.isActive ? <ToggleRightIcon className="h-4 w-4 text-yellow-700" /> : <ToggleLeftIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEdit(pkg)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeletingPkg(pkg)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {schedOpts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {schedOpts.map((opt, i) => (
                      <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${SCHEDULE_DOT_COLORS[i % SCHEDULE_DOT_COLORS.length]}`} />
                        <span className="font-semibold text-gray-700">{opt.label}</span>
                        <span className="text-gray-400">{fmtTime(opt.startTime)} – {fmtTime(opt.endTime)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Create/Edit Modal ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{editingPkg ? "Editar Paquete" : "Nuevo Paquete"}</h3>
              <button onClick={closeModal} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><XIcon className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input className={inputClass} value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ej: Plan Medio Día" />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipo de facturación</label>
                  <select className={inputClass} value={form.billingUnit} onChange={(e) => setField("billingUnit", e.target.value)}>
                    {Object.entries(BILLING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sala</label>
                  <select 
                  className={inputClass} 
                  value={form.roomId || (rooms.length > 0 ? rooms[0].id : "")} 
                  onChange={(e) => setField("roomId", e.target.value)}
                >
                  {rooms.length === 0 && <option value="" disabled>Crea una sala primero</option>}
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Duración mín (horas)</label>
                  <input type="number" step="0.5" className={inputClass} value={form.minDuration} onChange={(e) => setField("minDuration", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Duración máx (horas)</label>
                  <input type="number" step="0.5" className={inputClass} value={form.maxDuration} onChange={(e) => setField("maxDuration", e.target.value)} />
                </div>
              </div>

              {/* Conditional: Discount */}
              {needsDiscount(form.billingUnit) && (
                <>
                  <div className="border-t border-gray-200 pt-4"><p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Configuración de Descuento</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>% Descuento</label><input type="number" min="0" max="100" className={inputClass} value={form.discountPct} onChange={(e) => setField("discountPct", e.target.value)} /></div>
                    <div><label className={labelClass}>Horas del bloque</label><input type="number" step="0.5" className={inputClass} value={form.blockHours} onChange={(e) => setField("blockHours", e.target.value)} /></div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.bulkEligible} onChange={(e) => setField("bulkEligible", e.target.checked)} className="rounded border-gray-300 text-purple-600" />
                    <span className="text-sm text-gray-700">Elegible para Cliente Frecuente</span>
                  </label>
                </>
              )}

              {/* Conditional: Schedule blocks */}
              {needsSchedule(form.billingUnit) && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-accent uppercase tracking-wider">Bloques de Horario</p>
                      <button type="button" onClick={addScheduleOption} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium  bg-accent hover:bg-accent/70 text-white rounded-md">
                        <PlusIcon className="h-3 w-3" /> Agregar
                      </button>
                    </div>
                    {form.scheduleOptions.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Sin bloques configurados</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {form.scheduleOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 border text-gray-400 border-gray-200 rounded-lg p-3">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${SCHEDULE_DOT_COLORS[i % SCHEDULE_DOT_COLORS.length]}`} />
                          <input type="text" value={opt.label} onChange={(e) => updateScheduleOption(i, "label", e.target.value)} placeholder="Ej: Mañana" className="bg-white border border-gray-300 rounded-md px-2.5 py-1.5 text-sm w-28" />
                          <input type="time" value={opt.startTime} onChange={(e) => updateScheduleOption(i, "startTime", e.target.value)} className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
                          <span className="text-gray-400 text-sm">–</span>
                          <input type="time" value={opt.endTime} onChange={(e) => updateScheduleOption(i, "endTime", e.target.value)} className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
                          <button onClick={() => removeScheduleOption(i)} className="p-1 rounded-md text-gray-400 hover:text-red-500 ml-auto"><TrashIcon className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Hourly info */}
              {form.billingUnit === BILLING_UNIT.HOUR && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Este paquete usa la tarifa base directamente, sin descuento ni horario fijo.</p>
                </div>
              )}

              {/* Price preview */}
              {form.roomId && getActiveRate(form.roomId, rates) > 0 && needsDiscount(form.billingUnit) && (() => {
                const hr = getActiveRate(form.roomId, rates);
                const d = parseFloat(form.discountPct) || 0;
                const bh = parseFloat(form.blockHours) || 1;
                const cp = computePrice(hr, d, bh);
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2">Vista previa de precio</p>
                    <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                      <span className="text-gray-500">Tarifa base</span><span className="text-right text-gray-500 font-semibold">{fmtCurrency(hr)}/hr</span>
                      <span className="text-gray-500">Descuento</span><span className="text-right text-gray-500 font-semibold">{d}%</span>
                      <span className="text-gray-500">Efectivo/hr</span><span className="text-right font-semibold text-emerald-600">{fmtCurrency(cp.effective)}</span>
                      <span className="text-gray-900 font-semibold border-t border-purple-200 pt-1.5">Total</span>
                      <span className="text-right text-lg font-bold text-gray-900 border-t border-purple-200 pt-1.5">{fmtCurrency(cp.total)}</span>
                      <span className="text-gray-500">Ahorro</span><span className="text-right font-semibold text-emerald-600">{fmtCurrency(cp.savings)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name} className="px-4 py-2 text-sm font-medium text-gray-900 bg-secondary hover:opacity-70 rounded-md  disabled:opacity-50">{editingPkg ? "Guardar Cambios" : "Crear Paquete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDeletingPkg(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 text-center">
              <AlertTriangleIcon className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Eliminar Paquete</h3>
              <p className="text-sm text-gray-500 mb-1">¿Estás seguro de eliminar</p>
              <p className="text-base font-bold text-gray-900 mb-3">{deletingPkg.name}?</p>
              <p className="text-xs text-red-500">Las reservaciones existentes no se verán afectadas.</p>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <button onClick={() => setDeletingPkg(null)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => { await onDelete(deletingPkg.id); setDeletingPkg(null); }} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}