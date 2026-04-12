import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { bookingApi, vehicleApi, type Vehicle } from "../lib/api";
import { MapPin, Car, CreditCard, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/book-slot")({
  component: BookSlotPage,
});

function BookSlotPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = React.useState<any[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = React.useState<string | null>(null);
  const [hours, setHours] = React.useState<number>(2);

  const [error, setError] = React.useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = React.useState<"idle" | "booking" | "success">("idle");

  React.useEffect(() => {
    async function loadData() {
      try {
        const [slotsData, vehiclesData] = await Promise.all([
          bookingApi.getAvailableSlots(),
          vehicleApi.getVehicles(),
        ]);
        setSlots(slotsData.slots);
        setVehicles(vehiclesData.vehicles);
        if (vehiclesData.vehicles.length > 0) {
          setSelectedVehicle(vehiclesData.vehicles[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load booking requirements.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBook = async () => {
    if (!selectedSlot || !selectedVehicle) {
      setError("Please select both a vehicle and a parking slot.");
      return;
    }
    setError(null);
    setBookingStatus("booking");

    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
      
      await bookingApi.createBooking({
        vehicleId: selectedVehicle,
        slotId: selectedSlot,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      
      setBookingStatus("success");
      setTimeout(() => navigate({ to: "/my-bookings" }), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create booking.");
      setBookingStatus("idle");
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--sea-ink-soft)]">Loading availability...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
          Reserve Parking
        </h1>
        <p className="text-[var(--sea-ink-soft)]">
          Find a spot across any floor and book it instantly.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {bookingStatus === "success" && (
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl p-6 text-center space-y-2">
          <div className="flex justify-center mb-4"><CheckCircle2 size={48} /></div>
          <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          <p>Your spot has been reserved. Redirecting you to your bookings...</p>
        </div>
      )}

      {bookingStatus === "idle" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="dashboard-card p-6">
              <h2 className="text-lg font-bold text-[var(--sea-ink)] mb-4 flex items-center gap-2">
                <MapPin className="text-indigo-500" /> Select Available Spot
              </h2>
              {slots.length === 0 ? (
                <p className="text-[var(--sea-ink-soft)] text-sm">No spots are currently available.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSlot === slot.id
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_2px_rgba(79,70,229,0.2)]"
                          : "border-[var(--line)] hover:border-indigo-500/50 bg-[var(--surface)]"
                      }`}
                    >
                      <div className="text-lg font-bold text-[var(--sea-ink)]">{slot.slotCode}</div>
                      <div className="text-xs text-[var(--sea-ink-soft)] mt-1 truncate">
                        Floor {slot.floor.level} ({slot.floor.parkingLot.name})
                      </div>
                      <div className="text-xs mt-2 uppercase font-semibold text-indigo-500/80">
                        {slot.slotType}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 h-fit sticky top-6">
            <div className="dashboard-card p-6">
              <h2 className="text-lg font-bold text-[var(--sea-ink)] mb-4 flex items-center gap-2">
                <Car className="text-cyan-500" /> Select Vehicle
              </h2>
              {vehicles.length === 0 ? (
                <p className="text-[var(--sea-ink-soft)] text-sm mb-4">You have no registered vehicles.</p>
              ) : (
                <select 
                  className="w-full bg-[var(--surface-strong)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-[var(--sea-ink)] appearance-none outline-none focus:border-indigo-500 transition-colors"
                  value={selectedVehicle || ""}
                  onChange={e => setSelectedVehicle(e.target.value)}
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.licensePlate} {v.model ? `(${v.model})` : ""}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="dashboard-card p-6">
               <h2 className="text-lg font-bold text-[var(--sea-ink)] mb-4">Session Duration</h2>
               <div className="flex items-center justify-between bg-[var(--surface-strong)] border border-[var(--line)] rounded-xl p-2">
                 <button onClick={() => setHours(Math.max(1, hours - 1))} className="px-4 py-2 hover:bg-[var(--line)] rounded-lg text-[var(--sea-ink)] font-bold">-</button>
                 <span className="text-[var(--sea-ink)] font-medium">{hours} Hours</span>
                 <button onClick={() => setHours(hours + 1)} className="px-4 py-2 hover:bg-[var(--line)] rounded-lg text-[var(--sea-ink)] font-bold">+</button>
               </div>
               
               <div className="mt-6 flex justify-between items-center border-t border-[var(--line)] pt-4">
                 <span className="text-[var(--sea-ink-soft)]">Total Estimate</span>
                 <span className="text-xl font-bold text-[var(--sea-ink)]">${(hours * 5).toFixed(2)}</span>
               </div>
               
               <button
                  onClick={handleBook}
                  disabled={!selectedSlot || !selectedVehicle || bookingStatus !== "idle"}
                  className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  <CreditCard size={18} /> Book & Go to Payment
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
