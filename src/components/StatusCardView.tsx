import { useEffect, useState } from 'react';
import { Check, Copy, Download, Heart, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { SnapZBannerLink } from './SnapZPromo';
import { generateStatusCardImage } from '../game/statusCardGenerator';
import {
  CHARACTER_OPTIONS,
  PLAY_URL,
  formatLoveOfHeartMessage,
  type SessionSummary,
} from '../game/types';

interface StatusCardViewProps {
  summary: SessionSummary;
  onPlayAgain: () => void;
}

export function StatusCardView({ summary, onPlayAgain }: StatusCardViewProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const trimmedName = summary.playerName.trim();
  const formattedScore = summary.score.toLocaleString('en-US');
  const dynamicStatusMessage = formatLoveOfHeartMessage(
    summary.playerName,
    summary.character,
    summary.score
  );

  const groomOpt = CHARACTER_OPTIONS.find((c) => c.id === 'groom')!;
  const brideOpt = CHARACTER_OPTIONS.find((c) => c.id === 'bride')!;

  useEffect(() => {
    let active = true;
    setIsGenerating(true);
    generateStatusCardImage(summary)
      .then(({ dataUrl, blob }) => {
        if (!active) return;
        setImageUrl(dataUrl);
        setImageBlob(blob);
        setIsGenerating(false);
      })
      .catch(() => {
        if (active) setIsGenerating(false);
      });
    return () => {
      active = false;
    };
  }, [summary]);

  const showTempFeedback = (msg: string) => {
    setShareFeedback(msg);
    window.setTimeout(() => {
      setShareFeedback((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `soulmate-status-${summary.score}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showTempFeedback('Status card PNG (with QR code) downloaded! Ready to post.');
  };

  const handleCopyPlayLink = async () => {
    try {
      await navigator.clipboard.writeText(PLAY_URL);
      showTempFeedback(`Play link copied: ${PLAY_URL}`);
    } catch {
      showTempFeedback(`Visit & share: ${PLAY_URL}`);
    }
  };

  const handleShare = async () => {
    const shareText = `♥ ${formattedScore} — ${dynamicStatusMessage}! Play now: ${PLAY_URL}`;

    // Always copy caption + clickable play link so users can easily paste it on Instagram/social apps
    let copiedCaption = false;
    try {
      await navigator.clipboard.writeText(shareText);
      copiedCaption = true;
    } catch {
      copiedCaption = false;
    }

    // 1. Try native Web Share API with the PNG image file + caption containing clickable link
    if (navigator.share && imageBlob) {
      const file = new File([imageBlob], 'soulmate-status.png', {
        type: 'image/png',
      });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'SOULMATE — Royal Status Card',
            text: shareText,
            files: [file],
          });
          showTempFeedback(
            copiedCaption
              ? 'Shared! Caption & play link also copied to clipboard.'
              : 'Shared successfully!'
          );
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    // 2. Fallback to text/URL Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SOULMATE — Royal Status Card',
          text: shareText,
          url: PLAY_URL,
        });
        showTempFeedback(
          copiedCaption
            ? 'Shared! Caption & play link also copied to clipboard.'
            : 'Shared successfully!'
        );
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    // 3. Desktop fallback: download PNG + confirm clipboard caption
    handleDownload();
    showTempFeedback(
      copiedCaption
        ? 'Caption + play link copied & Status PNG downloaded—ready to share!'
        : 'Status PNG downloaded—ready to share on social media!'
    );
  };

  return (
    <div className="px-4 py-3.5 sm:px-6 sm:py-5 flex flex-col items-center">
      {/* Compact Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#4f0d21] border border-[#f4c668]/60 mb-1.5">
          <Sparkles className="w-3 h-3 text-[#ffe08a]" aria-hidden="true" />
          <span
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] text-[#ffe8ad] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            MANDAP CELEBRATION COMPLETE
          </span>
        </div>

        <h2
          className="gold-shimmer-text text-2xl sm:text-[1.75rem] font-extrabold tracking-wide uppercase leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Final Score of Hearts
        </h2>
      </div>

      {/* Single Crisp Final Score of Hearts Status Card */}
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#2b0915]/95 to-[#18050b]/98 border-2 border-[#f4c668]/75 p-4 sm:p-5 text-center shadow-[0_14px_40px_rgba(0,0,0,0.75)] mb-3.5">
        {/* Couple Medallions + Center Heart */}
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 ${
              summary.character === 'groom'
                ? 'border-[#ffe49e] shadow-[0_0_14px_rgba(255,224,138,0.4)]'
                : 'border-[#c8922f]/75'
            } bg-[#16040a]`}
          >
            <img
              src={groomOpt.portraitSrc}
              alt="Groom"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>

          <Heart
            className="w-6 h-6 text-[#e11d48] fill-[#e11d48] shrink-0 drop-shadow-[0_0_10px_rgba(225,29,72,0.55)]"
            aria-hidden="true"
          />

          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 ${
              summary.character === 'bride'
                ? 'border-[#ffe49e] shadow-[0_0_14px_rgba(255,224,138,0.4)]'
                : 'border-[#c8922f]/75'
            } bg-[#16040a]`}
          >
            <img
              src={brideOpt.portraitSrc}
              alt="Bride"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {trimmedName && (
          <div className="mb-1.5">
            <span className="inline-block text-xs font-semibold text-[#ffe49e] bg-[#4f0d21] border border-[#f4c668]/50 px-3 py-0.5 rounded-full">
              {trimmedName}
            </span>
          </div>
        )}

        {/* Prominent Heart Icon + Score Display */}
        <div className="mt-1 font-mono text-3xl sm:text-4xl font-bold text-[#ffe49e] tabular-nums flex items-center justify-center gap-2.5">
          <Heart
            className="w-7 h-7 sm:w-8 sm:h-8 text-[#e11d48] fill-[#e11d48] shrink-0 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]"
            aria-hidden="true"
          />
          <span>{formattedScore}</span>
        </div>

        <p
          className="mt-2.5 text-sm sm:text-base font-bold text-[#fff3c4] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          “{dynamicStatusMessage}”
        </p>

        <div className="mt-2.5 inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#16040a]/85 border border-[#f4c668]/25 text-xs text-[#e5c994] tabular-nums">
          <span>
            {summary.heartsCollected} / {summary.totalHearts} Hearts Earned
          </span>
          <span aria-hidden="true">·</span>
          <span>{summary.chasmsCleared} Chasms Crossed</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating || !imageUrl}
          className="w-full min-h-[44px] px-4 py-2 rounded-full bg-gradient-to-b from-[#a81c3f] to-[#6a0c23] hover:from-[#bf224a] hover:to-[#7e102b] disabled:opacity-50 border-2 border-[#ffe08a] text-sm font-bold text-[#fff7dc] flex items-center justify-center gap-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>{isGenerating ? 'Preparing Status Image...' : 'Download Status Image'}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating || !imageUrl}
            className="w-full min-h-[42px] px-3.5 py-2 rounded-full bg-[#380b1b] hover:bg-[#521228] disabled:opacity-50 border border-[#f4c668]/70 text-xs sm:text-sm font-semibold text-[#ffe8ad] flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
          >
            <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Share Status on Social Media</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPlayLink}
            className="w-full min-h-[42px] px-3.5 py-2 rounded-full bg-[#2c0916] hover:bg-[#430f22] border border-[#f4c668]/55 text-xs sm:text-sm font-semibold text-[#ffe49e] flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Copy Play Link 🔗</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full min-h-[40px] px-4 py-2 rounded-full bg-[#1e060e] hover:bg-[#310a17] border border-[#f4c668]/35 text-xs sm:text-sm font-semibold text-[#f2d6a0] flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
        >
          <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Play Again</span>
        </button>
      </div>

      {shareFeedback && (
        <div
          role="status"
          className="mt-2.5 w-full max-w-md px-3 py-2 rounded-lg bg-[#2e0b16] border border-[#ffe08a]/50 text-xs text-[#ffe8ad] flex items-center justify-center gap-2 text-center"
        >
          <Check className="w-4 h-4 text-[#ffe08a] shrink-0" aria-hidden="true" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Clean SnapZ Banner Footer */}
      <footer className="w-full mt-3.5 pt-2.5 border-t border-[#f4c668]/20">
        <SnapZBannerLink variant="lobby" />
      </footer>
    </div>
  );
}
