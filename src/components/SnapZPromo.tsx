import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const SNAPZ_URL = 'https://www.snapz.co.in';
const SNAPZ_BANNER_SRC = '/assets/aistudio/SnapZ__50__Free_Online_Tools_5c368559.png';

interface SnapZBannerLinkProps {
  variant?: 'lobby' | 'header';
}

/**
 * Clean, royal gold-bordered SnapZ banner image link.
 * Used in the Lobby/Status footer ("lobby") and compactly in the Game Screen Header ("header").
 */
export function SnapZBannerLink({ variant = 'lobby' }: SnapZBannerLinkProps) {
  const [bannerError, setBannerError] = useState(false);

  const isHeader = variant === 'header';

  return (
    <a
      href={SNAPZ_URL}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      aria-label="SnapZ — 50+ Free Online Tools at www.snapz.co.in"
      className={`group relative block mx-auto rounded-xl overflow-hidden border border-[#f4c668]/65 hover:border-[#ffe08a] bg-[#16040a] shadow-[0_4px_16px_rgba(0,0,0,0.55)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a] ${
        isHeader ? 'w-full max-w-[260px] sm:max-w-[360px]' : 'w-full max-w-[520px]'
      }`}
    >
      {!bannerError ? (
        <img
          src={SNAPZ_BANNER_SRC}
          alt="SnapZ — 50+ Free Online Tools for PDF, Image, Office, Audio & Quick Tools"
          referrerPolicy="no-referrer"
          onError={() => setBannerError(true)}
          className="w-full h-auto block transition-transform duration-200 group-hover:scale-[1.01]"
        />
      ) : (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-[#280814] via-[#3a0c1d] to-[#280814] text-xs text-[#ffe8ad]">
          <span className="font-bold">SnapZ — 50+ Free Online Tools</span>
          <span className="inline-flex items-center gap-1 text-[#ffe08a] font-semibold">
            www.snapz.co.in
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_12px_rgba(24,5,11,0.35)]"
      />
    </a>
  );
}
