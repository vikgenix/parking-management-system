import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Car, Plus, RefreshCw, Trash2 } from "lucide-react";
import { vehicleApi } from "../lib/api";
import type { Vehicle } from "../lib/api";

export const Route = createFileRoute("/vehicles")({
  component: VehiclesComponent,
});

function VehiclesComponent() {
  const [vehicles, setVehicles] = React.useState<Array<Vehicle>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [licensePlate, setLicensePlate] = React.useState("");
  const [model, setModel] = React.useState("");
  const [registering, setRegistering] = React.useState(false);
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = React.useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const { vehicles: data } = await vehicleApi.getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVehicles();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) return;
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      setRegistering(true);
      const res = await vehicleApi.registerVehicle({
        licencePlate: licensePlate.trim(),
        model: model.trim() || undefined,
      });
      setRegisterSuccess(
        `Vehicle "${res.vehicle?.licensePlate ?? licensePlate}" registered successfully`,
      );
      setLicensePlate("");
      setModel("");
      await fetchVehicles();
    } catch (err: any) {
      setRegisterError(err.message || "Failed to register vehicle");
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (vehicleId: string, plate: string) => {
    if (!confirm(`Delete vehicle "${plate}"? This cannot be undone.`)) return;
    try {
      await vehicleApi.deleteVehicle(vehicleId);
      await fetchVehicles();
    } catch (err: any) {
      alert(err.message || "Failed to delete vehicle");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
            My Vehicles
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            Register and manage vehicles for parking access.
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] font-medium rounded-xl shadow-sm hover:border-indigo-500/30 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Registration Form ──────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="dashboard-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Car size={18} />
              </div>
              <div>
                <h2 className="font-bold text-[var(--sea-ink)]">Add Vehicle</h2>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  Register a new vehicle to your account
                </p>
              </div>
            </div>

            {registerError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3">
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl px-4 py-3">
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--sea-ink)]">
                  Licence Plate <span className="text-red-500">*</span>
                </label>
                <input
                  id="vehicle-plate"
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. ABC-1234"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-[var(--sea-ink-soft)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--sea-ink)]">
                  Model{" "}
                  <span className="text-[var(--sea-ink-soft)] font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="vehicle-model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Tesla Model 3"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-[var(--sea-ink-soft)]"
                />
              </div>

              <button
                id="vehicle-register-submit"
                type="submit"
                disabled={registering}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registering ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Plus size={16} />
                )}
                {registering ? "Registering…" : "Add Vehicle"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Vehicles List ──────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 text-sm mb-5">
              {error}
            </div>
          )}

          {loading ? (
            <div className="dashboard-card flex justify-center items-center p-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="dashboard-card flex flex-col items-center justify-center p-16 text-center min-h-[300px]">
              <div className="p-5 bg-[var(--link-bg-hover)] text-[var(--sea-ink-soft)] rounded-full mb-4">
                <Car size={32} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--sea-ink)] mb-1">
                No vehicles yet
              </h3>
              <p className="text-[var(--sea-ink-soft)] text-sm max-w-xs">
                Register your first vehicle using the form to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onDelete={() => handleDelete(v.id, v.licensePlate)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Vehicle Card ──────────────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  onDelete,
}: {
  vehicle: Vehicle;
  onDelete: () => void;
}) {
  return (
    <div className="dashboard-card p-5 group flex flex-col gap-4 hover:border-indigo-500/30">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Car size={18} />
          </div>
          <div>
            <p className="font-mono font-bold text-[var(--sea-ink)] tracking-wider text-sm">
              {vehicle.licensePlate}
            </p>
            <p className="text-[var(--sea-ink-soft)] text-xs mt-0.5">
              {vehicle.model || "Unknown model"}
            </p>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-[var(--sea-ink-soft)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Delete vehicle"
          id={`delete-vehicle-${vehicle.id}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
        <span className="text-xs text-[var(--sea-ink-soft)] font-mono">
          ID: {vehicle.id.slice(0, 12)}…
        </span>
        <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full font-semibold">
          Active
        </span>
      </div>
    </div>
  );
}
