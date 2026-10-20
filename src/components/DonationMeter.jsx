import { Capacitor } from "@capacitor/core";
import useDonationStats from "../hooks/useDonationStats.js";
import { STRIPE_DONATE_URL } from "../config/donations.js";
import handleImg from "../assets/trick-handle.webp";

const formatUsd = (n) => `$${Math.round(n).toLocaleString()}`;

export default function DonationMeter() {
  const { raised, goal, showDonateNative, loading, error } = useDonationStats();
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  const reached = raised >= goal;
  const showButton = STRIPE_DONATE_URL && (!Capacitor.isNativePlatform() || showDonateNative);

  const handleDonate = async (e) => {
    if (Capacitor.isNativePlatform()) {
      e.preventDefault();
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: STRIPE_DONATE_URL });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
      <img
        src={handleImg}
        alt="Masterline EVA trick handle"
        className="w-40 h-40 object-cover rounded-lg bg-white flex-shrink-0"
      />

      <div className="flex-1 w-full">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-white font-semibold">
            {loading ? "Loading…" : error ? "Total unavailable" : reached ? "Goal reached, thank you!" : `${formatUsd(raised)} raised of ${formatUsd(goal)}`}
          </span>
          <span className="text-sm text-slate-400">{loading || error ? "" : `${pct}%`}</span>
        </div>

        <div
          className="h-4 w-full rounded-full bg-slate-700 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={raised}
          aria-label="Donation progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${reached ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>$0</span>
          <span>{formatUsd(goal)}</span>
        </div>

        {showButton && (
          <a
            href={STRIPE_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDonate}
            className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Donate
          </a>
        )}
      </div>
    </div>
  );
}
