import { Capacitor } from "@capacitor/core";
import useDonationStats from "../hooks/useDonationStats.js";
import { STRIPE_DONATE_URL } from "../config/donations.js";
import handleImg from "../assets/trick-handle.webp";

const formatUsd = (n) => `$${Math.round(n).toLocaleString()}`;

// Periodic over 100 units so a 200-wide SVG shifted by 50% loops seamlessly.
const WAVE_PATH =
  "M0 10 Q12.5 0 25 10 T50 10 T75 10 T100 10 T125 10 T150 10 T175 10 T200 10 V20 H0 Z";

function Wave({ className }) {
  return (
    <svg
      className={`absolute left-0 -top-[11px] h-3 w-[200%] ${className}`}
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path fill="currentColor" d={WAVE_PATH} />
    </svg>
  );
}

export default function DonationMeter() {
  const { raised, goal, showDonateNative, loading, error } = useDonationStats();
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  const reached = raised >= goal;
  const hasWater = raised > 0;
  const fillPct = hasWater ? Math.max(pct, 4) : 0;
  const showButton = STRIPE_DONATE_URL && (!Capacitor.isNativePlatform() || showDonateNative);
  const waterColor = reached ? "text-green-500" : "text-blue-500";
  const waterBg = reached ? "bg-green-500" : "bg-blue-500";

  const handleDonate = async (e) => {
    if (Capacitor.isNativePlatform()) {
      e.preventDefault();
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: STRIPE_DONATE_URL });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={handleImg}
        alt="Masterline EVA trick handle"
        className="w-44 h-44 sm:w-52 sm:h-52 object-cover rounded-lg bg-white"
      />

      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 mb-1">{formatUsd(goal)}</span>
        <div
          className="relative w-32 sm:w-40 h-72 sm:h-80 rounded-full bg-slate-700 border-4 border-slate-600 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={raised}
          aria-label="Donation progress"
        >
          <div
            className={`absolute inset-x-0 bottom-0 ${waterBg} transition-[height] duration-1000 ease-out`}
            style={{ height: `${fillPct}%` }}
          >
            {hasWater && (
              <>
                <Wave className={`wave wave-back ${waterColor} opacity-50`} />
                <Wave className={`wave ${waterColor}`} />
              </>
            )}
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {loading || error ? "" : `${pct}%`}
          </span>
        </div>
        <span className="text-xs text-slate-400 mt-1">$0</span>
      </div>

      <p className="text-white font-semibold text-lg text-center">
        {loading ? "Loading…" : error ? "Total unavailable right now" : reached ? "Goal reached, thank you!" : `${formatUsd(raised)} raised of ${formatUsd(goal)}`}
      </p>

      {showButton && (
        <a
          href={STRIPE_DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDonate}
          className="inline-block px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Donate
        </a>
      )}
    </div>
  );
}
