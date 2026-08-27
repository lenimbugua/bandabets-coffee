# Lighthouse performance round 4 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the home page's post-data render cost (a ~500 ms long task and ~635 ms of Style & Layout when the match list and casino strips arrive) with CSS containment, measured on a harness that renders real API data.

**Architecture:** Nuxt 4.5.1 SSR app, JavaScript only. Rounds 2–3 removed the JS/CSS byte costs; with real data the mobile home page renders 10 match cards (≈62 DOM nodes each), 3 casino strips and a footer in one task after the XHRs resolve. `content-visibility: auto` + `contain-intrinsic-size` lets Chrome skip layout/paint for offscreen subtrees until they approach the viewport. This round applies it to the offscreen units and keeps it only if the A/B measurement shows a gain.

**Tech Stack:** Nuxt 4.5.1, Vue 3.5, Tailwind CSS 4; Lighthouse 13 + puppeteer-core in the scratch npm cache; `scripts/dev-cors-proxy.mjs` (new) so local runs get live API data.

**Spec:** Chat design 2026-08-27 ("proceed to the next level"). Baseline measured with the proxy harness (devtools throttling, Moto G Power): **perf 80, FCP/LCP 2.19 s, TBT 611 ms, SI 2.87 s**; main thread: Style & Layout 635 ms, Script 487 ms, Rendering 305 ms; longest task 502 ms at ~10.9 s (post-XHR render); DOM 1,323 elements, match list 624 nodes for 10 cards.

## Global Constraints
- JavaScript only; no new dependencies; semantic tokens only; do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- One commit per task on `main`, `type: summary` style, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push. Never leave a server or proxy running.
- Load `.env` with the loop below — never `source` it (it is written `KEY= value`).

### Real-data measurement recipe
```bash
cd /Users/leonardmbugua/Desktop/bandabet
S=/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad
pnpm build 2>&1 | tail -2                                   # 400000 ms timeout
node scripts/dev-cors-proxy.mjs 3999 > /dev/null 2>&1 & echo $! > /tmp/bandabet-proxy.pid
while IFS= read -r l; do case "$l" in \#*|"") continue;; esac; k="${l%%=*}"; v="${l#*=}"; export "${k// /}=${v## }"; done < .env
export NUXT_PUBLIC_MATCHES_URL=http://localhost:3999/web.api.siakabet.com NUXT_PUBLIC_BET_URL=http://localhost:3999/bet.api.siakabet.com NUXT_PUBLIC_CASINO_URL=http://localhost:3999/soft.gaming.siakabet.com NUXT_PUBLIC_AUTH_URL=http://localhost:3999/auth.api.siakabet.com
PORT=3131 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-r4.pid
sleep 4
export npm_config_cache=$S/npm-cache
for i in 1 2 3; do npx --yes lighthouse@latest http://localhost:3131/ --only-categories=performance --throttling-method=devtools --output=json --output-path=$S/lh-r4-<label>-$i.json --chrome-flags="--headless=new --no-sandbox" --quiet 2>&1 | tail -1; done
kill "$(cat /tmp/bandabet-r4.pid)" "$(cat /tmp/bandabet-proxy.pid)"
for i in 1 2 3; do node -e 'const r=require(process.argv[1]);const a=r.audits;const m=a.metrics.details.items[0];const mt=Object.fromEntries(a["mainthread-work-breakdown"].details.items.map(i=>[i.group,Math.round(i.duration)]));const lt=a["long-tasks"].details.items;console.log("perf",Math.round(r.categories.performance.score*100),"LCP",m.largestContentfulPaint,"TBT",m.totalBlockingTime,"SI",Math.round(m.speedIndex),"styleLayout",mt.styleLayout,"script",mt.scriptEvaluation,"render",mt.paintCompositeRender,"longest",lt.length?Math.round(Math.max(...lt.map(t=>t.duration))):0)' $S/lh-r4-<label>-$i.json; done
```
Three runs per variant; compare medians. `<label>` = `base` or `cv`.

---

### Task 1: CSS containment for offscreen home-page units

**Files:**
- Modify: `app/components/MatchTwo.vue` (root element class + scoped style)
- Modify: `app/components/mobile/GamesRow.vue` (section class + scoped style)
- Modify: `app/components/Footer.vue` (root class + scoped style)
- Add (already written by the controller, commit it): `scripts/dev-cors-proxy.mjs`

- [ ] **Step 1: Baseline (label `base`)** — run the recipe on the current build (no code change) and record the three result lines.

- [ ] **Step 2: Apply containment**

`app/components/MatchTwo.vue`: add the class `match-row` to the root `<div :id="match.parentMatchId" …>` (append to the existing static `class="leading-none w-full border-b border-border"`), and add to the component's scoped `<style>` (create `<style scoped>` at the end of the file if there is none):
```css
/* Round 4 (Lighthouse): let the browser skip layout/paint for cards that
   are below the fold until they scroll near. The intrinsic size matches a
   rendered card (two team rows + odds) so the scrollbar/height is stable. */
.match-row {
  content-visibility: auto;
  contain-intrinsic-size: auto 96px;
}
```
`app/components/mobile/GamesRow.vue`: on `<section v-if="games.length" class="mx-3 mt-3">` add class `games-row`; scoped style:
```css
.games-row {
  content-visibility: auto;
  contain-intrinsic-size: auto 160px;
}
```
`app/components/Footer.vue`: on the `<footer …>` root add class `site-footer`; scoped style:
```css
.site-footer {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```
Measure a real card/row/footer height on the mobile harness (`getBoundingClientRect().height` via a one-off puppeteer snippet, or read from the baseline Lighthouse `dom-size`/screenshots) and replace the three px values with the measured ones, rounded up to the nearest 8 px; state the measured values in the report.

- [ ] **Step 3: Measure (label `cv`)** — build + recipe. Accept if the median TBT drops by ≥ 80 ms **or** median Style & Layout drops by ≥ 25 % with no LCP regression (> 100 ms worse). Otherwise revert Step 2 (keep the proxy script), commit only the script, and report the numbers with status DONE_WITH_CONCERNS.

- [ ] **Step 4: Behaviour check** — with the server up, one puppeteer run (mobile viewport, real data): the page's `document.body.scrollHeight` before and after `window.scrollTo(0, document.body.scrollHeight)` differ by < 15 % (intrinsic sizes are close), the 10th match card has `getComputedStyle(card).contentVisibility === "auto"`, and clicking the first card's odds button still toggles its selected class (`bg-odds-selected`). Paste the JSON.

- [ ] **Step 5: Commit** — `perf: contain offscreen match cards, casino rows and footer` (+ `chore: add dev CORS proxy for real-data local Lighthouse runs` as part of the same commit is fine) with the Co-Authored-By trailer.

### Task 2 (controller): record results in this file, commit.
