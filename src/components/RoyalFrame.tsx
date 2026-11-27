import type { ReactNode } from 'react';

interface RoyalFrameProps {
  children: ReactNode;
  className?: string;
}

function CornerFiligree({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute w-10 h-10 sm:w-14 sm:h-14 text-[#f4c668] opacity-90 ${className}`}
    >
      <path
        d="M4 58C4 30 6 18 16 10C24 4 36 4 58 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M10 46C10 28 14 18 22 13C29 9 38 9 48 9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <path
        d="M13 13C18 13 22 17 22 22C17 22 13 18 13 13Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <circle cx="8" cy="8" r="2.6" fill="#ffe49e" />
      <path
        d="M27 7C31 7 34 10 34 13C30 13 27 10 27 7Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M7 27C7 31 10 34 13 34C13 30 10 27 7 27Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  );
}

export function RoyalFrame({ children, className = '' }: RoyalFrameProps) {
  return (
    <div
      className={`relative w-full rounded-2xl bg-[#18050b]/95 border-2 border-[#c8922f]/80 shadow-[0_24px_70px_rgba(0,0,0,0.85),inset_0_0_40px_rgba(120,16,44,0.35)] p-1.5 sm:p-2.5 ${className}`}
    >
      {/* Inner ornate gold hairline frame */}
      <div className="relative rounded-xl border border-[#f4c668]/45 bg-gradient-to-b from-[#230711]/95 via-[#18050b]/98 to-[#130308] overflow-hidden">
        <CornerFiligree className="top-1.5 left-1.5" />
        <CornerFiligree className="top-1.5 right-1.5 scale-x-[-1]" />
        <CornerFiligree className="bottom-1.5 left-1.5 scale-y-[-1]" />
        <CornerFiligree className="bottom-1.5 right-1.5 scale-x-[-1] scale-y-[-1]" />

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
