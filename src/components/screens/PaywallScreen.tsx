import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface PaywallScreenProps {
  onClose: () => void;
  onUnlock: () => void;
  onRestore: () => void;
  isLoading?: boolean;
  isRestoring?: boolean;
  error?: string | null;
  restoreMessage?: string | null;
}

export const PaywallScreen = ({ onClose, onUnlock, onRestore, isLoading, isRestoring, error, restoreMessage }: PaywallScreenProps) => {

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #0d0f1a 0%, #080a10 100%)' }}>
      <div className="safe-area-top flex-shrink-0" />

      {/* Close button */}
      <div className="px-4 pt-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white/60" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto">
        {/* LEVEL UP title */}
        <h1
          className="text-6xl font-black italic text-center mt-4 tracking-tight px-4"
          style={{
            background: 'linear-gradient(180deg, #b0baff 0%, #ffffff 50%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            overflow: 'visible',
            paddingRight: '0.15em',
          }}
        >
          LEVEL UP
        </h1>

        {/* Subtitle */}
        <p className="text-[15px] text-white/60 mt-2 text-center px-8">
          Your AI-powered grooming companion.
        </p>

        {/* Ratings card */}
        <div className="mt-8 mx-6 w-[calc(100%-48px)] rounded-3xl overflow-hidden" style={{ background: '#12141e' }}>
          <img
            src="/paywall-ratings.png"
            alt="Get your ratings"
            className="w-full block"
          />
        </div>

        {/* Social proof */}
        <p className="text-[15px] text-white/60 mt-8">
          Trusted by thousands of users
        </p>

        <div className="flex-1" />
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-3 flex-shrink-0">
        <Button
          onClick={onUnlock}
          disabled={isLoading || isRestoring}
          className="w-full h-14 rounded-2xl text-lg font-semibold bg-[#3478F6] hover:bg-[#2d6bdf] active:bg-[#2760cc] text-white border-0"
        >
          {isLoading ? 'Processing...' : 'Buy 1 Scan — $4.99'}
        </Button>

        <p className="text-sm text-white/70 text-center mt-3">
          $4.99 per scan · one-time purchase
        </p>

        {/* Apple-required payment disclosure for consumable IAP */}
        <p className="text-[11px] text-white/70 text-center mt-2 px-2 leading-relaxed">
          Payment will be charged to your Apple ID account at confirmation of purchase. This is a one-time purchase for a single scan — no subscription and no auto-renewal. Each additional scan is a new purchase.
        </p>

        {error && (
          <p className="text-xs text-red-400 text-center mt-2 px-4 break-words">
            {error}
          </p>
        )}

        {restoreMessage && !error && (
          <p className="text-xs text-amber-400 text-center mt-2 px-4 break-words">
            {restoreMessage}
          </p>
        )}

        <div className="flex justify-center items-center gap-4 mt-3 pb-1 flex-wrap">
          <button
            onClick={onRestore}
            disabled={isRestoring || isLoading}
            className="text-xs text-white/60 active:text-white/80 transition-colors min-h-[44px] flex items-center"
          >
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </button>
          <span className="text-white/20">|</span>
          <a
            href="/terms.html"
            className="text-xs text-white/60 active:text-white/80 transition-colors min-h-[44px] flex items-center"
          >
            Terms of Use
          </a>
          <span className="text-white/20">|</span>
          <a
            href="/privacy-policy.html"
            className="text-xs text-white/60 active:text-white/80 transition-colors min-h-[44px] flex items-center"
          >
            Privacy Policy
          </a>
        </div>
      </div>
      <div className="safe-area-bottom flex-shrink-0" />
    </div>
  );
};
