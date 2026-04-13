import * as React from "react";
import { Link } from "@tanstack/react-router";

// ── Illustrations ──────────────────────────────────────────────────────────────

function IllustrationCar() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Road */}
      <rect x="10" y="110" width="180" height="16" rx="4" fill="currentColor" opacity="0.08" />
      <rect x="90" y="116" width="20" height="4" rx="2" fill="currentColor" opacity="0.2" />

      {/* Car body */}
      <rect x="40" y="72" width="120" height="42" rx="10" fill="currentColor" opacity="0.12" />
      <rect x="40" y="72" width="120" height="42" rx="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

      {/* Car roof */}
      <path
        d="M68 72 C72 52, 128 52, 132 72"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />

      {/* Windows */}
      <rect x="74" y="58" width="22" height="16" rx="3" fill="currentColor" opacity="0.18" />
      <rect x="104" y="58" width="22" height="16" rx="3" fill="currentColor" opacity="0.18" />

      {/* Wheels */}
      <circle cx="72" cy="114" r="12" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="72" cy="114" r="5" fill="currentColor" opacity="0.25" />
      <circle cx="128" cy="114" r="12" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="128" cy="114" r="5" fill="currentColor" opacity="0.25" />

      {/* Headlights */}
      <rect x="152" y="84" width="12" height="6" rx="3" fill="currentColor" opacity="0.3" />
      <rect x="36" y="84" width="12" height="6" rx="3" fill="currentColor" opacity="0.2" />

      {/* Question mark floating */}
      <circle cx="100" cy="28" r="18" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
      <text x="100" y="34" textAnchor="middle" fontSize="18" fill="currentColor" opacity="0.3" fontWeight="bold">?</text>
    </svg>
  );
}

function IllustrationCalendar() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Calendar base */}
      <rect x="30" y="35" width="140" height="110" rx="10" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />

      {/* Calendar header */}
      <rect x="30" y="35" width="140" height="32" rx="10" fill="currentColor" opacity="0.14" />
      <rect x="30" y="55" width="140" height="12" fill="currentColor" opacity="0.14" />

      {/* Date rings */}
      <rect x="62" y="25" width="8" height="20" rx="4" fill="currentColor" opacity="0.3" />
      <rect x="130" y="25" width="8" height="20" rx="4" fill="currentColor" opacity="0.3" />

      {/* Grid lines */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={46 + col * 32}
            y={82 + row * 22}
            width="18"
            height="14"
            rx="3"
            fill="currentColor"
            opacity={row === 1 && col === 1 ? "0.25" : "0.08"}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
        ))
      )}

      {/* Star / sparkle */}
      <circle cx="155" cy="42" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="45" cy="42" r="2" fill="currentColor" opacity="0.3" />

      {/* Floating dots */}
      <circle cx="170" cy="80" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="28" cy="100" r="3" fill="currentColor" opacity="0.12" />
      <circle cx="175" cy="110" r="2.5" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

function IllustrationParkingLot() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Ground */}
      <rect x="15" y="125" width="170" height="14" rx="4" fill="currentColor" opacity="0.08" />

      {/* Parking spaces */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={20 + i * 42} y="75" width="34" height="52" rx="4"
            fill="currentColor" opacity={i === 1 ? "0.14" : "0.07"}
            stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.2" />
          {/* P sign */}
          <rect x={32 + i * 42} y="84" width="10" height="16" rx="2" fill="currentColor" opacity="0.18" />
          <circle cx={37 + i * 42} cy="88" r="4" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
        </g>
      ))}

      {/* Overhead sign */}
      <rect x="50" y="30" width="100" height="30" rx="6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.2" />
      <text x="100" y="51" textAnchor="middle" fontSize="16" fill="currentColor" fontWeight="bold" opacity="0.25">P</text>

      {/* Sign poles */}
      <rect x="68" y="60" width="3" height="18" rx="1.5" fill="currentColor" opacity="0.15" />
      <rect x="129" y="60" width="3" height="18" rx="1.5" fill="currentColor" opacity="0.15" />

      {/* Floating search circle */}
      <circle cx="160" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="3 2" />
      <circle cx="163" cy="43" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function IllustrationUsers() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Main figure */}
      <circle cx="100" cy="55" r="28" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <circle cx="100" cy="50" r="16" fill="currentColor" opacity="0.15" />
      <path d="M60 125 C60 102 140 102 140 125" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />

      {/* Left figure */}
      <circle cx="52" cy="68" r="16" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
      <circle cx="52" cy="64" r="9" fill="currentColor" opacity="0.1" />
      <path d="M24 125 C24 108 80 108 80 125" fill="currentColor" opacity="0.07" />

      {/* Right figure */}
      <circle cx="148" cy="68" r="16" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
      <circle cx="148" cy="64" r="9" fill="currentColor" opacity="0.1" />
      <path d="M120 125 C120 108 176 108 176 125" fill="currentColor" opacity="0.07" />

      {/* Magnifier */}
      <circle cx="158" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <line x1="166" y1="40" x2="174" y2="48" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
    </svg>
  );
}

