# Lighthouse performance round 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the three remaining measured home-page costs after round 2: the Swiper chunk on the critical path (26 KB gzip, ~990 ms main thread), the triplicated `sg-categories` API call, and the 54 KB gzip render-blocking stylesheet.

**Architecture:** Nuxt 4.5.1 SSR app (`app/` is srcDir, JavaScript only, no test framework). Round 2 (`docs/superpowers/plans/2026-08-27-lighthouse-perf-round-2.md`, commits `d820e1d..e5d2b50`) took critical JS from 557 → 260 KB gzip. This round (1) replaces the home banner's Swiper with a CSS scroll-snap carousel so `swiper` leaves the home page entirely, (2) dedupes the casino categories fetch inside the Pinia store, and (3) splits CSS per chunk again but suppresses the per-component `<link rel="stylesheet">` duplicates (their content is already inlined as `<style>` by Nuxt's default `inlineStyles`), leaving one smaller blocking stylesheet.

**Tech Stack:** Nuxt 4.5.1, Vue 3.5, Pinia, Tailwind CSS 4, Vite, pnpm; Lighthouse 13 and puppeteer-core (already in the scratch npm cache) for measurement.

**Spec:** The design approved in chat on 2026-08-27 ("proceed with all three"). Measured facts it rests on: `cssCodeSplit: true` yields `entry.css` = 36,059 B gzip plus 11 component stylesheets (119–1,105 B each) on `/`, with 9 of those already inlined as `<style>` tags; `fetchCategoriesWithGames` is called on mount by `TheLanding`, `MobileTest`, `TopGames`, `HotTabsSection`, `TheSidebar`, `HotSection`, `casino-home` and the home page issues it 3× in parallel; Swiper is used by `TheBanner.vue` (home), `community-bets/BookedBetsCategory.vue`, `community-bets/SelectionsCard.vue`, `community-bets/CategoryPagination.vue`, `affiliate/AffiliateSwiper.vue`.

## Global Constraints

- JavaScript only. No TypeScript, no new `.ts` files.
- No new runtime dependencies. Do not remove `swiper` from `package.json` (four other components still use it).
- Do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- Use semantic design tokens; never add literal colours.
- Every task ends with `pnpm build` exiting 0 and the measurement recipe run with its line pasted into the report. Current line to compare against: `modulepreload=81 js_gzip=260KB stylesheets=1 css_gzip=54KB html_gzip=37KB`.
- One commit per task on `main`, message in `type: summary` style, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push.
- Never leave a server running.
- The local `.env` is written as `KEY= value` (space after `=`), so **do not `source` it** — load it with the loop in the recipe below.
- zsh gotchas: don't start an `echo` word with `=`; use `find` instead of globbing paths that might not match; quote grep patterns.

### Measurement recipe (used by every task)

```bash
cd /Users/leonardmbugua/Desktop/bandabet
pnpm build 2>&1 | tail -3                         # ~2–3 min; use a 400000 ms timeout
while IFS= read -r l; do case "$l" in \#*|"") continue;; esac; k="${l%%=*}"; v="${l#*=}"; export "${k// /}=${v## }"; done < .env
PORT=3123 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-srv.pid
sleep 4
node scripts/critical-bytes.mjs http://localhost:3123/
# ...task-specific curl checks against http://localhost:3123 ...
kill "$(cat /tmp/bandabet-srv.pid)"
```

### Headless-browser recipe (Tasks 1 and 3)

puppeteer-core and Chrome are available: `PPTR=/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad/npm-cache/_npx/ffe2131771d88588/node_modules/puppeteer-core`, executable `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Scripts live in the scratchpad directory `/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad/` and are run with `PPTR=<path> node <script>` while the server from the measurement recipe is up. Launch with `puppeteer.launch({ executablePath, headless: "new", args: ["--no-sandbox"] })`; mobile viewport `{ width: 412, height: 823, deviceScaleFactor: 2, isMobile: true, hasTouch: true }`.

---

### Task 1: Replace Swiper in the home banner with a CSS scroll-snap carousel

**Files:**
- Modify: `app/components/TheBanner.vue` (rewrite; keep the `items` array, `useHead` preload, `bannerSources`, `sizes` prop, `openBanner`, and the slide markup exactly)

**Interfaces:**
- Consumes: `useBannerImage().bannerSources(jpg)` → `{ src, srcset }`; `useDefaultSport().initDefaultSport`; prop `sizes` (string, same default as today; `app/pages/casino-home.vue:240` passes its own).
- Produces: same DOM contract for the LCP: first slide `<img loading="eager" fetchpriority="high">` inside `<picture>`, `<link rel="preload" as="image" … imagesrcset imagesizes>` in `<head>`. Mount sites (`MobileSportsLayout.vue`, `DesktopSportsLayout.vue` via `<LazyTheBanner hydrate-on-idle />`, `casino-home.vue` via `<TheBanner sizes="…" />`) are untouched.

- [ ] **Step 1: Rewrite `TheBanner.vue`**

```vue
<script setup>
import { useBannerImage } from "@/composables/useBannerImage";
import { useDefaultSport } from "@/composables/useDefaultSport";
import { useRouter } from "vue-router";

