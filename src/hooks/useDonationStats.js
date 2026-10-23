import { useEffect, useState } from "react";
import { DONATION_STATS_URL, DEFAULT_GOAL } from "../config/donations.js";

export default function useDonationStats() {
  const [stats, setStats] = useState({ raised: 0, goal: DEFAULT_GOAL, showDonateNative: true, loading: true, error: false });

  useEffect(() => {
    // ?demo=<amount> previews the meter at a given total without touching Stripe.
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (demo !== null) {
      setStats({ raised: Math.max(0, Number(demo) || 0), goal: DEFAULT_GOAL, showDonateNative: true, loading: false, error: false });
      return;
    }

    let cancelled = false;
    fetch(DONATION_STATS_URL, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (cancelled) return;
        setStats({
          raised: Math.max(0, Number(data.raised) || 0),
          goal: Number(data.goal) > 0 ? Number(data.goal) : DEFAULT_GOAL,
          showDonateNative: data.showDonateNative !== false,
          loading: false,
          error: false,
        });
      })
      .catch((e) => {
        console.warn("Donation stats unavailable:", e);
        if (!cancelled) setStats((s) => ({ ...s, loading: false, error: true }));
      });
    return () => { cancelled = true; };
  }, []);

  return stats;
}
