# Deployed-site fixes (round 9) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the two defects visible on the deployed site (`https://bandabets-coffee.vercel.app`) after round 8: the round-6 stylesheet-link strip does not run in Vercel's build (second render-blocking stylesheet is back), and the match list's loading skeleton is half the height of the real cards (CLS 0.06, 0.058 of it from that list).

**Architecture:** Nuxt 4.5.2 SSR app, JavaScript only. **Root cause 1:** the `build:manifest` hook in `nuxt.config.js` reads CSS files from `./.nuxt/dist/client/_nuxt/` (resolved from `import.meta.url`), but Nuxt 4.5's build directory is `node_modules/.cache/nuxt/.nuxt/` — the `./.nuxt` copy on the dev machine is a stale Aug-27 leftover (which is why the strip appeared to work locally), and a fresh clone (Vercel) has no `./.nuxt`, so `existsSync` fails and every chunk keeps its stylesheet link. Fix: capture `nuxt.options.buildDir` in the `ready` hook and read from `<buildDir>/dist/client/_nuxt/`. **Root cause 2:** `app/components/AnimatePulse.vue` rows are `px-3 py-2.5` with 2 px/3.5 px bars (~46 px) while a `MatchTwo` card (`py-2`, competition row + two team rows + odds buttons `py-2.5`) is ~90 px; the swap from 10 skeleton rows to 10 cards grows the list by ~450 px.

**Tech Stack:** Nuxt 4.5.2, Nitro presets `node-server` and `vercel`; round-4 real-data harness; Lighthouse 13.

**Spec:** Live measurement 2026-08-29 (my vantage, Kenya → iad1): simulated perf 77 / a11y 100, FCP 3.0 s, LCP 3.8 s (TTFB 240 + load delay 847 + load 434 + render delay 984), TBT 69 ms, CLS 0.061 (`.sports-matches` shifts 0.037 + 0.014 + 0.007), SI 6.1 s; render-blocking: `entry.*.css` 37.7 KB + `useFlyToBetslip.cgKymKfH.css` 994 B. Deployed `x-vercel-id: cpt1::iad1::…` (edge Cape Town, function US-East); TTFB from Kenya 0.57–0.78 s.

## Global Constraints
- JavaScript only; no new dependencies; semantic tokens only; do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- The `build:manifest` hook's existing behaviour (round-2 page/layout guard, round-3 `.vue`-name strip, round-6 content rule) is unchanged except for *where* CSS files are read from.
- One commit per task on `main`, `type: summary` style ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push. Never leave a server or proxy running.
- Every task ends with `pnpm build` exiting 0.

### Server + proxy recipe
```bash
cd /Users/leonardmbugua/Desktop/bandabet
pnpm build 2>&1 | tail -2                                   # 400000 ms timeout
node scripts/dev-cors-proxy.mjs 3999 > /dev/null 2>&1 & echo $! > /tmp/bandabet-proxy.pid
while IFS= read -r l; do case "$l" in \#*|"") continue;; esac; k="${l%%=*}"; v="${l#*=}"; export "${k// /}=${v## }"; done < .env
export NUXT_PUBLIC_MATCHES_URL=http://localhost:3999/web.api.siakabet.com NUXT_PUBLIC_BET_URL=http://localhost:3999/bet.api.siakabet.com NUXT_PUBLIC_CASINO_URL=http://localhost:3999/soft.gaming.siakabet.com NUXT_PUBLIC_AUTH_URL=http://localhost:3999/auth.api.siakabet.com
PORT=3131 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-r9.pid
sleep 4
# … checks …
kill "$(cat /tmp/bandabet-r9.pid)" "$(cat /tmp/bandabet-proxy.pid)"
```
Headless-browser details are in the shared context file next to the briefs.

---

### Task 1: Read CSS from Nuxt's real `buildDir` in the manifest hook

**Files:** `nuxt.config.js` (the `clientCssDir` constant near line 13 and its use in the `build:manifest` hook; add a `ready` hook)

