import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, RefreshCw } from "lucide-react";
import { adminApi, type RecentBooking } from "../lib/api";

export const Route = createFileRoute("/bookings")({ component: BookingsPage });

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  completed: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
  expired: "bg-red-500/10 text-red-500 border border-red-500/20",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<RecentBooking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(20);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { bookings: data } = await adminApi.getRecentBookings(limit);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBookings();
  }, [limit]);

  const statuses = ["all", "active", "confirmed", "pending", "completed", "cancelled", "expired"];

  const filtered =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  // Counts per status
  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
            Live Bookings
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            Monitor all parking bookings in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            id="bookings-limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                Show {n}
              </option>
            ))}
          </select>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] font-medium rounded-xl shadow-sm hover:border-indigo-500/30 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="flex flex-wrap gap-3">
          {statuses.filter((s) => s !== "all").map((s) => (
            <button
              key={s}
              id={`filter-${s}`}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-all ${
                statusFilter === s
                  ? (STATUS_STYLES[s] ?? "bg-gray-500/10 text-gray-500")
                  : "bg-[var(--surface)] border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-indigo-500/30"
              }`}
            >
              {s}
              {counts[s] ? (
                <span className="ml-2 opacity-70">{counts[s]}</span>
              ) : null}
            </button>
          ))}
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="px-4 py-2 rounded-xl text-sm font-medium text-indigo-500 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <CalendarCheck
              size={40}
              className="text-[var(--sea-ink-soft)] mb-4 opacity-40"
            />
            <p className="text-[var(--sea-ink-soft)] text-sm">
              No bookings found
              {statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  {[
                    "User",
                    "Vehicle",
                    "Slot",
                    "Start",
                    "End",
                    "Status",
                    "Created",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-[var(--link-bg-hover)] transition-colors"
                  >
                    {/* User */}
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
                    {/* Vehicle */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-[var(--link-bg-hover)] border border-[var(--line)] px-2 py-1 rounded-md text-[var(--sea-ink)]">
                        {b.vehicle.licensePlate}
                      </span>
                      {b.vehicle.model && (
                        <p className="text-[var(--sea-ink-soft)] text-xs mt-1">
                          {b.vehicle.model}
                        </p>
                      )}
                    </td>
                    {/* Slot */}
                    <td className="px-5 py-4">
                      <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-1 rounded-md text-xs font-semibold">
                        {b.slot.slotCode}
                      </span>
                    </td>
                    {/* Start */}
                    <td className="px-5 py-4 text-[var(--sea-ink-soft)] text-xs whitespace-nowrap">
                      {formatDateTime(b.startTime)}
                    </td>
                    {/* End */}
                    <td className="px-5 py-4 text-[var(--sea-ink-soft)] text-xs whitespace-nowrap">
                      {formatDateTime(b.endTime)}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status] ?? "bg-gray-500/10 text-gray-500"}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    {/* Created */}
                    <td className="px-5 py-4 text-[var(--sea-ink-soft)] text-xs whitespace-nowrap">
                      {timeAgo(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--sea-ink-soft)]">
            <span>
              Showing {filtered.length} of {bookings.length} bookings
            </span>
            {bookings.length >= limit && (
              <button
                onClick={() => setLimit((l) => l + 20)}
                className="text-indigo-500 hover:underline"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