// Round 3 (Lighthouse): the banner used Swiper, which put a 26 KB gzip chunk
// and ~1 s of main-thread work (init + forced reflow) on the home page's
// critical path. The carousel is now native CSS scroll-snap: the browser
// does the swiping, and the only JS is an 8 s autoplay tick and the
// desktop prev/next buttons. Differences from the Swiper version: no
// infinite loop (autoplay wraps to the first slide), and on mobile the
// peeking next slide stops at the container edge rather than the screen edge.
const { initDefaultSport } = useDefaultSport();
const router = useRouter();
const { bannerSources } = useBannerImage();

const AUTOPLAY_DELAY_MS = 8000;

const props = defineProps({
  sizes: {
    type: String,
    default: "(min-width: 1024px) min(1000px, calc(100vw - 664px)), 100vw",
  },
});

const items = [
  { name: "Starter Free Bet", image: "/banners/banda/starter-free-bet.jpg" },
  { name: "Kick Off Bonus", image: "/banners/banda/kick-off-bonus.jpg" },
  { name: "Kick Off Bonus terms", image: "/banners/banda/kick-off-bonus-terms.jpg" },
  { name: "We serve you more action", image: "/banners/banda/we-serve-you-more-action.jpg" },
  { name: "Promo menu", image: "/banners/banda/promo-menu.jpg" },
  { name: "Real-time scores", image: "/banners/banda/real-time-scores.jpg" },
  { name: "News that rides with you", image: "/banners/banda/news-that-rides-with-you.jpg" },
  { name: "Wherever you are", image: "/banners/banda/wherever-you-are.jpg" },
];

const first = bannerSources(items[0].image);
useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: items[0].image,
      fetchpriority: "high",
      ...(first.srcset
        ? { imagesrcset: first.srcset, imagesizes: props.sizes, type: "image/webp" }
        : {}),
    },
  ],
});

const ROUTE_ALL_BANNERS_HOME = true;
function openBanner(item) {
  if (ROUTE_ALL_BANNERS_HOME) {
    router.push({ name: "home" });
    return;
  }
  if (item.to.name === "sports") {
    initDefaultSport(true);
  }
  router.push(item.to);
}

const track = ref(null);
let autoplayTimer = null;

// Index of the slide currently snapped at the start edge.
function currentIndex() {
  const el = track.value;
  if (!el || !el.firstElementChild) return 0;
  const stride = el.firstElementChild.offsetWidth + gapPx(el);
  return stride > 0 ? Math.round(el.scrollLeft / stride) : 0;
}
function gapPx(el) {
  return parseFloat(getComputedStyle(el).columnGap) || 0;
}
function goTo(index, behavior = "smooth") {
  const el = track.value;
  if (!el || !el.firstElementChild) return;
  const count = items.length;
  const target = ((index % count) + count) % count;
  const stride = el.firstElementChild.offsetWidth + gapPx(el);
  el.scrollTo({ left: target * stride, behavior });
}
function slidePrev() {
  goTo(currentIndex() - 1);
}
function slideNext() {
  goTo(currentIndex() + 1);
}

function startAutoplay() {
  stopAutoplay();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  autoplayTimer = setInterval(slideNext, AUTOPLAY_DELAY_MS);
}
function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = null;
}
function onVisibility() {
  document.hidden ? stopAutoplay() : startAutoplay();
}

onMounted(() => {
  startAutoplay();
  document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
  stopAutoplay();
  document.removeEventListener("visibilitychange", onVisibility);
});
</script>

