# Lighthouse performance round 5 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the forced-reflow hotspot that VueUse's `useDark` runs after hydration (the largest single self-time function on the home page), stop the banner from downloading all eight slides up front and pick the right banner size on desktop, and clear the splash's non-composited-animation warning.

**Architecture:** Nuxt 4.5.1 SSR app, JavaScript only. Deployed at `https://bandabets-coffee.vercel.app` (round 3 confirmed live there). PSI + local CPU profile (live data via `scripts/dev-cors-proxy.mjs`) show: (1) VueUse `useDark`/`useColorMode` with its default `disableTransition: true` injects a `<style>*{transition:none!important}</style>`, reads `getComputedStyle(el).opacity` (a forced full-document style recalc) and removes it, on every instance's immediate watcher — the app creates several instances per page (`useThemeSwitch()` in `app.vue` and `ThemeSwitch.vue` inside `HeaderLinks`, plus bare `useDark()` in `TheSidebar`, `ExploreContent`, `SportsIconsModal`, `DarkBorderDivider`); PSI attributes 154 ms of forced reflow and a 297 ms long task to it, and the 4×-throttled profile shows 116 ms self-time in that routine. (2) The banner's eight slides all download on load (six of them lazy but inside a horizontal scroller Chrome does not defer), ≈235 KB competing with the LCP image; on desktop `sizes` overstates the rendered width (960w chosen for a 598 px slot). (3) The splash `@keyframes splash-out` animates `visibility`, which Lighthouse flags as non-composited.

**Tech Stack:** Nuxt 4.5.1, Vue 3.5, VueUse 14, Tailwind CSS 4; measurement via the round-4 real-data harness.

**Spec:** Chat 2026-08-27 ("proceed to the next level") plus the PSI report pasted for `bandabets-coffee.vercel.app`. Baseline (local, devtools throttling, live data; medians of 3 from round 4): **perf 81, LCP 2.09 s, TBT 610 ms, SI ~2.9 s; Style & Layout 554 ms; longest task 483 ms.**

## Global Constraints
- JavaScript only; no new dependencies; semantic tokens only; do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- The Tailwind `dark:` variant is `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` (`app/assets/css/style.css:518`) — the theme is carried by `data-theme` on `<body>`; the `html.dark` class that bare `useDark()` instances add is used by nothing.
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
PORT=3131 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-r5.pid
sleep 4
export npm_config_cache=$S/npm-cache
for i in 1 2 3; do npx --yes lighthouse@latest http://localhost:3131/ --only-categories=performance --throttling-method=devtools --output=json --output-path=$S/lh-r5-<label>-$i.json --chrome-flags="--headless=new --no-sandbox" --quiet 2>&1 | tail -1; done
kill "$(cat /tmp/bandabet-r5.pid)" "$(cat /tmp/bandabet-proxy.pid)"
for i in 1 2 3; do node -e 'const r=require(process.argv[1]);const a=r.audits;const m=a.metrics.details.items[0];const mt=Object.fromEntries(a["mainthread-work-breakdown"].details.items.map(i=>[i.group,Math.round(i.duration)]));const lt=a["long-tasks"].details.items;const fr=a["forced-reflow-insight"];console.log("perf",Math.round(r.categories.performance.score*100),"LCP",m.largestContentfulPaint,"TBT",m.totalBlockingTime,"SI",Math.round(m.speedIndex),"styleLayout",mt.styleLayout,"script",mt.scriptEvaluation,"longest",lt.length?Math.round(Math.max(...lt.map(t=>t.duration))):0,"forcedReflowScore",fr&&fr.score)' $S/lh-r5-<label>-$i.json; done
```
Three runs per variant, compare medians. Headless-browser details (puppeteer path, Chrome path, viewport) are in the shared context file next to the task briefs.

---

### Task 1: One theme instance, no forced reflow

**Files:**
- Modify: `app/composables/useThemeSwitch.js`
- Modify: `app/components/TheSidebar.vue:10,15`, `app/components/ExploreContent.vue:4,37`, `app/components/SportsIconsModal.vue:11,19`, `app/components/DarkBorderDivider.vue:2,10` (replace bare `useDark()` with the shared ref)
- Modify: `app/components/BrandSplash.vue` (keyframes)

**Interfaces:**
- Produces: `useThemeSwitch()` returns the same keys (`isDark`, `changeTheme`, `switchToDark`, `toggleToUserSavedTheme`), but `isDark` is now a single shared ref created once per app (client) with `disableTransition: false`.

- [ ] **Step 1: Baseline (label `base`)** — run the recipe on the unmodified build; record the three lines.

- [ ] **Step 2: Share one `useDark` instance and drop the transition hack**

Rewrite `app/composables/useThemeSwitch.js`:
```js
import { useDark, useToggle } from "@vueuse/core";
import { useLoginStore } from "@/stores/login";
import { storeToRefs } from "pinia";

