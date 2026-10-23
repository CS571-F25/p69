// Donation meter data source and payment link.
// DONATION_STATS_URL returns { raised, goal, showDonateNative }.
// Served by the Cloudflare Worker in worker/.
export const DONATION_STATS_URL = "https://trickskicalc-donations.jake-artang.workers.dev/";
export const STRIPE_DONATE_URL = "https://donate.stripe.com/bJecN55YK4eG9oKfvc8Zq00";
export const DEFAULT_GOAL = 140;
