import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Banknote,
  CarFront,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)] mb-1">Overview Dashboard</h1>
          <p className="text-[var(--sea-ink-soft)]">Here is what's happening at your parking facilities today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] font-medium rounded-xl shadow-sm hover:border-indigo-500/30 transition-all">Download Report</button>
          <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:bg-indigo-500 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all">New Booking</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue (Today)" value="$4,250.00" trend="+12.5%" icon={<Banknote />} color="text-emerald-500" />
        <MetricCard title="Active Bookings" value="142" trend="+8.2%" icon={<CheckCircle2 />} color="text-indigo-500" />
        <MetricCard title="Vehicles Parked" value="128" trend="+3.1%" icon={<CarFront />} color="text-blue-500" />
        <MetricCard title="Available Slots" value="45" trend="-12.4%" trendDown icon={<MapPin />} color="text-cyan-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Table (Spans 2 columns) */}
        <div className="lg:col-span-2 dashboard-card p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--sea-ink)]">Recent Arrivals & Departures</h2>
            <button className="text-sm font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1">View All <ArrowUpRight size={16}/></button>
          </div>
          
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
                <TableRow user="Alex Johnson" plate="XYZ-987" slot="F1-A12" status="Active" time="10 mins ago" />
                <TableRow user="Maria Garcia" plate="ABC-123" slot="F2-B05" status="Completed" time="45 mins ago" />
                <TableRow user="James Smith" plate="DEF-456" slot="F1-A01" status="Pending" time="1 hour ago" />
                <TableRow user="Sarah Williams" plate="GHJ-789" slot="F3-C22" status="Active" time="2 hours ago" />
                <TableRow user="Michael Brown" plate="JKL-012" slot="F2-B11" status="Completed" time="3 hours ago" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel Sidebar */}
        <div className="dashboard-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-[var(--sea-ink)] mb-6">Facility Status</h2>
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="var(--line)" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="#4f46e5" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="110" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--sea-ink)]">75%</span>
                <span className="text-xs font-medium text-[var(--sea-ink-soft)] uppercase tracking-wide">Capacity</span>
              </div>
            </div>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-4">
              Peak hours approaching. Floor 1 is currently operating at 95%
              capacity.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

// Helper Components for clean Mockups
function MetricCard({ title, value, trend, icon, color, trendDown = false }: any) {
  return (
    <div className="dashboard-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--sea-ink-soft)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--sea-ink)]">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-[var(--link-bg-hover)] ${color}`}>{icon}</div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-medium px-2 py-0.5 rounded-md ${trendDown ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{trend}</span>
        <span className="text-[var(--sea-ink-soft)]">vs last weak</span>
      </div>
    </div>
  );
}

function TableRow({ user, plate, slot, status, time }: any) {
  return (
    <tr className="w-full flex justify-between items-center bg-[var(--link-bg-hover)] p-3 rounded-xl hover:bg-[var(--line)] transition-colors border border-transparent">
      <td className="w-1/4 font-medium text-[var(--sea-ink)] flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex-shrink-0" />
        <span className="truncate">{user}</span>
      </td>
      <td className="w-1/4 text-[var(--sea-ink-soft)] font-mono text-sm">{plate}</td>
      <td className="w-1/4 font-medium text-[var(--sea-ink)]"><span className="bg-[var(--surface-strong)] px-2 py-1 rounded-md border border-[var(--line)]">{slot}</span></td>
      <td className="w-1/4 text-right flex flex-col items-end">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : status === 'Completed' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>{status}</span>
        <span className="text-xs text-[var(--sea-ink-soft)] mt-1">{time}</span>
      </td>
    </tr>
  );
}