- [ ] **Step 1: Prove the defect** — `rm -rf .nuxt` (the stale copy; it is gitignored build output), then `NITRO_PRESET=vercel pnpm build` and `grep -c 'useFlyToBetslip[^"]*\.css' .vercel/output/functions/__fallback.func/chunks/virtual/precomputed.mjs` → expected **≥ 1** (link present = bug reproduced). Also `pnpm build` (node preset) and `grep -o 'rel="stylesheet"[^>]*href="[^"]*"' ` on the served `/` → expected **2** stylesheets now that the stale dir is gone. Record both.
- [ ] **Step 2: Fix** — replace the `import.meta.url`-based `clientCssDir` with a variable filled by a `ready` hook:
```js
// Nuxt 4 builds into node_modules/.cache/nuxt/.nuxt by default (not ./.nuxt),
// and the exact path is an option, so capture it at startup instead of
// guessing. build:manifest runs after the client build has written
// <buildDir>/dist/client/_nuxt/*.css.
let clientCssDir = null;
```
and in `hooks`: `ready(nuxt) { clientCssDir = join(nuxt.options.buildDir, "dist", "client", "_nuxt") + sep; }` (import `join`, `sep` from `node:path`). In the CSS loop, `if (!clientCssDir) return false;` before building `abs`, and build `abs` with `join(clientCssDir, basename(file))` (import `basename`). Update the comment above (it currently says `nuxt.options.buildDir isn't in scope inside the hook`).
- [ ] **Step 3: Verify both presets** — `pnpm build` (node): served `/` shows **1** stylesheet; `NITRO_PRESET=vercel pnpm build`: the grep from Step 1 → **0**, and the precomputed manifest's `entry` css still present (`grep -c 'entry\.[A-Za-z0-9_-]*\.css' …precomputed.mjs` ≥ 1). `rm -rf .vercel` afterwards. Server + proxy recipe (node build): the round-3 client-nav proof still holds (`/` → router push `/leagues` → `document.styleSheets.length` grows; the shimmer keyframe exists after scrolling the match list) and the modal smoke for `login` passes. Record everything.
- [ ] **Step 4: Commit** — `fix(build): read chunk CSS from Nuxt's buildDir so the stylesheet-link strip works on Vercel`.

---

### Task 2: Match the loading skeleton to the card height (CLS)

**Files:** `app/components/AnimatePulse.vue` (only), possibly `app/components/InfiniteScroll.vue` if the row count needs to match the page size.

- [ ] **Step 1: Measure** — server + proxy up (node build from Task 1), puppeteer mobile on `/`: read `getBoundingClientRect().height` of (a) one `AnimatePulse` row while `pending` is true (capture right after navigation, before the matches XHR resolves — use `page.on("request")` to detect the `/matches?` request and evaluate before its response, or set `NUXT_PUBLIC_MATCHES_URL` to the proxy with an artificial delay… simplest: evaluate in a `MutationObserver`-free way by loading with `--cpu-throttling`? Prefer: intercept the matches request with `page.setRequestInterception(true)` and hold it while measuring), and (b) one rendered `MatchTwo` card (`.sports-matches [id]` first child) after the response. Record both heights and the container height before/after.
- [ ] **Step 2: Fix** — change the skeleton row so its rendered height equals the card height (± 2 px): mirror the card's structure — a `py-2` wrapper with a competition line (`h-2`), two team lines (`h-3.5` each with the same `space-y-1`), and a right-hand row of three odds-button placeholders `py-2.5` (`h-9`-ish), using the same padding/gap classes as `MatchTwo.vue`. Keep the shimmer classes and dark variants; semantic tokens/existing gray ramp only. Also make the number of skeleton rows equal the first page size (`pageSize=10` → `:rows="10"` already; keep).
- [ ] **Step 3: Verify** — repeat the Step 1 measurement: skeleton row height within ±2 px of the card; then run Lighthouse (devtools throttling) once locally: `cumulative-layout-shift` ≤ 0.02 and the `.sports-matches` shift gone from `layout-shifts`. Mobile screenshot of the skeleton state (hold the request) and of the loaded state.
- [ ] **Step 4: Commit** — `fix(cls): size the match-list skeleton like the cards it stands in for`.

---

### Task 3 (opt-in, needs the user's go-ahead): serve from Cape Town

