import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Banknote,
  CarFront,
  CheckCircle2,
  MapPin,
  RefreshCw,
  CalendarCheck,
} from "lucide-react";
import { adminApi, bookingApi, type DashboardStats, type RecentBooking } from "../lib/api";
import { getUser } from "../lib/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: DashboardConfig });

function DashboardConfig() {
  const user = getUser();
  
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }
  
  return <DriverDashboard />;
}

function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [bookings, setBookings] = React.useState<RecentBooking[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingBookings, setLoadingBookings] = React.useState(true);
  const [statsError, setStatsError] = React.useState<string | null>(null);
  const [bookingsError, setBookingsError] = React.useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const { stats: data } = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setStatsError(err.message || "Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingsError(null);
      const { bookings: data } = await adminApi.getRecentBookings(5);
      setBookings(data);
    } catch (err: any) {
      setBookingsError(err.message || "Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    fetchBookings();
  }, []);

  const refresh = () => {
    fetchStats();
    fetchBookings();
  };

  // Capacity percentage: occupied vs total
  const capacity =
    stats && stats.totalSlots > 0
      ? Math.round(
          ((stats.totalSlots - stats.availableSlots) / stats.totalSlots) * 100,
        )
      : 0;
  // SVG ring: r=70 → circumference ≈ 440
  const strokeDashoffset = Math.round(440 - (440 * capacity) / 100);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
            Overview Dashboard
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            Here is what's happening at your parking facilities today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] font-medium rounded-xl shadow-sm hover:border-indigo-500/30 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Error */}
      {statsError && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 text-sm">
          {statsError}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue (Today)"
          value={
            loadingStats
              ? "—"
              : `$${(stats?.totalRevenueToday ?? 0).toFixed(2)}`
          }
          sub={loadingStats ? "Loading…" : undefined}
          icon={<Banknote />}
          color="text-emerald-500"
        />
        <MetricCard
          title="Active Bookings"
          value={loadingStats ? "—" : `${stats?.activeBookings ?? 0}`}
          sub={loadingStats ? "Loading…" : undefined}
          icon={<CheckCircle2 />}
          color="text-indigo-500"
        />
        <MetricCard
          title="Vehicles Parked"
          value={loadingStats ? "—" : `${stats?.vehiclesParked ?? 0}`}
          sub={loadingStats ? "Loading…" : undefined}
          icon={<CarFront />}
          color="text-blue-500"
        />
        <MetricCard
          title="Available Slots"
          value={loadingStats ? "—" : `${stats?.availableSlots ?? 0}`}
          sub={
            loadingStats
              ? "Loading…"
              : stats
                ? `of ${stats.totalSlots} total`
                : undefined
          }
          icon={<MapPin />}
          color="text-cyan-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table (Spans 2 columns) */}
        <div className="lg:col-span-2 dashboard-card p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--sea-ink)]">
              Recent Bookings
            </h2>
            <button className="text-sm font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
              View All <ArrowUpRight size={16} />
            </button>
          </div>

          {bookingsError && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 text-sm mb-4">
              {bookingsError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--sea-ink-soft)]">
              <thead className="border-b border-[var(--line)] uppercase text-xs font-semibold tracking-wider pb-3 block w-full mb-3">
                <tr className="w-full flex justify-between pr-4">
                  <th className="w-1/4 font-semibold">User</th>
                  <th className="w-1/4 font-semibold">Vehicle</th>
                  <th className="w-1/4 font-semibold">Slot</th>
                  <th className="w-1/4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="flex flex-col gap-2">
                {loadingBookings ? (
                  <tr className="w-full">
                    <td className="p-8 flex justify-center w-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr className="w-full">
                    <td className="text-center py-12 text-[var(--sea-ink-soft)] text-sm w-full block">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <TableRow
                      key={b.id}
                      user={b.user.name}
                      plate={b.vehicle.licensePlate}
                      slot={b.slot.slotCode}
                      status={b.status}
                      time={timeAgo(b.createdAt)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facility Status Sidebar */}
        <div className="dashboard-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-[var(--sea-ink)] mb-6">
            Facility Status
          </h2>
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="var(--line)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#4f46e5"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={loadingStats ? 440 : strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--sea-ink)]">
                  {loadingStats ? "—" : `${capacity}%`}
                </span>
                <span className="text-xs font-medium text-[var(--sea-ink-soft)] uppercase tracking-wide">
                  Capacity
                </span>
              </div>
            </div>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-4">
              {loadingStats
                ? "Loading facility data…"
                : stats
                  ? `${stats.availableSlots} of ${stats.totalSlots} slots are currently available.`
                  : "No data available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="dashboard-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--sea-ink-soft)]">
            {title}
          </p>
          <p className="text-2xl font-bold text-[var(--sea-ink)]">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-[var(--link-bg-hover)] ${color}`}>
          {icon}
        </div>
      </div>
      {sub && (
        <p className="text-xs text-[var(--sea-ink-soft)]">{sub}</p>
      )}
    </div>
  );
}

function TableRow({
  user,
  plate,
  slot,
  status,
  time,
}: {
  user: string;
  plate: string;
  slot: string;
  status: string;
  time: string;
}) {
  const statusLabel =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const statusClass =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-500"
      : status === "completed"
        ? "bg-indigo-500/10 text-indigo-500"
        : status === "confirmed"
          ? "bg-blue-500/10 text-blue-500"
          : status === "cancelled" || status === "expired"
            ? "bg-red-500/10 text-red-500"
            : "bg-amber-500/10 text-amber-500";

  return (
    <tr className="w-full flex justify-between items-center bg-[var(--link-bg-hover)] p-3 rounded-xl hover:bg-[var(--line)] transition-colors border border-transparent">
      <td className="w-1/4 font-medium text-[var(--sea-ink)] flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex-shrink-0" />
        <span className="truncate">{user}</span>
      </td>
      <td className="w-1/4 text-[var(--sea-ink-soft)] font-mono text-sm">
        {plate}
      </td>
      <td className="w-1/4 font-medium text-[var(--sea-ink)]">
        <span className="bg-[var(--surface-strong)] px-2 py-1 rounded-md border border-[var(--line)]">
          {slot}
        </span>
      </td>
      <td className="w-1/4 text-right flex flex-col items-end">
        <span
          className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusClass}`}
        >
          {statusLabel}
        </span>
        <span className="text-xs text-[var(--sea-ink-soft)] mt-1">{time}</span>
      </td>
    </tr>
  );
}

