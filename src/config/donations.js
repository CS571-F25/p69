// Donation meter data source and payment link.
// DONATION_STATS_URL returns { raised, goal, showDonateNative }.
// Point it at the Cloudflare Worker (see worker/) once deployed; the static
// JSON in public/ is a fallback so the UI works before the Worker exists.
export const DONATION_STATS_URL = "/donations.json";
export const STRIPE_DONATE_URL = "";
export const DEFAULT_GOAL = 140;
