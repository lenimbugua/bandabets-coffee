# Desktop CLS, TBT and Banner Rendition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the three desktop-profile findings from the 2026-09-01 PSI report — CLS 0.145 (two ~0.07 shifts on `sports-filter-card`), TBT 1,210 ms (577 ms + 274 ms long tasks, forced reflows 385 ms unattributed + 148 ms at `DnuvRwCO.js:1:662`), and the banner fetching 960w for a ~686 px slot (21 KiB waste) — without regressing the mobile scores (perf ~100, CLS 0.001).

**Architecture:** Task 1 diagnoses the desktop layout shifts from a real trace (no guessing — `showSportsTabs` is a static prop, so the "hidden filter pops in" theory is unconfirmed; the skeleton-vs-real-row height mismatch on desktop is the other candidate since `AnimatePulse` rows mirror the *mobile* card height) and then reserves the moving element's space. Task 2 attributes the forced-reflow call sites via a sourcemapped build and batches the layout reads; it may also reorder/defer hydration cost that is clearly below the desktop fold, but no list virtualization. Task 3 adds an 800w banner rendition step (script + srcset + committed WebP assets) so the desktop picker stops overshooting to 960w. Task 4 measures desktop AND mobile locally and records results.

**Tech Stack:** existing Lighthouse harness with `--preset=desktop`, sourcemapped `pnpm build` for attribution (toggle reverted before commit), `scripts/optimize-banners.mjs`.

**Spec:** in-chat design approved 2026-09-01 ("go"); the pasted desktop PSI report is the driving evidence.

## Global Constraints

- JavaScript only; no dependency changes; semantic tokens only (no literal colours below `app/assets/css/style.css` layer 2).
- Mobile must not regress: the mobile fold, `AnimatePulse` mobile row height (~90.6 px mirroring MatchTwo), CLS 0.001, and the 640w mobile banner selection are all invariants — every task verifies its change against a mobile run/inspection too.
- No list virtualization and no behavioural changes to match rendering — Task 2 is limited to batching layout reads and hydration ordering/deferral of below-fold desktop content.
- Committed WebP renditions: generated only via `scripts/optimize-banners.mjs` (`pnpm banners:optimize` if a script alias exists — check package.json), then committed; source JPGs untouched.
- Temporary `vite.build.sourcemap` toggles must be reverted before any commit (`git diff nuxt.config.js` clean of it).
- Do not edit Dockerfile/CI/`docs/INFRA-HANDOFF.md`/`.env`; never commit `.env`/`.vercel/`. `.env` = `KEY= value`, while-read loop only. Ports 3131/5079 clean at every task end. `npm_config_cache` in the session scratchpad.
- Local Lighthouse: desktop runs use `npx lighthouse <url> --preset=desktop --throttling-method=devtools --only-categories=performance`; mobile runs use the usual flags without the preset.
- Commits: conventional, ending `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Do not push.
- `pnpm build` succeeds after every task; eslint on changed files adds nothing beyond the pre-existing auto-import `no-undef` class.

---

### Task 1: Desktop CLS — diagnose, then reserve

**Files:**
- Modify (expected, confirm by diagnosis): `app/components/AnimatePulse.vue` (desktop-height rows via a prop or responsive class) and/or `app/components/DesktopSportsLayout.vue` / `app/components/InfiniteScroll.vue` (reserved min-height), possibly `app/components/HotSection.vue` if the hero slot is the mover.

**Interfaces:**
- Produces: desktop home CLS < 0.05 locally, mobile CLS unchanged (≤ 0.01).

- [ ] **Step 1: Reproduce and attribute — no fixes yet.** Build (`pnpm build`), start on 3131 with `.env` loaded, run `npx lighthouse http://localhost:3131/ --preset=desktop --throttling-method=devtools --only-categories=performance --output=json` and read `layout-shifts` / `cumulative-layout-shift` audit details: which element(s), at what timestamps, how many px. Cross-check with a second run. Record the culprit chain in the report (the PSI report blames `div.sports-filter-card` twice at ~0.073 each). Candidate mechanisms to confirm or eliminate: (a) `AnimatePulse` skeleton rows (10 × ~90.6 px mobile height) being shorter/taller than real desktop match rows so the card height jumps when data lands; (b) the hero slot (`HotSection`/`LivePreview`) inserting height above the card after hydration; (c) the web-font swap (PSI showed a small font shift — likely not the 0.073 pair); (d) `MatchFilters` chip row height changing when sports data arrives.
- [ ] **Step 2: Fix by reserving space for the ACTUAL culprit.** Rules: reserve with CSS (fixed heights, `min-height`, or matching skeleton row heights per breakpoint — e.g. give `AnimatePulse` a desktop row height matching the real desktop match-row height, measured from the DOM in Step 1), never by delaying render; keep mobile pixel-identical (use `md:`/`lg:` variants or a prop passed only from desktop callers); semantic tokens only. If the culprit is the hero slot, reserve its box the way `HotTabsSection`'s mobile hero skeleton already does (same pattern, desktop dimensions).
- [ ] **Step 3: Verify.** Rebuild; desktop Lighthouse ×2: CLS < 0.05 and the `sports-filter-card` no longer appears in layout-shift culprits. Mobile Lighthouse ×1: CLS ≤ 0.01 and FCP/LCP within noise of the pre-task run (do a pre-task mobile baseline run in Step 1). Kill servers.
- [ ] **Step 4: Commit** — `fix(perf): reserve desktop match-list space to kill sports-card layout shifts` (adjust wording to the actual culprit) + trailer.

