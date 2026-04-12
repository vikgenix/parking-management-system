import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Layers,
  MapPin,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { adminApi } from "../lib/api";

export const Route = createFileRoute("/parking-management")({
  component: ParkingManagementPage,
});

// ── Types ─────────────────────────────────────────────────────────────────────
type SlotType = "standard" | "compact" | "handicapped" | "ev_charging";
type SlotStatus = "available" | "reserved" | "occupied" | "inactive";

const SLOT_TYPE_ICONS: Record<SlotType, string> = {
  standard: "🚗",
  compact: "🚙",
  handicapped: "♿",
  ev_charging: "⚡",
};

const SLOT_TYPE_COLORS: Record<SlotType, string> = {
  standard: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  compact: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  handicapped: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ev_charging: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

// ── Tab config ─────────────────────────────────────────────────────────────────
type Tab = "parking-lot" | "floor" | "slot";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "parking-lot", label: "Parking Lots", icon: <Building2 size={16} /> },
  { id: "floor", label: "Floors", icon: <Layers size={16} /> },
  { id: "slot", label: "Slots", icon: <MapPin size={16} /> },
];

// ── Helper ────────────────────────────────────────────────────────────────────
function Toast({
  msg,
  onClose,
}: {
  msg: { type: "success" | "error"; text: string } | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
        msg.type === "success"
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
          : "bg-red-500/10 text-red-500 border-red-500/25"
      }`}
    >
      {msg.type === "success" ? "✅" : "❌"} {msg.text}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--sea-ink)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-[var(--sea-ink-soft)]"
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function ParkingManagementPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("parking-lot");
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) =>
    setToast({ type, text });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Toast msg={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
          Parking Management
        </h1>
        <p className="text-[var(--sea-ink-soft)]">
          Create and manage parking lots, floors, and individual slots.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--link-bg-hover)] p-1 rounded-2xl border border-[var(--line)] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[var(--surface)] text-[var(--sea-ink)] shadow-sm border border-[var(--line)]"
                : "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeTab === "parking-lot" && (
          <ParkingLotPanel showToast={showToast} />
        )}
        {activeTab === "floor" && <FloorPanel showToast={showToast} />}
        {activeTab === "slot" && <SlotPanel showToast={showToast} />}
      </div>
    </div>
  );
}

// ── Parking Lot Panel ──────────────────────────────────────────────────────────
function ParkingLotPanel({
  showToast,
}: {
  showToast: (t: "success" | "error", m: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [deleteId, setDeleteId] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await adminApi.createParkingLot({ name: name.trim(), address: address.trim() });
      showToast("success", `Created parking lot "${res.parkingLot?.name ?? name}"`);
      setName("");
      setAddress("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to create parking lot");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId.trim()) return;
    if (!confirm(`Delete parking lot ${deleteId}? This is permanent.`)) return;
    try {
      setDeleting(true);
      await adminApi.deleteParkingLot(deleteId.trim());
      showToast("success", "Parking lot deleted successfully");
      setDeleteId("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete parking lot");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Create */}
      <div className="dashboard-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--sea-ink)]">
              Create Parking Lot
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Add a new physical parking facility
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <InputField
            id="lot-name"
            label="Lot Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Downtown Parking"
            required
          />
          <InputField
            id="lot-address"
            label="Address"
            value={address}
            onChange={setAddress}
            placeholder="e.g. 1 Main Street, Downtown"
            required
          />
          <button
            id="create-lot-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {loading ? "Creating…" : "Create Parking Lot"}
          </button>
        </form>
      </div>

      {/* Delete */}
      <div className="dashboard-card p-6 space-y-5 border-red-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--sea-ink)]">
              Delete Parking Lot
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Permanently remove a lot by ID
            </p>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-4">
          <InputField
            id="lot-delete-id"
            label="Parking Lot ID"
            value={deleteId}
            onChange={setDeleteId}
            placeholder="UUID"
            required
          />
          <button
            id="delete-lot-submit"
            type="submit"
            disabled={deleting || !deleteId.trim()}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting…" : "Delete Parking Lot"}
          </button>
        </form>
      </div>
    </>
  );
}

// ── Floor Panel ────────────────────────────────────────────────────────────────
function FloorPanel({
  showToast,
}: {
  showToast: (t: "success" | "error", m: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [deleteId, setDeleteId] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await adminApi.createFloor({ name: name.trim() });
      showToast("success", `Created floor "${res.floor?.name ?? name}"`);
      setName("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to create floor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId.trim()) return;
    if (!confirm(`Delete floor ${deleteId}? This is permanent.`)) return;
    try {
      setDeleting(true);
      await adminApi.deleteFloor(deleteId.trim());
      showToast("success", "Floor deleted successfully");
      setDeleteId("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete floor");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Create */}
      <div className="dashboard-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--sea-ink)]">Create Floor</h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Add a new floor to a parking lot
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <InputField
            id="floor-name"
            label="Floor Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Ground Floor"
            required
          />
          <button
            id="create-floor-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.3)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {loading ? "Creating…" : "Create Floor"}
          </button>
        </form>
      </div>

      {/* Delete */}
      <div className="dashboard-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--sea-ink)]">Delete Floor</h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Permanently remove a floor by ID
            </p>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-4">
          <InputField
            id="floor-delete-id"
            label="Floor ID"
            value={deleteId}
            onChange={setDeleteId}
            placeholder="UUID"
            required
          />
          <button
            id="delete-floor-submit"
            type="submit"
            disabled={deleting || !deleteId.trim()}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting…" : "Delete Floor"}
          </button>
        </form>
      </div>
    </>
  );
}

// ── Slot Panel ─────────────────────────────────────────────────────────────────
function SlotPanel({
  showToast,
}: {
  showToast: (t: "success" | "error", m: string) => void;
}) {
  const [slotCode, setSlotCode] = React.useState("");
  const [floorId, setFloorId] = React.useState("");
  const [slotType, setSlotType] = React.useState<SlotType>("standard");
  const [slotStatus, setSlotStatus] = React.useState<SlotStatus>("available");
  const [loading, setLoading] = React.useState(false);

  const [deleteId, setDeleteId] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await adminApi.createSlot({
        slotCode: slotCode.trim(),
        floorId: floorId.trim(),
        slotType,
        status: slotStatus,
      });
      showToast("success", `Created slot "${res.slot?.slotCode ?? slotCode}"`);
      setSlotCode("");
      setFloorId("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId.trim()) return;
    if (!confirm(`Delete slot ${deleteId}? This is permanent.`)) return;
    try {
      setDeleting(true);
      await adminApi.deleteSlot(deleteId.trim());
      showToast("success", "Slot deleted successfully");
      setDeleteId("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete slot");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Create */}
      <div className="dashboard-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--sea-ink)]">Create Slot</h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Add an individual parking slot to a floor
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <InputField
            id="slot-code"
            label="Slot Code"
            value={slotCode}
            onChange={setSlotCode}
            placeholder="e.g. DT-G-01"
            required
          />
          <InputField
            id="slot-floor-id"
            label="Floor ID"
            value={floorId}
            onChange={setFloorId}
            placeholder="UUID of the floor"
            required
          />

          {/* Slot Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sea-ink)]">
              Slot Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  "standard",
                  "compact",
                  "handicapped",
                  "ev_charging",
                ] as SlotType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  id={`slot-type-${type}`}
                  onClick={() => setSlotType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 capitalize ${
                    slotType === type
                      ? `${SLOT_TYPE_COLORS[type]} border`
                      : "border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-indigo-500/30 bg-[var(--link-bg-hover)]"
                  }`}
                >
                  <span>{SLOT_TYPE_ICONS[type]}</span>
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Slot Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sea-ink)]">
              Initial Status
            </label>
            <select
              id="slot-status"
              value={slotStatus}
              onChange={(e) => setSlotStatus(e.target.value as SlotStatus)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            id="create-slot-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {loading ? "Creating…" : "Create Slot"}
          </button>
        </form>
      </div>

      {/* Delete */}
      <div className="dashboard-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--sea-ink)]">Delete Slot</h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Permanently remove a slot by ID
            </p>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-4">
          <InputField
            id="slot-delete-id"
            label="Slot ID"
            value={deleteId}
            onChange={setDeleteId}
            placeholder="UUID"
            required
          />
          <button
            id="delete-slot-submit"
            type="submit"
            disabled={deleting || !deleteId.trim()}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting…" : "Delete Slot"}
          </button>
        </form>
      </div>
    </>
  );
}
