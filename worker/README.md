# Donation meter Worker

Cloudflare Worker that returns the donation total for the About page meter.

```
GET https://<name>.<account>.workers.dev/
→ { "raised": 42, "goal": 140, "showDonateNative": true, "updatedAt": "..." }
```

## One-time setup

1. In Stripe: Developers → API keys → Create restricted key with **Charges: Read**.
2. `cd worker && npx wrangler login`
3. `npx wrangler secret put STRIPE_KEY` (paste the restricted key)
4. `npx wrangler deploy` and copy the printed URL into `src/config/donations.js`.

## Changing the goal or hiding the native donate button

Edit `[vars]` in `wrangler.toml`, then `npx wrangler deploy`. Results are cached for 60 s.