// ── Driver Dashboard ──────────────────────────────────────────────────────────
function DriverDashboard() {
  const user = getUser();
  const [stats, setStats] = React.useState({ active: 0, pending: 0, total: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDriverData() {
      try {
        const { bookings } = await bookingApi.getMyBookings();
        setStats({
          active: bookings.filter((b: any) => b.status === "active" || b.status === "confirmed").length,
          pending: bookings.filter((b: any) => b.status === "pending").length,
          total: bookings.length,
        });
      } catch (err) {
        // error handling omitted for brevity on dashboard overview
      } finally {
        setLoading(false);
      }
    }
    loadDriverData();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
          Welcome back, {user?.name.split(" ")[0]}!
        </h1>
        <p className="text-[var(--sea-ink-soft)]">
          Manage your parking reservations and vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Parking"
          value={loading ? "—" : stats.active.toString()}
          icon={<CheckCircle2 />}
          color="text-emerald-500"
        />
        <MetricCard
          title="Pending Payments"
          value={loading ? "—" : stats.pending.toString()}
          icon={<Banknote />}
          color="text-amber-500"
        />
        <MetricCard
          title="Total Bookings"
          value={loading ? "—" : stats.total.toString()}
          icon={<CalendarCheck />}
          color="text-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Quick Action: Book */}
        <div className="dashboard-card p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px] border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 transition-colors">
          <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-500 mb-2">
            <MapPin size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--sea-ink)]">Need a spot?</h2>
          <p className="text-[var(--sea-ink-soft)] max-w-[250px]">
            Find an available parking space and make a new reservation instantly.
          </p>
          <Link
            to="/book-slot"
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all shadow-md active:scale-95"
          >
            Find Parking
          </Link>
        </div>

        {/* Quick Action: Vehicles */}
        <div className="dashboard-card p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]">
          <div className="p-4 bg-cyan-500/10 rounded-full text-cyan-500 mb-2">
            <CarFront size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--sea-ink)]">My Vehicles</h2>
          <p className="text-[var(--sea-ink-soft)] max-w-[250px]">
            Manage your registered license plates to access automated gates.
          </p>
          <Link
            to="/vehicles"
            className="mt-4 px-6 py-2.5 bg-[var(--surface-strong)] text-[var(--sea-ink)] font-semibold rounded-xl hover:bg-[var(--line)] border border-[var(--line)] transition-all shadow-sm active:scale-95"
          >
            Manage Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}
