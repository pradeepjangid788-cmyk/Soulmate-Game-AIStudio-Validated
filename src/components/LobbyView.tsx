import { useState } from 'react';
import { Check, Volume2, VolumeX } from 'lucide-react';
import { SnapZBannerLink } from './SnapZPromo';
import {
  CHARACTER_OPTIONS,
  RIDE_OPTIONS,
  type CharacterId,
  type RideId,
} from '../game/types';

interface LobbyViewProps {
  selectedCharacter: CharacterId;
  selectedRide: RideId;
  playerName: string;
  isMuted: boolean;
  onSelectCharacter: (id: CharacterId) => void;
  onSelectRide: (id: RideId) => void;
  onChangePlayerName: (name: string) => void;
  onToggleMute: () => void;
  onStartGame: () => void;
}

function WeddingRingIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`w-5 h-5 shrink-0 ${className}`}
    >
      <circle cx="12" cy="14" r="6.5" stroke="#ffe08a" strokeWidth="2" />
      <path d="M9.5 6.5L12 3.5L14.5 6.5L12 8.5L9.5 6.5Z" fill="#fff3c4" stroke="#f4c668" strokeWidth="1" />
    </svg>
  );
}

export function LobbyView({
  selectedCharacter,
  selectedRide,
  playerName,
  isMuted,
  onSelectCharacter,
  onSelectRide,
  onChangePlayerName,
  onToggleMute,
  onStartGame,
}: LobbyViewProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const markError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="relative px-3.5 pt-2.5 pb-3 sm:px-6 sm:pt-3.5 sm:pb-4 flex flex-col items-center">
      {/* Mute Toggle */}
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        className="absolute right-3 top-2.5 sm:right-4 sm:top-3.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#f4c668]/35 bg-[#280b14]/90 hover:bg-[#3d1020] text-[#ffe08a] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Hero Title & Short Tagline */}
      <div className="text-center max-w-xl mb-2 sm:mb-2.5 px-8">
        <h1
          className="gold-shimmer-text text-3xl sm:text-[2.45rem] font-extrabold tracking-[0.08em] leading-none uppercase"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SOULMATE
        </h1>
        <p className="mt-1 text-xs sm:text-[13px] italic text-[#f5dfb0] leading-snug">
          A royal journey toward your forever love
        </p>
      </div>

      {/* Character Selection Cards: Strictly GROOM & BRIDE */}
      <div
        role="radiogroup"
        aria-label="Choose your wedding character"
        className="w-full max-w-[500px] grid grid-cols-2 gap-2.5 sm:gap-3.5 mb-2"
      >
        {CHARACTER_OPTIONS.map((char) => {
          const isSelected = selectedCharacter === char.id;
          return (
            <button
              key={char.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectCharacter(char.id)}
              className={`group relative rounded-xl overflow-hidden text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a] ${
                isSelected
                  ? 'border-2 border-[#ffe08a] bg-[#2a0a15] shadow-[0_0_22px_rgba(244,198,104,0.34)] scale-[1.012]'
                  : 'border border-[#f4c668]/40 bg-[#1e070f] hover:border-[#f4c668]/80 hover:bg-[#270914]'
              }`}
            >
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 z-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ffe08a] text-[#280b14] flex items-center justify-center shadow-md"
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </span>
              )}

              <div className="relative aspect-[4/3] sm:aspect-[1/0.78] w-full overflow-hidden bg-[#1a050b]">
                {!imgErrors[char.id] ? (
                  <img
                    src={char.portraitSrc}
                    alt={`${char.title} royal portrait`}
                    referrerPolicy="no-referrer"
                    onError={() => markError(char.id)}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#3b0d1d] to-[#1a050b] text-[#ffe08a] text-sm font-semibold">
                    {char.title}
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#280712] to-transparent"
                />
              </div>

              <div
                className={`px-2 py-1.5 text-center border-t transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#611029] to-[#3f091a] border-[#ffe08a]/60'
                    : 'bg-gradient-to-b from-[#450c1e] to-[#2b0612] border-[#f4c668]/25'
                }`}
              >
                <div
                  className="text-xs sm:text-sm font-bold tracking-[0.12em] text-[#ffe8ad] truncate"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {char.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional "Write your name" field */}
      <div className="w-full max-w-[340px] mb-2">
        <label htmlFor="player-name-input" className="sr-only">
          Write your name (optional)
        </label>
        <input
          id="player-name-input"
          type="text"
          maxLength={28}
          value={playerName}
          onChange={(e) => onChangePlayerName(e.target.value)}
          placeholder="Write your name (optional)"
          className="w-full min-h-[38px] px-3.5 py-1 rounded-lg bg-[#f9f3e8] text-[#280b14] placeholder:text-[#7c535f] text-xs sm:text-sm font-medium text-center border-2 border-[#f4c668]/80 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#ffe08a]"
        />
      </div>

      {/* Royal Ride Selection: 3 Options Only */}
      <div className="w-full max-w-[520px] mb-2.5">
        <h2
          className="text-center text-xs sm:text-sm font-bold tracking-[0.1em] text-[#ffe08a] uppercase mb-1.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          CHOOSE ROYAL RIDE
        </h2>

        <div
          role="radiogroup"
          aria-label="Choose Royal Ride"
          className="grid grid-cols-3 gap-2 sm:gap-3"
        >
          {RIDE_OPTIONS.map((ride) => {
            const isSelected = selectedRide === ride.id;
            return (
              <button
                key={ride.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectRide(ride.id)}
                className={`group relative flex flex-col items-center rounded-xl p-1 sm:p-1.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a] ${
                  isSelected
                    ? 'border-2 border-[#ffe08a] bg-gradient-to-b from-[#3d0d1d] to-[#230610] shadow-[0_0_18px_rgba(244,198,104,0.3)] scale-[1.015]'
                    : 'border border-[#f4c668]/25 bg-[#1a050b]/70 hover:border-[#f4c668]/65 hover:bg-[#280914]'
                }`}
              >
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 z-20 w-4 h-4 rounded-full bg-[#ffe08a] text-[#280b14] flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                <div className="relative w-full aspect-[4/2.7] flex items-center justify-center overflow-hidden rounded-lg bg-[#16040a]">
                  {isSelected && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,224,138,0.22)_0%,transparent_72%)]"
                    />
                  )}
                  {!imgErrors[ride.id] ? (
                    <img
                      src={ride.imageSrc}
                      alt={ride.name}
                      referrerPolicy="no-referrer"
                      onError={() => markError(ride.id)}
                      className="w-full h-full object-contain ride-blend-mask transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs text-[#ffe08a] font-medium">{ride.name}</span>
                  )}
                </div>

                <span
                  className={`mt-1 text-[11px] sm:text-xs font-semibold text-center whitespace-nowrap truncate max-w-full ${
                    isSelected ? 'text-[#fff3c4]' : 'text-[#e8cf9b]'
                  }`}
                >
                  {ride.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary CTA Button */}
      <div className="w-full max-w-[440px] flex flex-col items-center">
        <button
          type="button"
          onClick={onStartGame}
          className="w-full min-h-[44px] px-4 py-2 rounded-full bg-gradient-to-b from-[#a81c3f] via-[#83112d] to-[#5d091e] hover:from-[#bf224a] hover:via-[#961535] hover:to-[#6d0c24] active:scale-[0.985] border-2 border-[#f4c668] shadow-[0_6px_22px_rgba(244,198,104,0.28),inset_0_1px_1px_rgba(255,240,190,0.45)] flex items-center justify-center gap-2 text-[#fff7dc] font-bold text-xs sm:text-sm tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a] whitespace-nowrap"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <WeddingRingIcon />
          <span className="truncate">LET THE WEDDING JOURNEY BEGIN!</span>
          <WeddingRingIcon />
        </button>
      </div>

      {/* Clean One-View SnapZ Banner Footer */}
      <footer className="w-full mt-2.5 pt-2 border-t border-[#f4c668]/20">
        <SnapZBannerLink variant="lobby" />
      </footer>
    </div>
  );
}
