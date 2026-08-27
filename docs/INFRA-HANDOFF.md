# Infrastructure Handoff — Nuxt 4 SSR

The app is no longer a static bundle. It is a Node server.

**What Phase 1 server-renders, precisely:** page chrome and SEO
metadata — headings, JSON-LD, canonical link, Open Graph tags — for the six
routes listed below. It does **not** server-render odds, markets, or any
other data fetched from the backend services (matches, bet, casino, …):
data fetching in those six pages is not `await`ed during SSR, so the HTML
Nitro sends down contains the page shell and SEO tags but not the fetched
data — that data arrives client-side after hydration, same as the old SPA.
A reader of the route table below could reasonably assume odds are in the
server-rendered HTML; they are not. Making data fetching SSR-aware (so it
resolves before the response is sent) is Phase 2 work.

## What changed

| | Before | After |
|---|---|---|
| Build output | `dist/` (static) | `.output/` |
| Serve | Nginx static files | `NODE_ENV=production node .output/server/index.mjs` |
| Port | 80 (Nginx) | 3000 (`PORT` env var overrides) |
| Build command | `pnpm build` | `pnpm build` (unchanged) |
| Env substitution | build-time `sed` in `docker/config/app/entrypoint.sh` (that directory no longer exists in this repo — infra-owned, referenced here only to describe the *old* mechanism) | **not needed** |
| Health check | any static path | `GET /version.json` → `{"version":"…"}` |

The container must run a Node process now — a static file server (Nginx serving
`.output/`) will not work; `.output/server/index.mjs` is the entrypoint and must
stay running.

## Environment variables

All `VITE_*` keys are renamed to `NUXT_PUBLIC_*`, same values, same meaning.
Nuxt reads them at **server start** (via `runtimeConfig.public` in
`nuxt.config.js`), not at build time, so the image no longer needs rebuilding
or `sed`-patching per environment — the same built `.output/` can be started
with different env vars for dev/staging/prod.

Verified against `runtimeConfig.public` in `nuxt.config.js` and `.env.example`:
both list the same 33 keys — the key **sets** match exactly, which is what
matters for the app to boot with every var it needs. The **order** differs
between the two files (e.g. `AFFILIATE_API_URL` is the 28th key in
`.env.example` but the 12th in `nuxt.config.js`), which is harmless — env
var lookup isn't order-dependent — but the two files should not be read as
mirroring each other line-for-line.

| Old (`VITE_*`) | New (`NUXT_PUBLIC_*`) |
|---|---|
| `VITE_APP_VERSION` | `NUXT_PUBLIC_APP_VERSION` |
| `VITE_MATCHES_URL` | `NUXT_PUBLIC_MATCHES_URL` |
| `VITE_INSTANT_URL` | `NUXT_PUBLIC_INSTANT_URL` |
| `VITE_AUTH_URL` | `NUXT_PUBLIC_AUTH_URL` |
| `VITE_BET_URL` | `NUXT_PUBLIC_BET_URL` |
| `VITE_CASINO_URL` | `NUXT_PUBLIC_CASINO_URL` |
| `VITE_CMS_URL` | `NUXT_PUBLIC_CMS_URL` |
| `VITE_VIRTUAL_URL` | `NUXT_PUBLIC_VIRTUAL_URL` |
| `VITE_VIRTUAL_LEAGUES_URL` | `NUXT_PUBLIC_VIRTUAL_LEAGUES_URL` |
| `VITE_KIRON_LITE_URL` | `NUXT_PUBLIC_KIRON_LITE_URL` |
| `VITE_AFFILIATE_URL` | `NUXT_PUBLIC_AFFILIATE_URL` |
| `VITE_AFFILIATE_API_URL` | `NUXT_PUBLIC_AFFILIATE_API_URL` |
| `VITE_GENIUS_GAME_TRACKER_URL` | `NUXT_PUBLIC_GENIUS_GAME_TRACKER_URL` |
| `VITE_ONESIGNAL_APP_ID` | `NUXT_PUBLIC_ONESIGNAL_APP_ID` |
| `VITE_DEPOSIT_TAX` | `NUXT_PUBLIC_DEPOSIT_TAX` |
| `VITE_WITHDRAW_TAX` | `NUXT_PUBLIC_WITHDRAW_TAX` |
| `VITE_AVIATOR_GAME_ID` | `NUXT_PUBLIC_AVIATOR_GAME_ID` |
| `VITE_AVIATRIX_GAME_ID` | `NUXT_PUBLIC_AVIATRIX_GAME_ID` |
| `VITE_FOOTBALLX_GAME_ID` | `NUXT_PUBLIC_FOOTBALLX_GAME_ID` |
| `VITE_HAKI_LEAGUE_GAME_ID` | `NUXT_PUBLIC_HAKI_LEAGUE_GAME_ID` |
| `VITE_HAKI_TURBO_GAME_ID` | `NUXT_PUBLIC_HAKI_TURBO_GAME_ID` |
| `VITE_KIRON_JACKPOT_GAME_ID` | `NUXT_PUBLIC_KIRON_JACKPOT_GAME_ID` |
| `VITE_JETX_GAME_ID` | `NUXT_PUBLIC_JETX_GAME_ID` |
| `VITE_VIRTUAL_GAME_ID` | `NUXT_PUBLIC_VIRTUAL_GAME_ID` |
| `VITE_CRASH_ROYALE_GAME_ID` | `NUXT_PUBLIC_CRASH_ROYALE_GAME_ID` |
| `VITE_VIRTUAL_SPIN_GAME_ID` | `NUXT_PUBLIC_VIRTUAL_SPIN_GAME_ID` |
| `VITE_MAESTRO_GAME_ID` | `NUXT_PUBLIC_MAESTRO_GAME_ID` |
| `VITE_PAYBILL_NO` | `NUXT_PUBLIC_PAYBILL_NO` |
| `VITE_TENANT_CODE` | `NUXT_PUBLIC_TENANT_CODE` |
| `VITE_PROPELLER_AID` | `NUXT_PUBLIC_PROPELLER_AID` |
| `VITE_PROPELLER_TID` | `NUXT_PUBLIC_PROPELLER_TID` |
| `VITE_LIVE_POLL_INTERVAL` | `NUXT_PUBLIC_LIVE_POLL_INTERVAL` |
| `VITE_USSD_ACTIVATE_ACCOUNT` | `NUXT_PUBLIC_USSD_ACTIVATE_ACCOUNT` |