// One useDark instance for the whole app. Every call used to create its own
// (app.vue, ThemeSwitch, TheSidebar, ExploreContent, …) and each instance's
// immediate watcher ran VueUse's transition-suppression routine: inject a
// <style>*{transition:none!important}</style>, read getComputedStyle().opacity
// (a forced style recalculation over the entire document), remove it. On the
// home page that was the largest single JavaScript cost after hydration.
// disableTransition:false skips that routine entirely; theme toggles simply
// let elements with transition-colors animate, which is the nicer behaviour.
let shared = null;
function themeRef() {
  if (!shared) {
    shared = useDark({
      selector: "body",
      attribute: "data-theme",
      valueDark: "dark",
      valueLight: "light",
      disableTransition: false,
    });
  }
  return shared;
}

export function useThemeSwitch() {
  const { isAuthenticated } = storeToRefs(useLoginStore());
  const { themeSwitch } = useLoginStore();
  const isDark = themeRef();
  const toggleDark = useToggle(isDark);

  function toggleToUserSavedTheme(userTheme) {
    toggleDark();
    if (parseInt(userTheme) === 0 && !isDark.value) {
      toggleDark();
    } else if (parseInt(userTheme) === 1 && isDark.value) {
      toggleDark();
    }
  }
  function changeTheme() {
    toggleDark();
    if (isAuthenticated.value) {
      let theme = isDark.value ? 0 : 1;
      themeSwitch(theme);
    }
  }
  function switchToDark() {
    if (!isDark.value) {
      toggleDark();
    }
  }
  return {
    isDark,
    changeTheme,
    switchToDark,
    toggleToUserSavedTheme,
  };
}
```
Keep the existing module's other exports/comments if any beyond what is shown (read the file first; the body above replaces the function and adds `themeRef`). SSR note: `useDark` is SSR-safe (guards on `window`); a module-level ref on the server is shared across requests but only ever holds the default — the body attribute is set client-side. If `useThemeSwitch` is called during SSR anywhere (`grep -rn "useThemeSwitch" app`), state in the report whether that path reads `isDark` during render; if it does, replace the module-level singleton with `useState("theme-is-dark", …)`-style per-request state and explain.

Then in the four components replace the bare instance:
- `app/components/TheSidebar.vue`: delete `import { useDark } from "@vueuse/core";` and change `const isDark = useDark();` → `const { isDark } = useThemeSwitch();` (add `import { useThemeSwitch } from "@/composables/useThemeSwitch";` if the file does not rely on auto-imports — check the file's existing import style and match it).
- Same edit in `ExploreContent.vue`, `SportsIconsModal.vue`, `DarkBorderDivider.vue`.
Confirm afterwards: `grep -rn "useDark" app` lists only `app/composables/useThemeSwitch.js`.

- [ ] **Step 3: Splash keyframes without `visibility`**

In `app/components/BrandSplash.vue`, remove `visibility: hidden;` from `@keyframes splash-out` (keep `opacity: 0` and `transform`). The overlay already has `pointer-events-none` and is unmounted at `SPLASH_TOTAL_MS`; an invisible-but-present node for ≤400 ms is acceptable. Update the timeline comment's last line accordingly ("fades; unmounted by JS at 1100 ms").

- [ ] **Step 4: Measure (label `theme`)** — build + recipe. Accept if median TBT drops ≥ 100 ms **or** the `forced-reflow-insight` score goes from 0 to 1 (Lighthouse's pass), with no LCP regression > 100 ms. If neither, revert Step 2 (keep Step 3), report DONE_WITH_CONCERNS with the numbers. Also confirm the theme still works: puppeteer at mobile viewport → `document.body.getAttribute("data-theme")` is `"dark"` after load; then call `document.querySelector('#__nuxt').__vue_app__` … simpler: evaluate `localStorage.setItem("vueuse-color-scheme","light")`, reload, and check `data-theme === "light"`; then set it back to `"dark"`. Paste the JSON.

- [ ] **Step 5: Commit** — `perf: share one theme instance and drop VueUse's forced-reflow transition hack` (+ the splash keyframe change in the same commit is fine).

