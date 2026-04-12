import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { bookingApi } from "../lib/api";
import { CalendarCheck, Banknote, Car, MapPin, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payingId, setPayingId] = React.useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getMyBookings();
      setBookings(data.bookings);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchBookings();
  }, []);

  const handlePay = async (bookingId: string) => {
    try {
      setPayingId(bookingId);
      await bookingApi.payBooking(bookingId);
      await fetchBookings(); // Refresh list after payment
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--sea-ink-soft)]">Loading your reservations...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
            My Bookings
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            Manage your past and active parking reservations.
          </p>
        </div>
        <Link
          to="/book-slot"
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <CalendarCheck size={18} /> Book New Spot
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[var(--line)] rounded-full flex items-center justify-center text-[var(--sea-ink-soft)] mb-4">
             <CalendarCheck size={28} />
          </div>
          <h3 className="text-lg font-bold text-[var(--sea-ink)]">No bookings yet</h3>
          <p className="text-sm text-[var(--sea-ink-soft)] mt-2 max-w-sm">
            You haven't made any parking reservations. Let's get you set up with a guaranteed spot!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="dashboard-card p-5 border border-[var(--line)] transition-all hover:border-indigo-500/30 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              
              {/* Left Info */}
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`p-4 rounded-2xl flex items-center justify-center ${b.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {b.status === 'pending' ? <Banknote size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-bold text-[var(--sea-ink)]">Slot {b.slot.slotCode}</span>
                    <span className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      b.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                      b.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                      b.status === "confirmed" ? "bg-blue-500/10 text-blue-500" :
                      "bg-[var(--line)] text-[var(--sea-ink-soft)]"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--sea-ink-soft)]">
                     <span className="flex items-center gap-1"><MapPin size={14}/> {b.slot.floor.parkingLot.name} (Fl. {b.slot.floor.level})</span>
                     <span className="flex items-center gap-1"><Car size={14}/> {b.vehicle.licensePlate}</span>
                  </div>
                  <div className="text-xs text-[var(--sea-ink-soft)] mt-2">
                    {new Date(b.startTime).toLocaleString()} — {new Date(b.endTime).toLocaleString()}
                  </div>
                </div>
              </div>

               {/* Right Actions */}
               <div className="w-full md:w-auto flex justify-end">
                {b.status === "pending" ? (
                  <button
                    onClick={() => handlePay(b.id)}
                    disabled={payingId === b.id}
                    className="w-full md:w-auto px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
                  >
                     {payingId === b.id ? "Processing..." : "Pay $10.00 Invoice"}
                  </button>
                ) : (
                  <div className="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl border border-emerald-500/20 text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Paid
                  </div>
                )}
               </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
