import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CalendarCheck,
  Car,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Users,
} from "lucide-react";
import { getUser, logout } from "../lib/auth";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const handleSignOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <aside className="hidden w-64 border-r border-[var(--line)] bg-[var(--surface-strong)] flex-col pt-6 backdrop-blur-xl lg:flex sticky top-0 h-screen z-50">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center justify-center text-white font-bold text-lg">
          P
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--sea-ink)]">
          ParkAdmin<span className="text-indigo-500">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {/* Overview */}
        <SectionLabel label="Overview" />
        <SidebarLink
          to="/"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />

        {/* Operations */}
        <SectionLabel label="Operations" />
        {isAdmin && (
          <SidebarLink
            to="/bookings"
            icon={<CalendarCheck size={18} />}
            label="All Bookings (Admin)"
          />
        )}
        {!isAdmin && (
          <>
            <SidebarLink
              to="/my-bookings"
              icon={<CalendarCheck size={18} />}
              label="My Bookings"
            />
            <SidebarLink
              to="/book-slot"
              icon={<MapPin size={18} />}
              label="Book Parking"
            />
          </>
        )}
        <SidebarLink
          to="/vehicles"
          icon={<Car size={18} />}
          label={isAdmin ? "Vehicles (Admin)" : "My Vehicles"}
        />
        {isAdmin && (
          <SidebarLink
            to="/parking-management"
            icon={<Building2 size={18} />}
            label="Floors & Slots"
          />
        )}

        {/* Admin only sections */}
        {isAdmin && (
          <>
            <SectionLabel label="People" />
            <SidebarLink
              to="/users"
              icon={<Users size={18} />}
              label="Users"
            />

            <SectionLabel label="Finance" />
            <SidebarLink
              to="/payments"
              icon={<CreditCard size={18} />}
              label="Payments & Revenue"
            />
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[var(--line)] space-y-1">
        {isAdmin && (
          <SidebarLink
            to="/admin-tools"
            icon={<Settings size={18} />}
            label="Admin Tools"
          />
        )}
        <button
          id="sidebar-sign-out"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
        >
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider px-3 mt-6 mb-1.5">
      {label}
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[var(--sea-ink-soft)] transition-all hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] active:scale-[0.98]"
      activeProps={{
        className: "bg-indigo-500/10 text-indigo-500 font-semibold shadow-sm",
      }}
      activeOptions={{ exact: to === "/" }}
    >
      <span className="opacity-80">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
