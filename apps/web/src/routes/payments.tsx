import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { adminApi, type DashboardStats, type RecentBooking } from "../lib/api";

export const Route = createFileRoute("/payments")({ component: PaymentsPage });

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  completed: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
  expired: "bg-red-500/10 text-red-500 border border-red-500/20",
};

function PaymentsPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [bookings, setBookings] = React.useState<RecentBooking[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingBookings, setLoadingBookings] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAll = async () => {
    setLoadingStats(true);
    setLoadingBookings(true);
    setError(null);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentBookings(50),
      ]);
      setStats(statsRes.stats);
      setBookings(Array.isArray(bookingsRes.bookings) ? bookingsRes.bookings : []);
    } catch (err: any) {
      setError(err.message || "Failed to load payment data");
    } finally {
      setLoadingStats(false);
      setLoadingBookings(false);
    }
  };

  React.useEffect(() => {
    fetchAll();
  }, []);

  // Separate bookings with payment-relevant statuses
  const paidBookings = bookings.filter((b) =>
    ["completed", "active", "confirmed"].includes(b.status),
  );
  const cancelledBookings = bookings.filter((b) =>
    ["cancelled", "expired"].includes(b.status),
  );

  // Revenue is handled authoritatively by stats.totalRevenueToday

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
            Payments & Revenue
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            Track revenue, payments, and financial overview.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] font-medium rounded-xl shadow-sm hover:border-indigo-500/30 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Revenue Today"
          value={
            loadingStats
              ? "—"
              : formatCurrency(stats?.totalRevenueToday ?? 0)
          }
          icon={<Banknote size={20} />}
          color="text-emerald-500"
          sub="From completed payments"
        />
        <MetricCard
          title="Active Bookings"
          value={loadingStats ? "—" : `${stats?.activeBookings ?? 0}`}
          icon={<CheckCircle2 size={20} />}
          color="text-indigo-500"
          sub="Confirmed + active"
        />
        <MetricCard
          title="Completed Bookings"
          value={loadingBookings ? "—" : `${paidBookings.length}`}
          icon={<CreditCard size={20} />}
          color="text-blue-500"
          sub="Revenue-generating"
        />
        <MetricCard
          title="Cancelled / Expired"
          value={loadingBookings ? "—" : `${cancelledBookings.length}`}
          icon={<TrendingUp size={20} />}
          color="text-red-400"
          sub="Lost revenue"
        />
      </div>

      {/* Revenue Highlight */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--sea-ink)] text-lg">
            Revenue Summary
          </h2>
          <span className="text-xs text-[var(--sea-ink-soft)] bg-[var(--link-bg-hover)] px-3 py-1.5 rounded-full border border-[var(--line)]">
            Today
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Big number */}
          <div className="flex-1">
            <p className="text-5xl font-bold text-[var(--sea-ink)] tracking-tight">
              {loadingStats ? "…" : formatCurrency(stats?.totalRevenueToday ?? 0)}
            </p>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-2">
              Total completed payment revenue today
            </p>
          </div>
          {/* Mini stats */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-[var(--sea-ink-soft)] uppercase tracking-wider">
                Available Slots
              </p>
              <p className="text-2xl font-bold text-cyan-500">
                {loadingStats ? "—" : stats?.availableSlots ?? "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--sea-ink-soft)] uppercase tracking-wider">
                Total Slots
              </p>
              <p className="text-2xl font-bold text-[var(--sea-ink)]">
                {loadingStats ? "—" : stats?.totalSlots ?? "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--sea-ink-soft)] uppercase tracking-wider">
                Vehicles Parked
              </p>
              <p className="text-2xl font-bold text-indigo-500">
                {loadingStats ? "—" : stats?.vehiclesParked ?? "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--sea-ink-soft)] uppercase tracking-wider">
                Occupancy Rate
              </p>
              <p className="text-2xl font-bold text-emerald-500">
                {loadingStats || !stats
                  ? "—"
                  : stats.totalSlots > 0
                  ? `${Math.round(
                      ((stats.totalSlots - stats.availableSlots) /
                        stats.totalSlots) *
                        100,
                    )}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="dashboard-card overflow-hidden">
        <div className="p-5 border-b border-[var(--line)] flex items-center justify-between">
          <h2 className="font-bold text-[var(--sea-ink)]">
            Recent Transactions
          </h2>
          <span className="text-xs text-[var(--sea-ink-soft)]">
            Last 50 bookings
          </span>
        </div>

        {loadingBookings ? (
          <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <CreditCard
              size={40}
              className="text-[var(--sea-ink-soft)] mb-4 opacity-40"
            />
            <p className="text-[var(--sea-ink-soft)] text-sm">
              No transactions found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  {["Driver", "Vehicle", "Slot", "Period", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-[var(--link-bg-hover)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(b.user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--sea-ink)] truncate max-w-[120px]">
                            {b.user.name}
                          </p>
                          <p className="text-[var(--sea-ink-soft)] text-xs font-mono truncate max-w-[120px]">
                            {b.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-[var(--link-bg-hover)] border border-[var(--line)] px-2 py-1 rounded-md text-[var(--sea-ink)]">
                        {b.vehicle.licensePlate}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-1 rounded-md text-xs font-semibold">
                        {b.slot.slotCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--sea-ink-soft)] text-xs whitespace-nowrap">
                      <span>{formatDate(b.startTime)}</span>
                      <span className="mx-1 opacity-50">→</span>
                      <span>{formatDate(b.endTime)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status] ?? "bg-gray-500/10 text-gray-500"}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingBookings && bookings.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--line)] text-xs text-[var(--sea-ink-soft)] flex justify-between items-center">
            <span>{bookings.length} transactions loaded</span>
            <a
              href="/bookings"
              className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
            >
              View all bookings <ArrowUpRight size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  icon,
  color,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="dashboard-card p-5 flex flex-col gap-3">
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
      {sub && <p className="text-xs text-[var(--sea-ink-soft)]">{sub}</p>}
    </div>
  );
}