## Verification (from a clean rebuild at HEAD `05b3bd9`)

`rm -rf .output && pnpm build` completes clean; `.output/server/index.mjs` is
produced and runs under `node .output/server/index.mjs` on port 3000.

The six SEO routes all returned `200` from the production server with real
server-rendered markup (`<h1>`, JSON-LD, canonical link), `data-theme="dark"`
present, and no `noindex` header:

| route | status | bytes | ld+json | canonical | meta robots | X-Robots-Tag |
|---|---|---|---|---|---|---|
| `/` | 200 | 67032 | yes | yes | index,follow | none |
| `/leagues` | 200 | 64395 | yes | yes | index,follow | none |
| `/promotions` | 200 | 100749 | yes | yes | index,follow | none |
| `/sports/football` | 200 | 64443 | yes | yes | index,follow | none |
| `/sports/live/football` | 200 | 99698 | yes | yes | index,follow | none |
| `/sports/football/kenya/premier-league` | 200 | 64760 | yes | yes | index,follow | none |

Home page detail: 1 `<h1>`; `data-theme="dark"` present; `<title>Best online
sports betting in Kenya – Naibet</title>`; canonical `https://naibet.com/`;
JSON-LD `@type`s = Organization, WebSite, BreadcrumbList, SearchAction,
ContactPoint, ListItem. Param-derived titles work, e.g. `/sports/football` →
"Football Betting in Kenya – Odds & Live Markets | Naibet".

**12 of the ~32 Phase-2 placeholder routes** were actually curled and
confirmed noindexed — not all of them, despite how this section previously
read. The 12 sampled (`/privacy-policy`, `/terms-and-conditions`,
`/responsible-gambling`, `/deposit`, `/login`, `/signup`, `/casino-home`,
`/my-bets`, `/profile`, `/withdraw`, `/aviator`, and the match-details shape
`/sports/football/kenya/premier-league/arsenal-vs-chelsea-12345`) all
returned `200` with `X-Robots-Tag: noindex, nofollow`. The remaining ~20
placeholder routes were not individually curled; they share the same
`phase2Placeholders`/`phase2RealStubPaths` → `phase2NoindexRouteRules`
generation path in `nuxt.config.js` as the 12 that were (see
`docs/PHASE-2-NOTES.md` §b for the full count and generation mechanism), so
the same header is expected, but that is inference from shared code, not a
per-route confirmation.

Zero SSR errors (`nuxt instance unavailable`, `window is not defined`,
`ReferenceError`, `No match for`) appeared in the server log across the run.

**Not verified — requires a real browser, which neither an automated check
nor this handoff can provide:**

- **Exit criterion 2 (zero hydration warnings).** This was never actually
  run. Checking it means opening a real browser console and watching for
  Vue's hydration-mismatch warnings on each route; only server logs were
  grepped (for `nuxt instance unavailable`, `window is not defined`,
  `ReferenceError`, `No match for`, all of which came back clean — see
  above), which is a different, narrower signal than a browser console.
  Do not read the clean server log as this criterion having passed.
- **Exit criterion 3 (logged-in session survives a hard refresh with no
  logged-out flash).** Also requires real credentials, which neither an
  automated check nor this handoff can provide.

Both need a manual check by the team, in a real browser, before Phase 2
begins.

## Notes for the infra team

- The container must run a Node process; a static file server will not work.
- `.output/` is self-contained — `node_modules` is not needed at runtime.
- Sticky sessions are not required; the session lives in a client cookie.
- `GET /version.json` returns `{"version": "<NUXT_PUBLIC_APP_VERSION>"}` with
  `cache-control: no-store` — use it as the readiness/liveness probe.

## Fonts (2026-08-27)

`pnpm build` now needs outbound HTTPS to `fonts.googleapis.com` /
`fonts.gstatic.com` on the **build** machine only (`@nuxt/fonts` downloads
Hanken Grotesk `.woff2` files into `.output/public/_fonts/` at build time).
The runtime container makes no font requests to Google.

- The build now also emits pre-compressed `.gz`/`.br` copies of every
  `.output/public` asset, and the Node server serves them itself with the
  right `Content-Encoding` — a front proxy does not need to compress
  `/_nuxt/*` (it may, harmlessly).
- `sharp` is a devDependency, used only for the one-off `pnpm
  banners:optimize` script — a plain `pnpm install` in the build stage pulls
  down a prebuilt `libvips` binary for it, but nothing at runtime needs
  `sharp` or `libvips`.