`x-vercel-id: cpt1::iad1` shows the serverless function in US-East while the edge and users are in Africa; TTFB from Kenya is 0.6–0.8 s. Nitro's Vercel preset honours `nitro: { vercel: { regions: ["cpt1"] } }` (`presets/vercel/utils.mjs` reads `nitro.options.vercel?.regions`). This only affects the Vercel deployment (the Docker/GKE infra owned by the other team is untouched), but it is a deployment decision: SSR pages that call the APIs during render (`/match-details` via `useAsyncData`) would then call them from Cape Town instead of Virginia — fine if the APIs are in Africa/Europe, worse if they are US-hosted. **Do not implement until the user confirms.**

### Task 4 (controller): results, push, deployed re-measure.

### Task 2b (added after Task 2's measurement): reserve `MatchFilters`' height
Task 2 matched the skeleton to the cards, but CLS stayed at 0.059: the real source is `app/components/mobile/MatchFilters.vue` growing 44 px (SSR) → 102 px (pending) → 161 px (loaded). Brief: the filter bar must occupy its final height from first paint (render chips/search structure on the server with skeleton placeholders, or reserve `min-h` on the wrapper); verify with a local Lighthouse `cumulative-layout-shift` ≤ 0.02. Commit `fix(cls): reserve the match filter bar's height from first paint`.

### Task 2c (added after Task 2b's measurement): reserve the casino hero's height
After 2b, CLS is 0.016; the residual is the mobile hero (`HotSection`/`mobile/HotTabsSection` area) growing 118.8 → 200.8 px when casino games load (SSR renders a "No games available" state). Same rule as 2b: occupy the final height from first paint with skeleton tiles; verify CLS ≤ 0.01 and no hero entry in `layout-shifts`. Commit `fix(cls): reserve the casino hero's height while games load`.

## Results (2026-08-29)

| Task | Commits | Outcome |
|---|---|---|
| 1 Stylesheet strip on Vercel | `b8461e7` | Hook now reads CSS from `nuxt.options.buildDir` (captured in a `ready` hook) instead of a guessed `./.nuxt` path. Vercel-preset build: chunks still linking `useFlyToBetslip.css` 15 → 0; node build serves one stylesheet with `./.nuxt` absent. Nuance: `@nuxt/kit` relocates `buildDir` to `node_modules/.cache/nuxt/.nuxt` only when `./.nuxt` already exists, so the fix reads whichever Nuxt chose. |
| 2 Skeleton height | `fc8782a` | `AnimatePulse` rows 117 → 90.6 px vs card 90.6 px. Necessary but not sufficient — CLS unchanged. |
| 2b Filter bar height | `f8c2e1b`, `22db886` | `MatchFilters` 44/102/161 → 161/161/161 px (SSR/pending/loaded); rows collapse cleanly on empty or failed fetch (`settled` flag set in `finally`). CLS 0.0586 → 0.0162. |
| 2c Casino hero height | `eaf4e8e` | Hero 118.8/158.8/200.8 → 200.8 px in all states (skeleton chips + tiles from SSR; `categoriesFetched` in `finally`). **CLS 0.0162 → 0.0027.** |
| 3 Vercel region | — | Not applied — awaiting the user's decision (see Task 3). |

Local Lighthouse (devtools throttling, live data) after the round: CLS **0.059 → 0.003**, perf ~85, LCP unchanged (~2.2 s locally). Deployed re-measure after push: see the follow-up note below.

### Deployed re-measure (2026-08-29 10:41 EAT, build `cc62b949`, my vantage Kenya → iad1)
`stylesheets=1` (Vercel strip now works), `market-placeholder` and `hero-skeleton` present in SSR HTML. Lighthouse simulated: perf 74 / a11y 100, FCP 2.9 s, LCP 3.8 s, TBT 195 ms, **CLS 0.003** (was 0.061), SI 7.0 s; devtools: perf 60, FCP/LCP 4.3 s, TBT 478 ms, CLS 0.003. From this vantage the remaining gap is almost entirely network: TTFB 0.6–0.8 s to the US-East function plus the CSS round-trip — the reason Task 3 (Vercel region `cpt1`) is the next lever, pending the user's decision.
