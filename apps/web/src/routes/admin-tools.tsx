import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Building2,
  Layers,
  MapPin,
  Plus,
  Settings,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { adminApi } from "../lib/api";

export const Route = createFileRoute("/admin-tools")({
  component: AdminToolsComponent,
});

type ResourceType = "floor" | "slot" | "parking-lot";

function AdminToolsComponent() {
  // ── Delete state ──────────────────────────────────────────────────────────
  const [targetId, setTargetId] = React.useState("");
  const [resourceType, setResourceType] =
    React.useState<ResourceType>("floor");
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteMessage, setDeleteMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Create Lot state ──────────────────────────────────────────────────────
  const [lotName, setLotName] = React.useState("");
  const [lotAddress, setLotAddress] = React.useState("");
  const [lotLoading, setLotLoading] = React.useState(false);
  const [lotMessage, setLotMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Create Floor state ────────────────────────────────────────────────────
  const [floorName, setFloorName] = React.useState("");
  const [floorLoading, setFloorLoading] = React.useState(false);
  const [floorMessage, setFloorMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Create Slot state ─────────────────────────────────────────────────────
  const [slotCode, setSlotCode] = React.useState("");
  const [slotFloorId, setSlotFloorId] = React.useState("");
  const [slotType, setSlotType] = React.useState<
    "standard" | "compact" | "handicapped" | "ev_charging"
  >("standard");
  const [slotLoading, setSlotLoading] = React.useState(false);
  const [slotMessage, setSlotMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) return;
    if (
      !confirm(
        `WARNING: Permanently delete ${resourceType} "${targetId}". Proceed?`,
      )
    )
      return;

    try {
      setDeleteLoading(true);
      setDeleteMessage(null);
      if (resourceType === "floor") await adminApi.deleteFloor(targetId.trim());
      else if (resourceType === "slot")
        await adminApi.deleteSlot(targetId.trim());
      else await adminApi.deleteParkingLot(targetId.trim());

      setDeleteMessage({
        type: "success",
        text: `Deleted ${resourceType} "${targetId}" successfully`,
      });
      setTargetId("");
    } catch (err: any) {
      setDeleteMessage({
        type: "error",
        text: err.message || `Failed to delete ${resourceType}`,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLotLoading(true);
      setLotMessage(null);
      const res = await adminApi.createParkingLot({
        name: lotName.trim(),
        address: lotAddress.trim(),
      });
      setLotMessage({
        type: "success",
        text: `Created parking lot "${res.parkingLot?.name ?? lotName}"`,
      });
      setLotName("");
      setLotAddress("");
    } catch (err: any) {
      setLotMessage({
        type: "error",
        text: err.message || "Failed to create parking lot",
      });
    } finally {
      setLotLoading(false);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFloorLoading(true);
      setFloorMessage(null);
      const res = await adminApi.createFloor({ name: floorName.trim() });
      setFloorMessage({
        type: "success",
        text: `Created floor "${res.floor?.name ?? floorName}"`,
      });
      setFloorName("");
    } catch (err: any) {
      setFloorMessage({
        type: "error",
        text: err.message || "Failed to create floor",
      });
    } finally {
      setFloorLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSlotLoading(true);
      setSlotMessage(null);
      const res = await adminApi.createSlot({
        slotCode: slotCode.trim(),
        floorId: slotFloorId.trim(),
        slotType,
        status: "available",
      });
      setSlotMessage({
        type: "success",
        text: `Created slot "${res.slot?.slotCode ?? slotCode}"`,
      });
      setSlotCode("");
      setSlotFloorId("");
    } catch (err: any) {
      setSlotMessage({
        type: "error",
        text: err.message || "Failed to create slot",
      });
    } finally {
      setSlotLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-[var(--link-bg-hover)] text-[var(--sea-ink)]">
          <Settings size={22} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
              Admin Tools
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Restricted
            </span>
          </div>
          <p className="text-[var(--sea-ink-soft)] mt-1">
            Low-level system management. Create or permanently delete
            infrastructure resources.
          </p>
        </div>
      </div>

      {/* ── CREATE SECTION ─────────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-lg font-bold text-[var(--sea-ink)] flex items-center gap-2">
          <Plus size={18} className="text-indigo-500" /> Create Resources
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Create Parking Lot */}
          <div className="dashboard-card p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Building2 size={16} />
              </div>
              <h3 className="font-semibold text-[var(--sea-ink)] text-sm">
                New Parking Lot
              </h3>
            </div>
            {lotMessage && (
              <p
                className={`text-xs font-medium px-3 py-2 rounded-lg border ${lotMessage.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
              >
                {lotMessage.text}
              </p>
            )}
            <form onSubmit={handleCreateLot} className="space-y-3">
              <AdminInput
                id="admin-lot-name"
                placeholder="Lot name"
                value={lotName}
                onChange={setLotName}
                required
              />
              <AdminInput
                id="admin-lot-address"
                placeholder="Address"
                value={lotAddress}
                onChange={setLotAddress}
                required
              />
              <AdminBtn
                id="admin-create-lot"
                loading={lotLoading}
                label="Create Lot"
                color="indigo"
              />
            </form>
          </div>

          {/* Create Floor */}
          <div className="dashboard-card p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                <Layers size={16} />
              </div>
              <h3 className="font-semibold text-[var(--sea-ink)] text-sm">
                New Floor
              </h3>
            </div>
            {floorMessage && (
              <p
                className={`text-xs font-medium px-3 py-2 rounded-lg border ${floorMessage.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
              >
                {floorMessage.text}
              </p>
            )}
            <form onSubmit={handleCreateFloor} className="space-y-3">
              <AdminInput
                id="admin-floor-name"
                placeholder="Floor name, e.g. Ground Floor"
                value={floorName}
                onChange={setFloorName}
                required
              />
              <AdminBtn
                id="admin-create-floor"
                loading={floorLoading}
                label="Create Floor"
                color="cyan"
              />
            </form>
          </div>

          {/* Create Slot */}
          <div className="dashboard-card p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <MapPin size={16} />
              </div>
              <h3 className="font-semibold text-[var(--sea-ink)] text-sm">
                New Slot
              </h3>
            </div>
            {slotMessage && (
              <p
                className={`text-xs font-medium px-3 py-2 rounded-lg border ${slotMessage.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
              >
                {slotMessage.text}
              </p>
            )}
            <form onSubmit={handleCreateSlot} className="space-y-3">
              <AdminInput
                id="admin-slot-code"
                placeholder="Slot code, e.g. DT-G-01"
                value={slotCode}
                onChange={setSlotCode}
                required
              />
              <AdminInput
                id="admin-slot-floor-id"
                placeholder="Floor UUID"
                value={slotFloorId}
                onChange={setSlotFloorId}
                required
              />
              <select
                id="admin-slot-type"
                value={slotType}
                onChange={(e) =>
                  setSlotType(
                    e.target.value as
                      | "standard"
                      | "compact"
                      | "handicapped"
                      | "ev_charging",
                  )
                }
                className="w-full px-3 py-2 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="standard">Standard</option>
                <option value="compact">Compact</option>
                <option value="handicapped">Handicapped</option>
                <option value="ev_charging">EV Charging</option>
              </select>
              <AdminBtn
                id="admin-create-slot"
                loading={slotLoading}
                label="Create Slot"
                color="emerald"
              />
            </form>
          </div>
        </div>
      </section>

      {/* ── DELETE SECTION ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--sea-ink)] flex items-center gap-2 mb-5">
          <Trash2 size={18} className="text-red-500" /> Delete Resources
        </h2>

        <div className="dashboard-card border-red-500/10 overflow-hidden">
          <div className="bg-red-500/5 border-b border-red-500/10 p-5 flex gap-4 items-start">
            <div className="p-2 text-red-500 bg-red-500/10 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--sea-ink)] mb-1">
                Danger Zone
              </h3>
              <p className="text-[var(--sea-ink-soft)] text-sm">
                Drop resources by ID. This action is irreversible — ensure no
                active bookings depend on the resource.
              </p>
            </div>
          </div>

          <div className="p-6">
            {deleteMessage && (
              <div
                className={`mb-5 p-4 rounded-xl text-sm font-medium border ${deleteMessage.type === "error" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
              >
                {deleteMessage.text}
              </div>
            )}

            <form onSubmit={handleDelete} className="space-y-5 max-w-md">
              {/* Resource type toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--sea-ink)]">
                  Resource Type
                </label>
                <div className="flex bg-[var(--link-bg-hover)] border border-[var(--line)] p-1 rounded-xl">
                  {(["floor", "slot", "parking-lot"] as ResourceType[]).map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        id={`delete-type-${t}`}
                        onClick={() => setResourceType(t)}
                        className={`flex-1 text-sm font-medium py-2 rounded-lg capitalize transition-colors ${
                          resourceType === t
                            ? "bg-[var(--surface)] text-[var(--sea-ink)] shadow-sm border border-[var(--line)]"
                            : "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
                        }`}
                      >
                        {t.replace("-", " ")}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--sea-ink)]">
                  Resource ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-delete-id"
                  type="text"
                  required
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-all"
                />
              </div>

              <button
                id="admin-delete-submit"
                type="submit"
                disabled={deleteLoading || !targetId.trim()}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(239,68,68,0.3)]"
              >
                <Trash2 className="w-4 h-4" />
                {deleteLoading ? "Deleting…" : "Force Delete"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Shared mini-components ────────────────────────────────────────────────────
function AdminInput({
  id,
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-[var(--sea-ink-soft)]"
    />
  );
}

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_14px_rgba(79,70,229,0.3)]",
  cyan: "bg-cyan-600 hover:bg-cyan-500 shadow-[0_4px_14px_rgba(6,182,212,0.3)]",
  emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_14px_rgba(5,150,105,0.3)]",
};

function AdminBtn({
  id,
  loading,
  label,
  color,
}: {
  id: string;
  loading: boolean;
  label: string;
  color: string;
}) {
  return (
    <button
      id={id}
      type="submit"
      disabled={loading}
      className={`w-full py-2 text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm ${COLOR_MAP[color] ?? COLOR_MAP.indigo}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
      ) : (
        <Plus size={14} />
      )}
      {loading ? "Creating…" : label}
    </button>
  );
}