---

### Task 2: Desktop TBT — attribute reflows, batch reads, defer below-fold hydration cost

**Files:**
- Modify: the app files the attribution names (deployed offsets to resolve: `DnuvRwCO.js:1:662` = 148 ms, plus the 385 ms unattributed block; known-parked: `BWrfnNKR.js:3:2100` is Nuxt's hydrate-on-visible internals)
- Possibly modify: `app/components/DesktopSportsLayout.vue` / `app/components/TheLanding.vue` (hydration deferral of below-desktop-fold content)
- Temporarily: `nuxt.config.js` sourcemap toggle (reverted)

**Interfaces:**
- Consumes: Task 1's committed state (rebuild after it).
- Produces: desktop TBT reduction target ≥ 25% locally (from whatever the local baseline measures — record it first; PSI showed 1,210 ms with 832 ms Style & Layout).

- [ ] **Step 1: Baseline + attribution.** Desktop Lighthouse baseline ×2 (record TBT, long tasks, forced-reflow entries). Build once with `vite.build.sourcemap: true`; rerun; resolve the reflow call sites to app code via the local `.map` files (the local chunk names will differ from the deployed ones — match by reflow duration/shape, then read the mapped source). Name file:line for each ≥50 ms reflow source in the report. Revert the toggle.
- [ ] **Step 2: Fix the attributed reads.** For app-code reflow sources: batch geometry reads (read once per frame into locals; move reads out of loops; use `requestAnimationFrame` boundaries where a read follows writes). Precedent: the `useScrollToSelectedSport` guard from the previous round. Framework-internal sources get documented and parked, not patched.
- [ ] **Step 3: Below-fold hydration deferral (bounded).** From the desktop fold (1350×940 viewport screenshot), identify content hydrating eagerly but starting below the fold (candidates: `LazyFooter` is done; check `SEOMarkupContent`, promo strips, the tail of the 200-row match list is NOT in scope — no virtualization). Apply `Lazy*` + `hydrate-on-visible` ONLY where there is real SSR markup to hydrate (the previous round documented that client-only content gets nothing from hydration strategies — chunk-split is still fine); keep props identical; use correct auto-registration names (`Mobile*` prefix pitfall — check `.nuxt/components.d.ts`).
- [ ] **Step 4: Verify.** Rebuild (no sourcemap); desktop Lighthouse ×2 vs Step 1 baseline: report TBT delta and long-task list; mobile Lighthouse ×1: TBT/FCP within noise, no hydration warnings in dev console spot-check. Kill servers.
- [ ] **Step 5: Commit** — `perf: batch desktop layout reads and defer below-fold hydration` + trailer.

---

### Task 3: 800w banner rendition

**Files:**
- Modify: `scripts/optimize-banners.mjs:16` (`const widths = [640, 800, 960, 1280, 1600]`)
- Modify: `app/composables/useBannerImage.js:15` (same list in the srcset)
- Create: the generated `public/banners/banda/*-800.webp` files (committed)

**Interfaces:**
- Produces: desktop picker selects 800w (slot ≈ 686 CSS px @ DPR 1 → smallest ≥ 686 becomes 800, saving ~20 KiB); mobile still selects 640w (611 device px < 640 — unchanged).

- [ ] **Step 1:** Add 800 to both width lists. Run the optimizer (check `package.json` for the alias, else `node scripts/optimize-banners.mjs`) → confirm every `public/banners/banda/*.jpg` gains a `-800.webp` sibling (including `placeholder`); no other files touched (`git status`).
- [ ] **Step 2:** `pnpm build`; serve; `curl -s http://localhost:3131/ | grep -o 'imagesrcset="[^"]*"' | head -1` shows the 800w entry. Picker math recorded in the report: desktop 686 → 800 ✓, mobile 611 → 640 ✓ (unchanged). Optionally confirm via a desktop Lighthouse run's network items (`…-800.webp` requested). Kill servers.
- [ ] **Step 3:** Commit — `perf: add 800w banner rendition for the desktop slot` + trailer (include the .webp files).

---

### Task 4: Measure and record

**Files:**
- Modify: `docs/superpowers/plans/2026-09-01-desktop-cls-tbt-round.md` (append `## Results`)

- [ ] **Step 1:** Full build; local Lighthouse: desktop ×2 AND mobile ×2 on `/` (devtools throttling; desktop runs with `--preset=desktop`). Record per profile: perf, FCP/LCP/TBT/CLS/SI, layout-shift culprits (should exclude `sports-filter-card`), forced-reflow entries, and the banner rendition requested per profile (desktop `…-800.webp`, mobile `…-640.webp`). `node scripts/critical-bytes.mjs` line.
- [ ] **Step 2:** Append `## Results`: PSI desktop baseline (CLS 0.145, TBT 1,210 ms, banner 960w/21 KiB) vs after; per-task outcomes incl. the actual CLS culprit found; parked items.
- [ ] **Step 3:** Commit — `docs: results for the desktop CLS/TBT round` + trailer.
