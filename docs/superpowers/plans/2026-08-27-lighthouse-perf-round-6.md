# Lighthouse performance round 6 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the web font off the critical chain, remove the last duplicated render-blocking stylesheet link, and — as a measured experiment — split the post-XHR match-list render so no single task blocks for ~500 ms.

**Architecture:** Nuxt 4.5.1 SSR app, JavaScript only, deployed at `https://bandabets-coffee.vercel.app`. After round 5 the mobile home page (real data, devtools throttling) sits at perf 80, LCP 2.07 s, TBT 636 ms, SI 2.75 s. PSI shows the Hanken Grotesk `.woff2` (34 KB) as the longest critical-path request (1.1 s) and two render-blocking stylesheets (`entry.*.css` 28 KB and `useFlyToBetslip.*.css` 831 B — the latter is `AnimatePulse` + `OddChangeArrow` scoped CSS that Rollup placed in a chunk named after a composable, so the round-3 name-based hook keeps its link). The longest main-thread task (~500 ms) is the render of 10 match cards + casino strips when their XHRs resolve.

**Tech Stack:** Nuxt 4.5.1, Vue 3.5, `@nuxt/fonts` 0.14, Tailwind CSS 4; round-4 real-data harness.

**Spec:** Chat 2026-08-27 ("proceed to the next level"). Baseline = round-5 final medians: **perf 80, LCP 2066 ms, TBT 636 ms, SI 2748 ms, Style & Layout 389 ms, longest task 527 ms.** `@nuxt/fonts` 0.14 honours `families[].preload` / `defaults.preload` (`node_modules/…/@nuxt/fonts/dist/module.mjs` ~lines 520–527).

## Global Constraints
- JavaScript only; no new dependencies; semantic tokens only; do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- One commit per task on `main`, `type: summary` style, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push. Never leave a server or proxy running.
- Load `.env` with the loop in the recipe — never `source` it.

### Real-data measurement recipe
```bash
cd /Users/leonardmbugua/Desktop/bandabet
S=/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad
pnpm build 2>&1 | tail -2                                   # 400000 ms timeout
node scripts/dev-cors-proxy.mjs 3999 > /dev/null 2>&1 & echo $! > /tmp/bandabet-proxy.pid
while IFS= read -r l; do case "$l" in \#*|"") continue;; esac; k="${l%%=*}"; v="${l#*=}"; export "${k// /}=${v## }"; done < .env
export NUXT_PUBLIC_MATCHES_URL=http://localhost:3999/web.api.siakabet.com NUXT_PUBLIC_BET_URL=http://localhost:3999/bet.api.siakabet.com NUXT_PUBLIC_CASINO_URL=http://localhost:3999/soft.gaming.siakabet.com NUXT_PUBLIC_AUTH_URL=http://localhost:3999/auth.api.siakabet.com
PORT=3131 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-r6.pid
sleep 4
export npm_config_cache=$S/npm-cache
for i in 1 2 3; do npx --yes lighthouse@latest http://localhost:3131/ --only-categories=performance --throttling-method=devtools --output=json --output-path=$S/lh-r6-<label>-$i.json --chrome-flags="--headless=new --no-sandbox" --quiet 2>&1 | tail -1; done
kill "$(cat /tmp/bandabet-r6.pid)" "$(cat /tmp/bandabet-proxy.pid)"
for i in 1 2 3; do node -e 'const r=require(process.argv[1]);const a=r.audits;const m=a.metrics.details.items[0];const mt=Object.fromEntries(a["mainthread-work-breakdown"].details.items.map(i=>[i.group,Math.round(i.duration)]));const lt=a["long-tasks"].details.items;const n=a["network-requests"].details.items;const font=n.find(i=>/_fonts\/.*woff2/.test(i.url));console.log("perf",Math.round(r.categories.performance.score*100),"LCP",m.largestContentfulPaint,"FCP",m.firstContentfulPaint,"TBT",m.totalBlockingTime,"SI",Math.round(m.speedIndex),"styleLayout",mt.styleLayout,"longest",lt.length?Math.round(Math.max(...lt.map(t=>t.duration))):0,"fontStart",font?Math.round(font.networkRequestTime):null,"fontEnd",font?Math.round(font.networkEndTime):null,"blockingCss",(a["render-blocking-insight"].details.items||[]).length)' $S/lh-r6-<label>-$i.json; done
```
Three runs per variant; compare medians. Headless-browser details are in the shared context file next to the briefs.