<template>
  <div class="w-full">
    <div class="relative w-full">
      <div
        ref="track"
        class="banner-track flex w-full gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
        aria-roledescription="carousel"
        aria-label="Promotions"
      >
        <div
          v-for="(item, index) in items"
          :key="item.image"
          class="banner-slide shrink-0 snap-start"
          role="group"
          :aria-roledescription="'slide'"
          :aria-label="`${index + 1} of ${items.length}`"
        >
          <button
            type="button"
            class="relative block w-full aspect-[3/1] rounded-xl overflow-hidden group cursor-pointer ring-1 ring-gray-200/80 dark:ring-white/10"
            :aria-label="`${item.name} — open`"
            @click="openBanner(item)"
          >
            <picture>
              <source
                v-if="bannerSources(item.image).srcset"
                type="image/webp"
                :srcset="bannerSources(item.image).srcset"
                :sizes="props.sizes"
              />
              <img
                :src="item.image"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                :alt="`${item.name} banner`"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : undefined"
                decoding="async"
              />
            </picture>
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Previous banner"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden lg:flex items-center justify-center bg-card/60 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground hover:bg-card transition-all duration-200 backdrop-blur-sm"
        @click="slidePrev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
          <path fill-rule="evenodd" d="M14.78 5.22a.75.75 0 0 1 0 1.06L9.06 12l5.72 5.72a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next banner"
        class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden lg:flex items-center justify-center bg-card/60 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground hover:bg-card transition-all duration-200 backdrop-blur-sm"
        @click="slideNext"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
          <path fill-rule="evenodd" d="M9.22 5.22a.75.75 0 0 1 1.06 0l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 1 1-1.06-1.06L14.94 12 9.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* One slide plus a 10 % peek of the next on small screens (Swiper's old
   slidesPerView: 1.1); exactly one slide from lg up. The gap-3 (12 px) on the
   track is the old spaceBetween: 12. */