function IllustrationReceipt() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Receipt shadow */}
      <rect x="60" y="40" width="90" height="105" rx="6" fill="currentColor" opacity="0.06" />

      {/* Receipt */}
      <rect x="52" y="32" width="90" height="105" rx="6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.22" />

      {/* Zig-zag bottom */}
      <path d="M52 122 l7.5 8 l7.5-8 l7.5 8 l7.5-8 l7.5 8 l7.5-8 l7.5 8 l7.5-8 l7.5 8 l7.5-8 l7.5 8 l7.5-8"
        stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.22" fill="none" />

      {/* Lines on receipt */}
      <rect x="68" y="50" width="60" height="6" rx="3" fill="currentColor" opacity="0.15" />
      <rect x="68" y="64" width="40" height="4" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="68" y="76" width="50" height="4" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="68" y="88" width="35" height="4" rx="2" fill="currentColor" opacity="0.1" />

      {/* Divider */}
      <line x1="62" y1="100" x2="132" y2="100" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 3" />

      {/* Total */}
      <rect x="68" y="108" width="24" height="6" rx="3" fill="currentColor" opacity="0.12" />
      <rect x="102" y="108" width="28" height="6" rx="3" fill="currentColor" opacity="0.22" />

      {/* Dollar coin */}
      <circle cx="162" cy="48" r="18" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.2" />
      <text x="162" y="54" textAnchor="middle" fontSize="16" fill="currentColor" opacity="0.25" fontWeight="bold">$</text>
    </svg>
  );
}

function IllustrationSearch() {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Magnifier */}
      <circle cx="88" cy="72" r="44" fill="currentColor" opacity="0.07" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      <circle cx="88" cy="72" r="30" fill="currentColor" opacity="0.05" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.18" />

      {/* Handle */}
      <line x1="121" y1="106" x2="152" y2="138" stroke="currentColor" strokeWidth="8" strokeOpacity="0.15" strokeLinecap="round" />
      <line x1="121" y1="106" x2="152" y2="138" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" strokeLinecap="round" />

      {/* X inside */}
      <line x1="78" y1="62" x2="98" y2="82" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="98" y1="62" x2="78" y2="82" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Main EmptyState component ──────────────────────────────────────────────────

type IllustrationKey =
  | "car"
  | "calendar"
  | "parking"
  | "users"
  | "receipt"
  | "search";

const illustrations: Record<IllustrationKey, React.FC> = {
  car: IllustrationCar,
  calendar: IllustrationCalendar,
  parking: IllustrationParkingLot,
  users: IllustrationUsers,
  receipt: IllustrationReceipt,
  search: IllustrationSearch,
};

interface EmptyStateProps {
  illustration: IllustrationKey;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  /** Extra className for the wrapper */
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = "",
}: EmptyStateProps) {
  const Illustration = illustrations[illustration];

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center select-none ${className}`}
    >
      {/* Illustration */}
      <div
        className="mb-6 text-[var(--sea-ink-soft)]"
        style={{ width: 160, height: 120 }}
      >
        <Illustration />
      </div>

      {/* Text */}
      <h3 className="text-base font-bold text-[var(--sea-ink)] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[var(--sea-ink-soft)] max-w-xs leading-relaxed">
        {description}
      </p>

      {/* Action */}
      {actionLabel && (
        <div className="mt-6">
          {actionTo ? (
            <Link
              to={actionTo as any}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 active:scale-95 transition-all shadow-md"
            >
              {actionLabel}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 active:scale-95 transition-all shadow-md"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