---

### Task 1: Preload the primary web font

**Files:**
- Modify: `nuxt.config.js` (`fonts.families[0]`)

- [ ] **Step 1: Baseline (label `base`)** — recipe on the unmodified build; note `fontStart`/`fontEnd` and `blockingCss`.
- [ ] **Step 2:** In `nuxt.config.js` `fonts.families[0]` add `preload: true`. Rebuild and check the SSR HTML: `curl -s http://localhost:3131/ | grep -o '<link rel="preload"[^>]*as="font"[^>]*>'` — expected one or more `<link rel="preload" as="font" type="font/woff2" crossorigin>` for Hanken Grotesk. If the module preloads every weight (5 files ≈ 170 KB), restrict: set `preload: true` only for weight 400 by splitting the family into two entries (`{ name, weights: [400], preload: true }` and `{ name, weights: [500, 600, 700, 800] }`) — check the module's README in `node_modules` for how it merges families before doing so, and state what you found. Target: exactly one preloaded woff2 (the 400 weight, used by body text).
- [ ] **Step 3: Measure (label `font`)** — accept if median `fontEnd` moves earlier by ≥ 200 ms **or** median FCP/LCP improves ≥ 50 ms, with no TBT regression > 80 ms. Otherwise revert and report DONE_WITH_CONCERNS.
- [ ] **Step 4: Commit** — `perf: preload the body weight of Hanken Grotesk`.

---

### Task 2: Strip stylesheet links whose CSS is entirely scoped (content-based)

**Files:**
- Modify: `nuxt.config.js` (`build:manifest` hook, second loop)

The round-3 loop strips `css` links for chunks *named* after a `.vue` file. `useFlyToBetslip.*.css` escapes because its chunk is named after a composable while its content is 100 % component-scoped rules (`[data-v-…]` selectors and `-<hash>` keyframes) that Nuxt inlines whenever the component renders on the server, and Vite's preload helper adds after hydration otherwise.

- [ ] **Step 1:** In the hook's second loop, after the name-based check, add a content check: for a non-entry chunk with `css.length`, read each CSS file from the client build directory (`nuxt.options.buildDir` is not in scope inside the hook — resolve the file relative to the manifest: the hook receives the Vite client manifest; files live at `.nuxt/dist/client/_nuxt/<file>` during build; use `node:fs` `existsSync`/`readFileSync` and search `.nuxt/dist/client/_nuxt/` under the repo root). A file is "scoped-only" when, after removing `@keyframes <name>-<8-hex>{…}` blocks, every remaining rule's selector list contains `[data-v-` (regex: split on `}` and test each `selector{` prefix). If **all** of a chunk's CSS files are scoped-only, set `chunk.css = []`. Log nothing; add a short comment.
- [ ] **Step 2:** Build; `curl -s http://localhost:3131/ | grep -o 'rel="stylesheet"[^>]*href="[^"]*"'` → expected only `entry.*.css`. `/leagues` and `/sports/soccer` also 200 with one stylesheet. Then the same client-navigation proof as round 3: puppeteer mobile, `/` → router push `/leagues` → count `document.styleSheets.length` before/after (grows) and confirm the `AnimatePulse` shimmer rule exists after loading `/` and scrolling the match list to trigger the loading skeleton (`[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(r=>/shimmer/.test(r.cssText))}catch{return false}})` → true).
- [ ] **Step 3: Measure (label `css`)** — expect `blockingCss` 2 → 1; accept if no metric regresses > noise (LCP +50 ms).
- [ ] **Step 4: Commit** — `perf: strip stylesheet links for chunks whose CSS is entirely component-scoped`.

