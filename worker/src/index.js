// Serves { raised, goal, showDonateNative, updatedAt } for the TrickSkiCalc
// donation meter by summing succeeded Stripe charges. Read-only; no webhooks.

const CACHE_SECONDS = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function sumStripeCharges(apiKey) {
  let totalCents = 0;
  let startingAfter = null;

  for (let page = 0; page < 50; page++) {
    const url = new URL("https://api.stripe.com/v1/charges");
    url.searchParams.set("limit", "100");
    if (startingAfter) url.searchParams.set("starting_after", startingAfter);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
    const body = await res.json();

    for (const charge of body.data) {
      if (charge.status === "succeeded" && charge.paid) {
        totalCents += charge.amount - (charge.amount_refunded || 0);
      }
    }

    if (!body.has_more || body.data.length === 0) break;
    startingAfter = body.data[body.data.length - 1].id;
  }

  return totalCents / 100;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...extraHeaders },
  });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + "/", { method: "GET" });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const goal = Number(env.GOAL_USD) || 140;
    const showDonateNative = env.SHOW_DONATE_NATIVE !== "false";

    let raised = 0;
    let error;
    try {
      if (!env.STRIPE_KEY) throw new Error("STRIPE_KEY secret not set");
      raised = await sumStripeCharges(env.STRIPE_KEY);
    } catch (e) {
      error = String(e.message || e);
    }

    const response = json(
      { raised, goal, showDonateNative, updatedAt: new Date().toISOString(), ...(error ? { error } : {}) },
      200,
      { "Cache-Control": `public, max-age=${CACHE_SECONDS}` }
    );

    if (!error) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};
