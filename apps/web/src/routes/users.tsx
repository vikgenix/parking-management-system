import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, ShieldAlert, Users } from "lucide-react";
import { adminApi, type AdminUser } from "../lib/api";

export const Route = createFileRoute("/users")({ component: UsersPage });

const ROLE_STYLES: Record<string, string> = {
  admin:
    "bg-purple-500/10 text-purple-500 border border-purple-500/20",
  driver:
    "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

function UsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { users: data } = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const driverCount = users.filter((u) => u.role === "driver").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">
            User Management
          </h1>
          <p className="text-[var(--sea-ink-soft)]">
            View all registered drivers and administrators.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] font-medium rounded-xl shadow-sm hover:border-indigo-500/30 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Users"
          value={loading ? "—" : `${users.length}`}
          icon={<Users size={20} />}
          color="text-indigo-500"
        />
        <SummaryCard
          label="Admins"
          value={loading ? "—" : `${adminCount}`}
          icon={<ShieldAlert size={20} />}
          color="text-purple-500"
        />
        <SummaryCard
          label="Drivers"
          value={loading ? "—" : `${driverCount}`}
          icon={<Users size={20} />}
          color="text-cyan-500"
        />
      </div>

      {/* Table Card */}
      <div className="dashboard-card overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-[var(--line)]">
          <input
            id="users-search"
            type="text"
            placeholder="Search by name, email or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 rounded-xl bg-[var(--link-bg-hover)] border border-[var(--line)] text-[var(--sea-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-[var(--sea-ink-soft)]"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl m-5 p-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Users size={40} className="text-[var(--sea-ink-soft)] mb-4 opacity-40" />
            <p className="text-[var(--sea-ink-soft)] text-sm">
              {search ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  {["User", "Email", "Phone", "Role", "Joined"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[var(--link-bg-hover)] transition-colors"
                  >
                    {/* Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-[var(--sea-ink)] truncate max-w-[140px]">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4 text-[var(--sea-ink-soft)] font-mono text-xs">
                      {user.email}
                    </td>
                    {/* Phone */}
                    <td className="px-6 py-4 text-[var(--sea-ink-soft)]">
                      {user.phone || "—"}
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${ROLE_STYLES[user.role] ?? "bg-gray-500/10 text-gray-500"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-6 py-4 text-[var(--sea-ink-soft)] text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-[var(--line)] text-xs text-[var(--sea-ink-soft)]">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="dashboard-card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-[var(--link-bg-hover)] ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--sea-ink-soft)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--sea-ink)]">{value}</p>
      </div>
    </div>
  );
}