---

### Task 3 (experiment): two-frame match-list render

**Files:**
- Modify: `app/components/InfiniteScroll.vue` (the `<MatchTwo v-for="match in matches">` list)

- [ ] **Step 1:** Add a `renderedCount` ref: on each change of `matches` (watch, immediate), set `renderedCount = Math.min(matches.length, FIRST_FRAME)` with `FIRST_FRAME = 4`, then `requestAnimationFrame(() => { renderedCount = matches.length })` (guard `import.meta.client`; on the server render all). Render `v-for="match in matches.slice(0, renderedCount)"`. Keep keys.
- [ ] **Step 2: Measure (label `split`)** — accept if median TBT drops ≥ 80 ms **or** median longest task drops ≥ 150 ms, with LCP/SI not worse by > 50 ms. Otherwise revert and report DONE_WITH_CONCERNS with numbers (a negative result is a valid outcome — round 4's containment experiment was rejected the same way).
- [ ] **Step 3:** Behaviour: puppeteer mobile — after load all 10 cards are present (`.sports-matches [id]` count = 10); scrolling to the bottom still loads page 2 (count grows). No CLS increase in the Lighthouse runs (`cumulative-layout-shift` ≤ baseline + 0.01).
- [ ] **Step 4: Commit** — `perf: render the match list in two frames`.

### Task 4 (controller): final measurement + results.

## Self-review
- Coverage: font chain → T1; second stylesheet → T2; render task → T3 (experiment with explicit revert path).
- Placeholders: none; every accept rule numeric; every step names its verification.
- Consistency: T2 extends the existing hook without touching the round-2 page/layout guard or the round-3 name rule; T3 keeps `MatchTwo` keys and the sentinel-based loader untouched.

## Results (2026-08-28)

Net code change from this round: **one commit pair** (`9e1195f` + `b19e23e`) — the manifest hook now also strips stylesheet links whose CSS is entirely component-scoped, so the home page has **one** render-blocking stylesheet instead of two. Two experiments were rejected by measurement and reverted:

| Task | Outcome | Evidence (medians of 3, live data, devtools throttling) |
|---|---|---|
| T1 font preload (`preload: true` + `subsets: ["latin"]`) | **rejected**, reverted (`8f8faae`) | font finished 860 ms earlier, but FCP +92 ms / LCP +109 ms in every run, perf 78→78; and the latin-only subset drops latin-ext/cyrillic glyphs site-wide. `@nuxt/fonts` 0.14 preloads one "top priority" file per family (a build-time pick that ignored the page's actual subset) and ignores a second family entry with the same name. |
| T2 content-based stylesheet strip | **kept** | `blockingCss` 2 → 1 on `/`, `/leagues`, `/sports/soccer`; client navigation still injects styles; shimmer keyframe present. Same-session A/B (2026-08-28, noisy machine): head perf 73 / LCP 2638 / TBT 776 vs base 76 / 2239 / 798 — per-run LCP spread was 1.1 s in both arms, so the delta is not resolvable; the change removes a request from the critical path and cannot structurally raise LCP. |
| T3 two-frame match-list render | **rejected**, reverted (no commit) | TBT +352 ms, LCP +409 ms, SI +366 ms, longest task +174 ms. Splitting the render adds a second layout/paint pass that costs more than the first-frame saving on this list size. Side finding: `watch(matches, …)` never fires in `InfiniteScroll.vue` because `matches2.js` mutates the array in place — watch `matches.length` if that watcher is ever needed. |

### Where this leaves the page
The remaining costs are structural rather than incidental: the post-XHR render of the visible match cards (~500 ms task), the entry stylesheet round-trip on slow 4G, and third-party API latency. Further gains would need product-level changes (fewer/lighter odds cards in the first screen, or server-rendering the first page of matches so the client does not render them at all) — worth deciding with the deployed PSI number in hand rather than more local rounds.

### Measurement note
Local numbers on 2026-08-28 were ~5 points lower and far noisier than on 2026-08-27 for identical code (machine load); compare only within a session.
