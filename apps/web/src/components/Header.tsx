
import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";
import { getUser, logout } from "../lib/auth";

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();

  const handleSignOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-xl transition-all">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Mobile Logo / Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="lg:hidden h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>

          <div className="hidden sm:flex relative w-64 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] group-focus-within:text-indigo-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search bookings, vehicles..."
              className="w-full bg-[var(--link-bg-hover)] border border-[var(--line)] rounded-full pl-10 pr-4 py-2 text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-[var(--sea-ink-soft)]"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <button className="relative p-2 rounded-full text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--header-bg)]"></span>
          </button>

          <div className="h-8 w-px bg-[var(--line)] mx-1 hidden sm:block"></div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="flex items-center gap-2 rounded-full p-1 pl-3 pr-1 text-sm font-medium text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] transition-colors border border-transparent hover:border-[var(--line)]"
          >
            <span className="hidden sm:block">
              {user?.name ?? "Admin User"}
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <User size={16} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
