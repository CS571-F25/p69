# TrickSkiCalc Worker

One Cloudflare Worker that serves two things:

- `GET /` — donation total for the About page meter
- `POST /updates` + `GET /*.zip` — live updates for the iOS/Android apps

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

## Live updates (native apps)

The apps use `@capgo/capacitor-updater` in self-hosted mode. On every foreground
the app POSTs its native version and current bundle version to `/updates`. If
`bundle.json` names a newer bundle, the app downloads the zip in the background
and switches to it the next time it goes to the background.

`./deploy.sh` does all of this: it zips `docs/` into `bundles/`, updates
`bundle.json`, and runs `wrangler deploy` so the zip is uploaded as a static asset.

`bundle.json` fields:

- `version` / `file` / `checksum` — the newest bundle (written by the script).
- `builtinVersion` — the bundle embedded in the most recent native store build.
  Set automatically when `deploy.sh` runs with an `android` or `ios` target, so
  fresh installs don't re-download what they already have.
- `minNative` — bump this by hand (and `wrangler deploy`) when a web change
  depends on a newer native build, e.g. a new Capacitor plugin. Older installs
  then keep their current bundle until they update from the store.

Debug builds (`is_prod: false`) never receive live updates, so local testing in
Android Studio or Xcode is not overwritten.

To roll back, set `version`/`file`/`checksum` in `bundle.json` to a previous
bundle still in `bundles/` and run `wrangler deploy`.
