import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Car,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-[var(--line)] bg-[var(--surface-strong)] flex-col pt-6 backdrop-blur-xl lg:flex sticky top-0 h-screen z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center justify-center text-white font-bold text-lg">
          P
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--sea-ink)]">
          ParkAdmin<span className="text-indigo-500">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-2 px-3 mt-4">
          Overview
        </div>
        <SidebarLink
          to="/"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
        />

        <div className="text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-2 px-3 mt-8">
          Operations
        </div>
        <SidebarLink
          to="/"
          icon={<CalendarCheck size={20} />}
          label="Live Bookings"
        />
        <SidebarLink to="/" icon={<Car size={20} />} label="Vehicles" />
        <SidebarLink to="/" icon={<Map size={20} />} label="Floors & Slots" />

        <div className="text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-2 px-3 mt-8">
          Finance
        </div>
        <SidebarLink
          to="/"
          icon={<CreditCard size={20} />}
          label="Payments & Revenue"
        />
      </nav>

      <div className="p-4 border-t border-[var(--line)] space-y-1.5">
        <SidebarLink
          to="/"
          icon={<Settings size={20} />}
          label="System Settings"
        />
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 transition-all hover:bg-red-500/10 active:scale-95">
          <LogOut size={20} /> <span>Sign Out</span>
        </button>
      </div>
    </aside>
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
    >
      <span className="opacity-80">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