.banner-slide {
  width: calc((100% - 0.75rem) / 1.1);
}
@media (min-width: 1024px) {
  .banner-slide {
    width: 100%;
  }
}
.banner-track {
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
```

`ref`, `onMounted`, `onBeforeUnmount`, `useHead` are Nuxt auto-imports. `scrollbar-hide` is already a utility in this project (it is on `<html>`); confirm with `grep -n "scrollbar-hide" app/assets/css/style.css` — if it is not defined there (it may come from a plugin or `@utility`), add `.banner-track::-webkit-scrollbar { display: none } .banner-track { scrollbar-width: none }` to the scoped style instead and drop the class.

- [ ] **Step 2: Confirm nothing else on the home path imports Swiper**

```bash
grep -rn "swiper" app/components/TheBanner.vue            # expected: no output
grep -rln 'from "swiper' app                              # expected: only the 4 community-bets/affiliate files
```

- [ ] **Step 3: Build, measure, check SSR markup**

Run the measurement recipe. Expected: `js_gzip` down ~25 KB; the built home HTML contains no `swiper` chunk:

```bash
f=$(grep -l "SwiperSlide\|swiper-wrapper" .output/public/_nuxt/*.js | grep -v '\.gz$\|\.br$' | head -1); echo "swiper chunk: $f"
curl -s http://localhost:3123/ | grep -c "$(basename "$f")"           # expected 0
curl -s http://localhost:3123/ | grep -c 'class="banner-slide'          # expected 8
curl -s http://localhost:3123/ | grep -c '<link rel="preload" as="image"'  # expected 1
curl -s http://localhost:3123/ | grep -o '<img[^>]*fetchpriority="high"[^>]*>' | head -1   # first slide eager+high
```

- [ ] **Step 4: Headless behaviour check**

Write `<scratchpad>/banner-check.cjs` using the headless-browser recipe: load `/` at the mobile viewport, wait 2 s, read `track.scrollLeft` of `.banner-track` (expect 0), call `window.scrollTo(0,0)` then evaluate the first `.banner-slide` `getBoundingClientRect().width` vs the track width (expect ≈ track/1.1 minus gap share, i.e. the next slide peeks), then simulate autoplay by evaluating `document.querySelector('.banner-track').scrollBy({left: 1})` — no, instead wait 9 s and read `scrollLeft` again (expect ≈ one slide stride, proving autoplay advanced). Then set viewport to `{ width: 1366, height: 900 }`, reload, click the "Next banner" button (`page.click('button[aria-label="Next banner"]')`), wait 800 ms, and read `scrollLeft` (expect ≈ one stride); click "Previous banner", expect back to ≈ 0. Print all values as JSON and paste them in the report.

- [ ] **Step 5: Commit**

```bash
git add app/components/TheBanner.vue
git commit -m "perf: replace the home banner's Swiper with a CSS scroll-snap carousel

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Deduplicate the casino categories fetch

**Files:**
- Modify: `app/stores/casino.js` (the `fetchCategoriesWithGames` action and a module-level in-flight holder)

**Interfaces:**
- Produces: `fetchCategoriesWithGames({ force = false } = {})` — resolves immediately if `categoriesWithGames` is already populated and `force` is false; while a request is in flight, every caller awaits the same promise. Existing callers pass no arguments and keep working.

- [ ] **Step 1: Add the in-flight holder and early return**

Above `export const useCasinoStore = defineStore(` add:

```js
// One shared request for the categories payload. Several home-page
// components call fetchCategoriesWithGames() on mount (landing, sidebar,
// top games, hot tabs); before this they raced three identical
// /sg-categories requests on every load. Kept outside Pinia state so it is
// never serialised or persisted.
let categoriesRequest = null;
```

Replace the whole `fetchCategoriesWithGames` action with:

```js
    async fetchCategoriesWithGames({ force = false } = {}) {
      if (!force && this.categoriesWithGames.length) return;
      if (categoriesRequest) return categoriesRequest;
      categoriesRequest = (async () => {
        try {
          this.categoriesLoading = true;
          const { headers } = getAuthHeaders();
          // Soft-gaming tenant. Drives the sg-* casino endpoints.
          const { public: config } = useRuntimeConfig();
          const tenantCode = config.tenantCode;
          const response = await API(casinoBaseURL).get(
            `/api/v1/sg-categories/tenant/${tenantCode}`,
            { headers }
          );
          const payload = Array.isArray(response.data)
            ? response.data
            : response.data?.data ?? [];
          this.categoriesWithGames = payload.map((category) => ({
            ...category,
            games: filterHiddenGames(category.games).map(normalizeGame),
          }));
        } catch (err) {
          console.log(err);
        } finally {
          this.categoriesLoading = false;
          categoriesRequest = null;
        }
      })();
      return categoriesRequest;
    },
```

- [ ] **Step 2: Check callers still behave**

```bash
grep -rn "fetchCategoriesWithGames" app | grep -v "stores/casino.js"
```

All seven call it with no arguments (some already guard on `categoriesWithGames.length`) — no changes needed; note in the report if any passes an argument.

- [ ] **Step 3: Build, measure, verify one request**

Run the measurement recipe (JS line ±0). Then with the server up, write `<scratchpad>/sg-check.cjs` (headless recipe): load `/` at the mobile viewport, wait 4 s, and count requests whose URL contains `sg-categories` (collect via `page.on("request")`). Expected **1** (was 3). Paste the count.

- [ ] **Step 4: Commit**

```bash
git add app/stores/casino.js
git commit -m "perf: share one in-flight request for casino categories

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: One smaller render-blocking stylesheet

Measured on this codebase: with `cssCodeSplit: true`, `/` gets `entry.css` (36,059 B gzip) plus 11 component stylesheets (`SportsBetslip`, `BetBuilderSelections`, `BetslipBonus`, `BandaLogo`, `TheLanding`, `MobileSportsLayout`, `useFlyToBetslip`, `TheButton`, `MobileFooterV2`, `ColumnHeaderSearch`, `swiper-vue`; 119–1,105 B each), while the same HTML already carries 9 inlined `<style>` tags for the `.vue`-module ones (Nuxt's default `features.inlineStyles` = `id => id.includes(".vue")`). The `<link>`s for `.vue` chunks are therefore pure duplication on SSR; on client-side navigation Vite's own preload helper (`__vitePreload` / `__vite__mapDeps`, embedded in the JS) loads a chunk's CSS regardless of the SSR manifest. Non-`.vue` CSS (`useFlyToBetslip`, `swiper-vue` on other pages) is not inlined and must keep its link.

**Files:**
- Modify: `nuxt.config.js` (`vite.build.cssCodeSplit`, the existing `build:manifest` hook, and the comment block above `cssCodeSplit`)
- Modify: `app/assets/css/style.css` (add `@source not` for `docs`)

- [ ] **Step 1: Stop scanning `docs/` for Tailwind classes**

At the top of `app/assets/css/style.css`, directly after `@import "tailwindcss";`, add:

```css
@source not "../../../docs";
```

(Path is relative to the CSS file: `app/assets/css/` → repo root is `../../../`.) Verify with `ls app/assets/css/../../../docs` that it resolves to the repo's `docs/` directory.

- [ ] **Step 2: Split CSS again and drop the duplicated `.vue` stylesheet links**

In `nuxt.config.js`, change `cssCodeSplit: false,` to `cssCodeSplit: true,` and replace the multi-paragraph comment above it (the one beginning `// Task 4 (Lighthouse perf): Nuxt's default \`features.inlineStyles\``) with:

```js
      // Lighthouse round 3: CSS is split per chunk again so the render-
      // blocking entry stylesheet only carries what the entry needs
      // (~36 KB gzip instead of ~54 KB for every route's CSS merged). Nuxt's
      // default `features.inlineStyles` already inlines each .vue module's
      // CSS as a <style> tag in the SSR HTML, so the matching per-component
      // <link rel="stylesheet"> would be pure duplication on first load —
      // the build:manifest hook (hooks section) strips those links for .vue
      // chunks. Client-side navigation is unaffected: Vite's preload helper
      // embedded in the JS loads a chunk's CSS itself. Non-.vue CSS
      // (swiper-vue, useFlyToBetslip) is not inlined and keeps its link.
```

Then extend the `"build:manifest"` hook in `hooks` — keep the existing page/layout guard and preload logic exactly, and add the CSS stripping:

```js
    "build:manifest": (manifest) => {
      for (const key in manifest) {
        const chunk = manifest[key];
        const src = chunk.src ?? "";
        // Route pages and layouts are dynamic imports too, but the current
        // route needs its page + layout chunk before hydration can start —
        // leave their hints alone; only component-level dynamic entries
        // (lazily mounted modals, lazily hydrated sections) lose them.
        if (/(^|\/)(pages|layouts)\//.test(src)) continue;
        if (chunk.isDynamicEntry && !chunk.isEntry) {
          chunk.preload = false;
          chunk.prefetch = false;
        }
      }
      // Round 3: a .vue module's CSS is inlined as <style> by
      // features.inlineStyles, so its <link rel="stylesheet"> is redundant.
      // Pages and layouts are .vue modules too and get the same treatment.
      for (const key in manifest) {
        const chunk = manifest[key];
        if (chunk.isEntry) continue;
        if ((chunk.src ?? "").endsWith(".vue") && Array.isArray(chunk.css) && chunk.css.length) {
          chunk.css = [];
        }
      }
    },
```

Read `node_modules/vue-bundle-renderer/dist/runtime.mjs` once (`grep -n "css" …`) to confirm stylesheet links are derived from each module's `css` array; if the renderer reads a different field, adapt and say so in the report.

- [ ] **Step 3: Build, measure, verify link counts and inlining**

Run the measurement recipe. Expected: `stylesheets=1`, `css_gzip` ≈ 35–37 KB (from 54). Then:

```bash
for p in / /sports/soccer /leagues; do h=$(curl -s "http://localhost:3123$p"); echo "$p stylesheets=$(echo "$h" | grep -o 'rel="stylesheet"' | wc -l | tr -d ' ') style_tags=$(echo "$h" | grep -o '<style' | wc -l | tr -d ' ') code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3123$p")"; done
```

Expected: `stylesheets=1` on `/` and `/sports/soccer`; `/leagues` may show 1–2 (a non-`.vue` CSS chunk is allowed); every `style_tags` ≥ the previous merged build's count (9 on `/`).

- [ ] **Step 4: Headless client-navigation check (the real risk)**

Write `<scratchpad>/css-nav-check.cjs` (headless recipe, mobile viewport): load `/`, wait 2 s; then trigger a **client-side** navigation by evaluating `document.querySelector('a[href="/leagues"]')?.click()` — if no such link exists on the home page, use `window.__NUXT__` is not enough; instead evaluate `useNuxtApp` via `document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router.push('/leagues')`. Wait 2 s. Verify: (a) `location.pathname === "/leagues"`; (b) count `<link rel="stylesheet">` and `<style>` elements now in the document (expect new `<style>`/`<link>` entries injected by Vite for the leagues route's chunks — print both counts before and after); (c) pick one element that is styled only by a leagues-page scoped rule — `document.querySelector('[data-v-]')` is not selectable; instead read `getComputedStyle` of the page's first `main > *` child and confirm `display !== "inline"` and that `document.styleSheets.length` grew. Then push back to `/` and confirm the banner track still has `overflow-x: auto` (its scoped rule is inlined on SSR and must survive). Print all values; paste them in the report. If a route visibly loses its scoped styles after client navigation (styleSheets count does not grow and computed styles look unstyled), STOP, do not commit the manifest CSS change, and report BLOCKED with the numbers.

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.js app/assets/css/style.css
git commit -m "perf: split CSS per chunk and drop duplicated component stylesheet links

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Final measurement (controller-run)

- [ ] Lighthouse with `--throttling-method=devtools` against the local server (env loaded with the loop) and the measurement recipe; append a `## Results` section to this plan with the before/after table and commit it.
- [ ] Headless smoke: banner autoplay/next/prev, one `sg-categories` request, client navigation `/` → `/leagues` → `/` keeps styles.

## Self-review
- Coverage: chat design items 1→Task 1, 2→Task 2, 3→Task 3; verification→Task 4.
- Placeholders: none; each code step is complete. Task 3 Step 4 names its abort condition.
- Consistency: `build:manifest` hook text in Task 3 includes the round-2 guard verbatim; `fetchCategoriesWithGames` keeps its zero-arg call shape; `TheBanner.vue` keeps the `sizes` prop default that `casino-home.vue` overrides.

## Results (2026-08-27, commits db86221..HEAD)

Local build, `node .output/server/index.mjs` with the dev `.env` loaded correctly (loop, not `source`).

### Critical-path bytes on `/` (`scripts/critical-bytes.mjs`)

| Stage | modulepreload | JS gzip | stylesheets | CSS gzip |
|---|---|---|---|---|
| After round 2 | 81 | 260 KB | 1 | 54 KB |
| T1 scroll-snap banner | 82 | 261 KB | 1 | 54 KB |
| T2 categories dedupe | 82 | 261 KB | 1 | 54 KB |
| **T3 split CSS + strip duplicate links** | 82 | 261 KB | 2 | **36 KB (−33 %)** |

T1 does not move this metric because the Swiper chunk was only ever `prefetch`ed (the banner is `hydrate-on-idle`); its cost was main-thread time (~1 s incl. forced reflow), not preload bytes. The second stylesheet is `useFlyToBetslip.css` (1.1 KB, non-`.vue`, intentionally kept).

### Lighthouse 13 (Moto G Power, slow 4G, mobile), local

| Run | Perf | A11y | FCP | LCP | TBT | SI |
|---|---|---|---|---|---|---|
| Round 2 final, devtools throttling | 78 | 95 | 2.5 s | 2.5 s | 613 ms | 3.1 s |
| Round 3 final, devtools throttling | 74 | 95 | 2.7 s | 2.7 s | 665 ms | 3.4 s |
| Round 2 final, simulated | 62 | — | 4.8 s | 7.1 s | 180 ms | 4.8 s |
| Round 3 final, simulated | 60 | — | 4.9 s | 7.1 s | 194 ms | 4.9 s |

Local runs are within run-to-run noise of each other (the round-3 devtools run had an 878 ms TTFB vs 35 ms in round 2 — a cold local server, not a code change), so this round's effect must be read from the deterministic measurements: render-blocking CSS transfer 43 → 28 KB, Swiper's ~1 s of main-thread work removed, one `sg-categories` request instead of three. The deployed PSI number is the one that counts.

### Verified headless
- Banner: mobile autoplay advanced one stride (354 px on a 388 px track) in 9 s; desktop next → 714 px, prev → 0.
- `sg-categories`: 1 request on `/` (was 3); `/casino-home` still refetches (`force: true`).
- `/casino-home` (`ssr: false`, CSS arrives only via Vite's preload helper): banner track `overflow-x: auto`, slide 341.8 px on a 388 px track, 54 scoped rules present.
- CSS: `/` → `/leagues` client-side keeps every scoped style (61 elements fingerprinted identical to a direct load); betslip/deposit/login modals opened client-side have their scoped rules; 12 component stylesheets are re-added post-hydration by Vite's preload helper.

### Remaining measured candidates
1. **Login-store chunk** (24 KB gz; 484 ms long task on every page) — `plugins/auth-ssr.js` instantiates `useLoginStore()` eagerly; audit its init (crypto-js PBKDF2 at 100 iterations runs on load?) and defer what is not needed for an anonymous first paint.
2. **Style & Layout 713 ms** on load — the match list / odds grid renders ~26 sibling cards synchronously after the `matches` XHR; virtualise or render the first screen only.
3. **Entry CSS 28 KB** — Tailwind utilities still dominate; per-route splitting of the utilities layer is not possible with Tailwind 4's single `@import`, so the next lever is component-level cleanup of unused legacy classes.