---

### Task 2: Banner slides load on demand; correct desktop `sizes`

**Files:**
- Modify: `app/components/TheBanner.vue`

**Interfaces:** unchanged. First slide keeps `loading="eager" fetchpriority="high"` + the `useHead` preload. Slides 2–8 get their `srcset`/`src` only when their slide enters the track's 200 px margin (IntersectionObserver with `root: track`).

- [ ] **Step 1: Desktop `sizes`** — PSI (desktop 1350 px viewport) rendered the banner at 598 px while `sizes` resolved to `calc(100vw - 664px)` = 686 px, selecting `960w`. Measure the real slot width at 1350 px and at 1024 px on the local server (puppeteer `page.setViewport({width, height: 900})`, `document.querySelector(".banner-slide").getBoundingClientRect().width`) and set the default `sizes` to `(min-width: 1024px) min(1000px, calc(100vw - <chrome>px)), 100vw` where `<chrome>` = viewport − measured width at 1350 (expected ≈ 752). Check the 1024 px measurement is consistent (same chrome) — if the chrome differs between the two widths, use the larger value so the browser never under-selects. `casino-home.vue` passes its own `sizes`; leave it.

- [ ] **Step 2: Lazy slides** — in `TheBanner.vue`:
  - Keep slide 0 exactly as is.
  - For `index > 0`, render `<source>` and `<img>` with `:srcset="loaded.has(index) ? bannerSources(item.image).srcset : undefined"` and `:src="loaded.has(index) ? item.image : PLACEHOLDER"` where `PLACEHOLDER` is the same 1×1 GIF data URI used in `app/components/casino/NearViewportImage.vue` (copy the constant). Keep `loading="lazy" decoding="async"` and the class list.
  - `const loaded = reactive(new Set([0]))`; in `onMounted`, create one `IntersectionObserver` with `{ root: track.value, rootMargin: "0px 200px" }` observing every `.banner-slide`; when a slide intersects, add its index (`data-index` attribute) to `loaded` and unobserve it. Disconnect in `onBeforeUnmount`. Without `IntersectionObserver` support, add all indices immediately.
  - Autoplay calls `slideNext()` which scrolls — the observer fires as the next slide enters the margin, so the image is requested ~1 slide ahead. That is the intended behaviour.

- [ ] **Step 3: Verify** — build; server + proxy up; puppeteer mobile: count requests matching `/banners/banda/` at load (expected **2**: the LCP `-960.webp` from the preload/first slide, plus at most one prefetched neighbour — state the exact list), then after 9 s of autoplay (expected +1). Desktop 1350 viewport: the first slide's `currentSrc` ends with `-640.webp` (expected once `sizes` is corrected). Also curl the SSR HTML: slides 2–8 contain the placeholder `src` and no `-960.webp` srcset; slide 1 unchanged; the `<link rel="preload" as="image">` still present. Run the measurement recipe (label `banner`) — expected LCP ≤ baseline (less bandwidth contention), TBT unchanged.

- [ ] **Step 4: Commit** — `perf: load banner slides on demand and size the desktop banner correctly`.

### Task 3 (controller): final measurement + results section.

## Self-review
- Coverage: hotspot→T1, banner bytes/sizes→T2, splash warning→T1 Step 3. The `useFlyToBetslip.css` second blocking stylesheet (1.3 KB, parallel with entry.css) is deliberately left — its chunk is named after a composable but carries two components' scoped CSS; stripping it needs content inspection in the manifest hook (deferred, noted in Results).
- Placeholders: none; accept rules numeric; each step names its verification.
- Consistency: `useThemeSwitch()` return keys unchanged for `app.vue`, `ThemeSwitch.vue`, `stores/login.js`; `PLACEHOLDER` constant identical to `NearViewportImage.vue`.
