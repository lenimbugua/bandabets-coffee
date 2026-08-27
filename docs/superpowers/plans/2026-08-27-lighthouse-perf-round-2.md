# Lighthouse performance round 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the mobile Lighthouse performance score of the home page (`/`) from 54 to 80+ by shrinking the JavaScript and CSS the browser must download before first paint, deferring non-critical work, and fixing the splash that hides the rendered page.

**Architecture:** Nuxt 4.5.1 SSR app (`app/` is srcDir, JavaScript only, no test framework). The home page is SSR-rendered and then hydrated; Lighthouse's slow-4G simulation charges every high-priority request in flight before first paint against FCP/LCP. Today `/` ships 86 `modulepreload`ed chunks (583 KB gzip) plus a 62 KB gzip render-blocking stylesheet. The plan removes dead code from the entry chunk (datepicker), defers analytics (mixpanel), stops mounting ~24 modal components on every page, lazy-hydrates below-the-fold sections, makes the brand splash dismiss itself with CSS instead of a post-hydration timer, slims the login chunk (crypto-js, sweetalert2), loads casino thumbnails only near the viewport, and fixes the accessibility items Lighthouse listed.

**Tech Stack:** Nuxt 4.5.1, Vue 3.5, Pinia, Tailwind CSS 4, Vite (via Nuxt), pnpm. Lighthouse 13 via `npx` for measurement.

**Spec:** No separate spec file. The requirements are the assessment approved in chat on 2026-08-27 ("proceed"), restated per task below. Measured baseline (Lighthouse 13.4.1, Moto G Power emulation, slow 4G, against `https://bandabets.vercel.app/`): **score 54, FCP 4.4 s, LCP 4.8 s, TBT 490 ms, CLS 0.024, SI 7.8 s**; `/` HTML carries **86 `rel="modulepreload"` links = 583 KB gzip of JS** and **1 stylesheet = 62 KB gzip (463 KB raw)**.

## Global Constraints

- JavaScript only. No TypeScript, no new `.ts` files (an existing `app/components/Lazy.vue` uses `<script lang="ts">` — leave it alone).
- No new runtime dependencies. Removing dependencies is expected (`@vuepic/vue-datepicker`). No `sharp`, no `@nuxt/image`, nothing that needs a native binary at runtime — production runs `node .output/server/index.mjs` in a Docker image owned by another team and **nothing may require a change to that image**.
- Do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- Use semantic design tokens (`text-muted-foreground`, `bg-card`, …); never add literal colours below layer 2 of `app/assets/css/style.css`.
- Every task ends with `pnpm build` exiting 0 and the **measurement recipe** below run and its numbers pasted into the task report.
- One commit per task on the current branch (`main`), message in the repo's `type: summary` style, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push — the controller pushes.
- Never leave a server running: every recipe that starts one kills it.
- zsh gotchas on this machine: `echo "===X==="` fails (glob) — quote or avoid `=` at the start of a word; `ls path/*.vue` with no match aborts the command — use `find`.

### Measurement recipe (used by every task)

```bash
cd /Users/leonardmbugua/Desktop/bandabet
pnpm build 2>&1 | tail -3
set -a; source .env; set +a          # runtime env for the local server (gitignored, present locally)
PORT=3123 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-srv.pid
sleep 4
node scripts/critical-bytes.mjs http://localhost:3123/    # created in Task 0
kill "$(cat /tmp/bandabet-srv.pid)"
```

`scripts/critical-bytes.mjs` prints: `modulepreload=<n> js_gzip=<KB> stylesheets=<n> css_gzip=<KB> html_gzip=<KB>`. Paste that line in the report.

### Lighthouse recipe (Task 0 baseline and Task 9 final only — slow, ~90 s)

```bash
cd /Users/leonardmbugua/Desktop/bandabet
set -a; source .env; set +a
PORT=3123 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-srv.pid
sleep 4
export npm_config_cache=/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad/npm-cache
npx --yes lighthouse@latest http://localhost:3123/ --only-categories=performance,accessibility \
  --output=json --output-path=/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad/lh-<label>.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
kill "$(cat /tmp/bandabet-srv.pid)"
node -e 'const r=require(process.argv[1]);const a=r.audits;console.log("perf",Math.round(r.categories.performance.score*100),"a11y",Math.round(r.categories.accessibility.score*100));for(const k of ["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index"])console.log(k,a[k].displayValue)' /private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad/lh-<label>.json
```

(The isolated `npm_config_cache` matters: the default npm cache on this machine has a permissions problem that makes `npx lighthouse` fail.) Local numbers are only comparable to other local numbers — the deployed baseline above was measured from Google's infrastructure.

---

### Task 0: Measurement tooling + local baseline

**Files:**
- Create: `scripts/critical-bytes.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `node scripts/critical-bytes.mjs <url>` → one line `modulepreload=N js_gzip=K stylesheets=N css_gzip=K html_gzip=K`. Every later task pastes this line.

- [ ] **Step 1: Write the script**

```js
// scripts/critical-bytes.mjs
// Sums the gzip size of everything the home page HTML preloads before first
// paint: every <link rel="modulepreload"> chunk, the entry <script type="module">,
// and every <link rel="stylesheet">. Sizes come from the .gz siblings that
// nitro.compressPublicAssets writes next to each file in .output/public.
// Usage: node scripts/critical-bytes.mjs http://localhost:3123/
import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/critical-bytes.mjs <url>");
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), "..", ".output", "public");

const html = await (await fetch(url)).text();
const hrefs = (re) => [...html.matchAll(re)].map((m) => m[1]);
const js = new Set([
  ...hrefs(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ...hrefs(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
]);
const css = new Set(hrefs(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g));

const gz = (href) => {
  const p = join(root, href.replace(/^\//, ""));
  try {
    return statSync(p + ".gz").size;
  } catch {
    return gzipSync(readFileSync(p)).length;
  }
};
const sum = (set) => [...set].reduce((s, h) => s + gz(h), 0);
const kb = (n) => Math.round(n / 1024);

console.log(
  `modulepreload=${js.size - 1} js_gzip=${kb(sum(js))}KB stylesheets=${css.size} css_gzip=${kb(sum(css))}KB html_gzip=${kb(gzipSync(Buffer.from(html)).length)}KB`,
);
```

(`js.size - 1` reports the modulepreload count without the entry script, matching what Lighthouse's HTML shows.)

- [ ] **Step 2: Add the npm script**

In `package.json` `"scripts"`, add after `"banners:optimize"`:

```json
"perf:critical": "node scripts/critical-bytes.mjs http://localhost:3123/"
```

- [ ] **Step 3: Build, run the measurement recipe, record the baseline**

Run the measurement recipe from Global Constraints. Expected shape (numbers will be close to): `modulepreload=86 js_gzip=58xKB stylesheets=1 css_gzip=6xKB html_gzip=4xKB`. Record the exact line in the report as **BASELINE**.

- [ ] **Step 4: Run the Lighthouse recipe with label `baseline`**

Record perf score, FCP, LCP, TBT, CLS, SI in the report as **LOCAL BASELINE**. If `npx lighthouse` fails, paste the error and continue — the byte measurement is the per-task gate; Lighthouse is only needed again in Task 9.

- [ ] **Step 5: Commit**

```bash
git add scripts/critical-bytes.mjs package.json
git commit -m "chore: add critical-bytes measurement script for Lighthouse work

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 1: Remove the unused datepicker

`@vuepic/vue-datepicker` (+ `date-fns`, `@date-fns/tz`) is registered globally by `app/plugins/datepicker.client.js` but **no component uses it** — `grep -rniE 'datepicker|<date-picker|dp__' app` matches only the plugin and a CSS block in `style.css`. It costs roughly a quarter of the 225 KB gzip entry chunk plus 22 KB of raw CSS.

**Files:**
- Delete: `app/plugins/datepicker.client.js`
- Modify: `app/assets/css/style.css:1363-1398` (the `/* Datepicker — driven entirely by semantic tokens */` block and `.datepicker-fix-zindex`)
- Modify: `package.json` (dependency removed by pnpm), `pnpm-lock.yaml`

- [ ] **Step 1: Prove it is unused**

```bash
grep -rniE 'VueDatePicker|vue-datepicker|<date-picker|datepicker-fix-zindex|dp__' app | grep -v 'app/plugins/datepicker.client.js' | grep -v 'assets/css/style.css'
```

Expected: no output. If anything prints, STOP and report it — the task premise is wrong.

- [ ] **Step 2: Delete the plugin and the dependency**

```bash
git rm app/plugins/datepicker.client.js
pnpm remove @vuepic/vue-datepicker
```

Confirm `package.json` no longer lists `@vuepic/vue-datepicker` and that `date-fns` does not appear as a direct dependency (it never did — it was transitive).

- [ ] **Step 3: Remove the datepicker CSS**

In `app/assets/css/style.css`, delete the whole block starting at the comment `/* Datepicker — driven entirely by semantic tokens */` through the closing `}` of `.dp__theme_dark, .dp__theme_light { … }`, and delete the `.datepicker-fix-zindex { z-index: 9999 !important; }` rule that follows it. Keep `.iframe-container` (the next rule) intact.

- [ ] **Step 4: Build, measure**

Run the measurement recipe. Expected: `modulepreload` unchanged (86), `js_gzip` down by ~80–100 KB vs BASELINE, `css_gzip` down slightly. Also confirm the datepicker is gone from the build:

```bash
grep -l "data-dp-action-element" .output/public/_nuxt/*.js | wc -l   # expected 0
```

- [ ] **Step 5: Commit**

```bash
git add -A app/plugins app/assets/css/style.css package.json pnpm-lock.yaml
git commit -m "perf: remove unused vue-datepicker plugin, dependency and CSS

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Load Mixpanel after idle, core build only

`mixpanel-browser` is the single largest item in the entry chunk (~40 % of it). The plugin `app/plugins/mixpanel.client.js` imports the full module synchronously. Only two composables touch it — `app/composables/useMixpanel.js` (returns `$mixpanel`) and `app/composables/useMixpanelTrackActivity.js` — and across the app the only methods called are `track`, `identify` and `people.set` (verified with `grep -rhoE 'mixpanel\.(people\.)?[a-zA-Z_]+\(' app`).

**Files:**
- Modify: `app/plugins/mixpanel.client.js` (rewrite)

**Interfaces:**
- Produces: `useNuxtApp().$mixpanel` keeps the same call surface: `track(event, props)`, `identify(id)`, `people.set(props)`. Calls made before the library loads are queued and replayed in order. New: `$mixpanel.ready` (Promise resolving to the real mixpanel instance) for anything that needs the raw object later.

- [ ] **Step 1: Rewrite the plugin**

```js
// app/plugins/mixpanel.client.js
//
// Mixpanel is deferred: the library (core build, no session-recorder) is
// dynamically imported after the browser is idle, so it is not part of the
// entry chunk and never competes with first paint. Until it arrives,
// $mixpanel is a thin queue with the same call surface the app uses
// (track / identify / people.set); queued calls replay in order once the
// real instance is initialised.
const MIXPANEL_TOKEN = "855f027f4230678f61f56685e72643b4";

export default defineNuxtPlugin(() => {
  let real = null;
  const queue = [];

  const call = (method, args) => {
    if (real) {
      method === "people.set" ? real.people.set(...args) : real[method](...args);
    } else {
      queue.push([method, args]);
    }
  };

  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const proxy = {
    track: (...args) => call("track", args),
    identify: (...args) => call("identify", args),
    people: { set: (...args) => call("people.set", args) },
    ready,
  };

  const load = async () => {
    try {
      const { default: mixpanel } = await import(
        "mixpanel-browser/src/loaders/loader-module-core"
      );
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: import.meta.dev,
        track_pageview: true,
      });
      real = mixpanel;
      for (const [method, args] of queue.splice(0)) call(method, args);
      resolveReady(mixpanel);
    } catch (err) {
      // Analytics must never break the app; keep queuing silently.
      if (import.meta.dev) console.warn("[mixpanel] failed to load", err);
    }
  };

  const idle =
    typeof window.requestIdleCallback === "function"
      ? (cb) => window.requestIdleCallback(cb, { timeout: 5000 })
      : (cb) => setTimeout(cb, 1500);
  idle(load);

  return { provide: { mixpanel: proxy } };
});
```

`mixpanel-browser/src/loaders/loader-module-core.js` exists in the installed package (2.80.0) and is `export default mixpanel` built from `init_as_module` — the core library without the session-replay/heatmap async modules. The package has no `exports` map, so the deep import is allowed.

- [ ] **Step 2: Check nothing else touches `$mixpanel` beyond the proxied surface**

```bash
grep -rnE '\$mixpanel|useMixpanel\(' app | grep -v 'app/plugins/mixpanel.client.js'
grep -rhoE 'mixpanel\.(people\.)?[a-zA-Z_]+\(' app | sort | uniq -c
```

Expected second output: only `identify(`, `init(` (from the plugin itself), `people.set(`, `track(`. If another method appears, add it to `proxy` the same way.

- [ ] **Step 3: Build, measure**

Run the measurement recipe. Expected: `js_gzip` down another ~50–70 KB. Confirm mixpanel left the critical path:

```bash
# find which chunk(s) hold mixpanel and check they are not preloaded on /
grep -l "mixpanel" .output/public/_nuxt/*.js | grep -v '\.gz$\|\.br$'
```

Take the chunk filename(s) printed and confirm none of them appear in the home HTML's `modulepreload` list (fetch `http://localhost:3123/` while the server is up and `grep -c "<chunk-name>"` → expected 0).

- [ ] **Step 4: Runtime smoke test**

Start the server (recipe), then:

```bash
curl -s http://localhost:3123/ | grep -c "mixpanel"     # expected 0 — nothing inline
```

and in the report state that the `$mixpanel` calls in `useMixpanelTrackActivity.js` still resolve (they go through the proxy; no code change there).

- [ ] **Step 5: Commit**

```bash
git add app/plugins/mixpanel.client.js
git commit -m "perf: defer mixpanel to idle and use the core build without session replay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Mount modals only after they are first opened

`app/components/CollectAllModals.vue` (rendered in `app/app.vue` on every page) mounts ~24 modal components eagerly. Every one of them gates its own visibility on `modalType.value === <type> && showModal.value` from `useModalStore()` (verified for all of them), and `closeModal()` sets `modalType = null` immediately. So: mount each modal lazily the **first time its type is opened, and keep it mounted afterwards** — that loads a modal's chunk only on first use and preserves its close transition (which would be cut off by a plain `v-if="modalType === x"` because `modalType` clears before the leave transition runs).

`BetslipModal` + `SportsBetslip` stay eager (the betslip is core UI). `CasinoSidebar` in `app.vue` gets the same async treatment (it is `v-if`-gated on casino mode already).

**Files:**
- Modify: `app/components/CollectAllModals.vue` (rewrite)
- Modify: `app/app.vue:1` (CasinoSidebar import)

**Interfaces:**
- Consumes: `useModalTypes()` keys (`app/composables/useModalTypes.js`), `useModalStore().modalType`.
- Produces: nothing new; same DOM when a modal is open.

- [ ] **Step 1: Rewrite `CollectAllModals.vue`**

```vue
<script setup>
import { defineAsyncComponent, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useBetslipStore } from "@/stores/sports-betslip";
import BetslipModal from "./BetslipModal.vue";

// Every modal below gates itself on `modalType === <type> && showModal`, so
// none of them render anything until opened. Mounting all ~24 eagerly still
// pulls every chunk into the initial modulepreload set. Instead, a modal is
// mounted the first time its type is opened and stays mounted afterwards —
// closeModal() nulls modalType immediately, so a plain v-if on the current
// type would unmount mid leave-transition.
const lazy = (loader) => defineAsyncComponent(loader);
const TheDrawer = lazy(() => import("./TheDrawer.vue"));
const BetPlaceStatusDialogue = lazy(() => import("./BetPlaceStatusDialogue.vue"));
const SearchModal = lazy(() => import("./SearchModal.vue"));
const CalendarModal = lazy(() => import("./CalendarModal.vue"));
const LoginModal = lazy(() => import("./LoginModal.vue"));
const CasinoUnauthModal = lazy(() => import("./CasinoUnauthModal.vue"));
const DepositModal = lazy(() => import("./DepositModal.vue"));
const ChatModal = lazy(() => import("./ChatModal.vue"));
const ShareBetModal = lazy(() => import("@/components/community-bets/ShareBetModal.vue"));
const BookedBetPreviewModal = lazy(() => import("@/components/community-bets/BookedBetPreviewModal.vue"));
const ConfirmModal = lazy(() => import("./ConfirmModal.vue"));
const CancelBet = lazy(() => import("./CancelBet.vue"));
const InsufficientBalanceModal = lazy(() => import("./InsufficientBalanceModal.vue"));
const CashoutModal = lazy(() => import("./cashout/CashoutModal.vue"));
const RoadBlockModal = lazy(() => import("./RoadBlockModal.vue"));
const LoaderModal = lazy(() => import("./LoaderModal.vue"));
const SportsIconsModal = lazy(() => import("./SportsIconsModal.vue"));
const ChangeEventModal = lazy(() => import("./ChangeEventModal.vue"));
const SocialconsModal = lazy(() => import("@/components/affiliate/SocialconsModal.vue"));
const CustomerSupportModal = lazy(() => import("./CustomerSupportModal.vue"));
const GeniusGameTrackerModal = lazy(() => import("./GeniusGameTrackerModal.vue"));
const OneCutModal = lazy(() => import("./OneCutModal.vue"));
const TwoUpModal = lazy(() => import("./TwoUpModal.vue"));
const MultibetBoostModal = lazy(() => import("./MultibetBoostModal.vue"));
const InviteFriendModal = lazy(() => import("@/components/festive/InviteFriendModal.vue"));

const { modalType } = storeToRefs(useModalStore());
const { betslipLength } = storeToRefs(useBetslipStore());
const t = useModalTypes();
const { getModalTitle, betslip } = t;

const everOpened = reactive(new Set());
watch(
  modalType,
  (type) => {
    if (type) everOpened.add(type);
  },
  { immediate: true },
);
const opened = (type) => everOpened.has(type);
</script>

<template>
  <!-- sport betslip (always mounted — core UI) -->
  <BetslipModal class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute">
    <template #title>
      {{ getModalTitle(modalType) }}
      <span v-if="betslipLength > 0" class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[0.65rem] font-bold text-primary-foreground bg-brand-bright rounded-full">{{ betslipLength }}</span>
    </template>
    <div class="max-h-[85vh] flex flex-col">
      <SportsBetslip v-if="modalType === betslip" />
    </div>
  </BetslipModal>

  <TheDrawer v-if="opened(t.drawer)" />
  <BetPlaceStatusDialogue v-if="opened(t.betPlaceStatus)" />
  <SearchModal v-if="opened(t.search)" />
  <CalendarModal v-if="opened(t.calendar)" />
  <LoginModal v-if="opened(t.login)" />
  <CasinoUnauthModal v-if="opened(t.casinoUnauthModal)" />
  <DepositModal v-if="opened(t.deposit)" />
  <ChatModal v-if="opened(t.chat)" />
  <ShareBetModal v-if="opened(t.shareBet)" />

  <BookedBetPreviewModal
    v-if="opened(t.bookedBetPreview)"
    class="z-50 max-h-32 max-w-28 h-full bottom-32 absolute"
  />

  <ConfirmModal v-if="opened(t.confirm)">
    <CancelBet />
  </ConfirmModal>

  <InsufficientBalanceModal v-if="opened(t.insufficientBalance)" />
  <CashoutModal v-if="opened(t.cashout)" />
  <RoadBlockModal v-if="opened(t.roadblock)" />
  <LoaderModal v-if="opened(t.loader)" />
  <SportsIconsModal v-if="opened(t.sportsIconsModal)" />
  <ChangeEventModal v-if="opened(t.ChangeEventModal)" />
  <SocialconsModal v-if="opened(t.socialIconsModal)" />
  <CustomerSupportModal v-if="opened(t.customerSupportModal)" />
  <GeniusGameTrackerModal v-if="opened(t.geniusGameTracker)" />

  <OneCutModal
    v-if="opened(t.oneCutModal)"
    class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute"
  />
  <TwoUpModal
    v-if="opened(t.twoUpModal)"
    class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute"
  />
  <MultibetBoostModal
    v-if="opened(t.multibetBoostModal)"
    class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute"
  />
  <InviteFriendModal v-if="opened(t.festiveModal)" />
</template>
```

Before writing it, verify every `t.<key>` above exists in the object returned by `useModalTypes()` (`app/composables/useModalTypes.js` — keys: `drawer`, `betPlaceStatus`, `search`, `calendar`, `login`, `casinoUnauthModal`, `deposit`, `chat`, `shareBet`, `bookedBetPreview`, `confirm`, `insufficientBalance`, `cashout`, `roadblock`, `loader`, `sportsIconsModal`, `ChangeEventModal`, `socialIconsModal`, `customerSupportModal`, `geniusGameTracker`, `oneCutModal`, `twoUpModal`, `multibetBoostModal`, `festiveModal`). `betPlaceStatus` and `casinoUnauthModal` are declared in that file — confirm they are also in its `return { … }` object; if any key is missing from the return, add it there (do not rename anything).

Also verify the type each component gates on matches the mapping above:

```bash
for n in TheDrawer BetPlaceStatusDialogue SearchModal CalendarModal LoginModal CasinoUnauthModal DepositModal ChatModal ShareBetModal BookedBetPreviewModal ConfirmModal InsufficientBalanceModal CashoutModal RoadBlockModal LoaderModal SportsIconsModal ChangeEventModal SocialconsModal CustomerSupportModal GeniusGameTrackerModal OneCutModal TwoUpModal MultibetBoostModal InviteFriendModal; do p=$(find app/components -name "$n.vue" | head -1); echo "$n :: $(grep -hoE 'modalType\.value === [A-Za-z]+' "$p" </dev/null | head -1)"; done
```

Each line's type must equal the `t.<key>` used for that component in the template. Paste the output in the report.

- [ ] **Step 2: Make `CasinoSidebar` async in `app.vue`**

Replace line 1 of `app/app.vue`:

```js
import CasinoSidebar from "@/components/CasinoSidebar.vue";
```

with

```js
import { defineAsyncComponent } from "vue";
const CasinoSidebar = defineAsyncComponent(() => import("@/components/CasinoSidebar.vue"));
```

(`defineAsyncComponent` is also auto-imported by Nuxt; the explicit import is fine and matches the file's existing style.)

- [ ] **Step 3: Build, measure**

Run the measurement recipe. Expected: `modulepreload` drops substantially (from 86 to roughly 55–65) and `js_gzip` drops further. Paste the line.

- [ ] **Step 4: Behavioural check via the built server**

With the server running, fetch `/` and confirm the betslip modal markup is still SSR-rendered and no modal markup leaked:

```bash
curl -s http://localhost:3123/ | grep -c 'headlessui-dialog'    # expected 0 (no modal open at SSR)
```

Then state in the report that a browser check of "open Login modal → close → open Deposit modal" is **deferred to the controller's final review** (Task 9) — you cannot drive a browser.

- [ ] **Step 5: Commit**

```bash
git add app/components/CollectAllModals.vue app/app.vue
git commit -m "perf: mount modals lazily on first open instead of on every page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Lazy-hydrate below-the-fold sections and stop preloading dynamic-only chunks

The home page mounts (mobile, `app/components/MobileSportsLayout.vue`; desktop, `app/components/DesktopSportsLayout.vue`; every other page via `app/layouts/default.vue`) a `Footer` and `SEOMarkupContent` that are far below the fold, and a Swiper `TheBanner` whose first slide is the LCP image (pure HTML/CSS until hydrated). Nuxt 4 lazy hydration (`<LazyX hydrate-on-visible>` / `hydrate-on-idle>`) keeps the SSR markup and defers the component's JS and setup work.

Nuxt preloads the chunk of every component that rendered during SSR, including lazily-hydrated ones. Whether that is the case must be measured here; if it is, a `build:manifest` hook turns off `preload`/`prefetch` for dynamic-only chunks.

**Files:**
- Modify: `app/components/MobileSportsLayout.vue` (template, lines ~62-92)
- Modify: `app/components/DesktopSportsLayout.vue` (template)
- Modify: `app/layouts/default.vue` (three `<Footer />` usages)
- Modify: `nuxt.config.js` (`hooks`)

**Interfaces:**
- Consumes: Nuxt auto-registered components `Footer`, `SEOMarkupContent`, `TheBanner` (all top-level files in `app/components/`, so their lazy names are `LazyFooter`, `LazySEOMarkupContent`, `LazyTheBanner`).

- [ ] **Step 1: Confirm Nuxt's lazy-hydration API is available**

```bash
grep -o "hydrateOnVisible\|hydrate-on-visible\|hydrateOnIdle" node_modules/nuxt/dist/index.mjs | sort -u
grep -n "lazyHydration" node_modules/@nuxt/schema/dist/*.mjs | head -3
```

Expected: both `hydrateOnVisible` and `hydrateOnIdle` present; `experimental.lazyHydration` defaults to `true` in the schema. If either is missing, STOP and report.

- [ ] **Step 2: Mobile layout**

In `app/components/MobileSportsLayout.vue` template:
- `<TheBanner />` → `<LazyTheBanner hydrate-on-idle />`
- `<SEOMarkupContent />` → `<LazySEOMarkupContent hydrate-on-visible />`
- `<Footer />` → `<LazyFooter hydrate-on-visible />`

Leave `HeaderLinks`, `CategoryPills`, `MatchFilters`, `InfiniteScroll`, `MobileFooterV2` (the fixed bottom tab bar — always visible and tappable) exactly as they are.

- [ ] **Step 3: Desktop layout**

In `app/components/DesktopSportsLayout.vue` template:
- `<TheBanner />` → `<LazyTheBanner hydrate-on-idle />`
- `<SEOMarkupContent />` → `<LazySEOMarkupContent hydrate-on-visible />`
- `<Footer />` → `<LazyFooter hydrate-on-visible />`

In `app/pages/casino-home.vue:240` the banner is `<TheBanner sizes="…" />` — leave that one alone (casino pages are `ssr: false`).

- [ ] **Step 4: Default layout**

In `app/layouts/default.vue`, each of the three `<Footer />` → `<LazyFooter hydrate-on-visible />`.

- [ ] **Step 5: Build, measure — decide whether the manifest hook is needed**

Run the measurement recipe and paste the line. Then check whether the footer chunk is still preloaded:

```bash
f=$(grep -l "responsiblegambling.or.ke" .output/public/_nuxt/*.js | grep -v '\.gz$\|\.br$' | head -1); echo "footer chunk: $f"
curl -s http://localhost:3123/ | grep -c "$(basename "$f")"
```

(Start the server for the curl, kill it after.) If the count is **0**, lazy hydration already removed it from the preload set — skip Step 6. If **≥1**, do Step 6.

- [ ] **Step 6 (conditional): Turn off preload/prefetch for dynamic-only chunks**

Read how the renderer decides what to preload: `grep -n "preload\|prefetch" node_modules/vue-bundle-renderer/dist/index.mjs | head -40`. It honours per-resource `preload`/`prefetch` booleans in the manifest. Add to the existing `hooks: { … }` object in `nuxt.config.js` (there is already a `"pages:extend"` hook — add a sibling, do not replace):

```js
    // Lighthouse round 2, Task 4: chunks that are only ever reached via a
    // dynamic import (lazy-hydrated sections, lazily-mounted modals) must not
    // be modulepreload'ed in the SSR HTML — the browser fetches them when the
    // hydration strategy / v-if fires. Without this, every SSR-rendered
    // component's chunk is preloaded before first paint even when its
    // hydration is deferred.
    "build:manifest": (manifest) => {
      for (const key in manifest) {
        const chunk = manifest[key];
        if (chunk.isDynamicEntry && !chunk.isEntry) {
          chunk.preload = false;
          chunk.prefetch = false;
        }
      }
    },
```

Rebuild, re-run the Step 5 check (expected 0 now) and the measurement recipe. If the count is still ≥1, inspect `vue-bundle-renderer`'s `getPreloadLinks`/`renderResourceHints` source (the file grepped above) to see which field it actually reads, adapt the hook to that field, and document the finding in the report. Do not spend more than ~30 minutes here; if it cannot be made to work, revert the hook, keep Steps 2–4, and say so explicitly.

- [ ] **Step 7: Verify SSR markup is intact**

With the server running:

```bash
curl -s http://localhost:3123/ | grep -c 'responsiblegambling.or.ke'   # footer still SSR-rendered: expected ≥1
curl -s http://localhost:3123/ | grep -c '<source type="image/webp"'    # banner slides still SSR-rendered: expected ≥1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3123/sports/soccer   # 200
```

- [ ] **Step 8: Commit**

```bash
git add app/components/MobileSportsLayout.vue app/components/DesktopSportsLayout.vue app/layouts/default.vue nuxt.config.js
git commit -m "perf: lazy-hydrate footer, SEO block and banner; stop preloading dynamic-only chunks

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Omit `nuxt.config.js` from `git add` if Step 6 was skipped.)

---

### Task 5: Brand splash dismisses itself with CSS, not a post-hydration timer

`app/components/BrandSplash.vue` is a fixed full-screen overlay that is SSR-rendered visible and hidden by `setTimeout(…, 1800)` **inside `onMounted`** — i.e. 1.8 s *after hydration finishes*. On a throttled phone that hides the already-painted page for many seconds and is the main reason Speed Index is 7.8 s. Change it so the whole show → hold → fade sequence is driven by CSS animations that start at first paint and finish ~1 s later, independent of JavaScript; `onMounted` only removes the node afterwards.

**Files:**
- Modify: `app/components/BrandSplash.vue` (rewrite)

- [ ] **Step 1: Rewrite the component**

```vue
<script setup>
import BandaLogo from "./logos/BandaLogo.vue";

// The splash is SSR-rendered and dismissed by CSS animation alone (see the
// style block): it fades out ~1 s after first paint whether or not the
// JavaScript bundle has arrived. onMounted merely removes the node once the
// animation is guaranteed to have finished, so it stops costing layout.
const SPLASH_TOTAL_MS = 1100;
const isVisible = ref(true);
onMounted(() => {
  setTimeout(() => {
    isVisible.value = false;
  }, SPLASH_TOTAL_MS);
});
</script>

<template>
  <div
    v-if="isVisible"
    class="splash fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background pointer-events-none"
    role="status"
    aria-label="Bandabets is loading"
  >
    <BandaLogo class="splash-mark h-9 w-auto md:h-11" />
    <!-- A hairline that draws to full width, then holds. -->
    <span
      class="splash-rule mt-6 block h-px w-32 origin-left bg-primary md:w-40"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
/* Timeline (ms after first paint):
     0–450   mark settles in (ease-out-expo, no overshoot)
   120–570   rule draws left → right
   700–1100  whole overlay lifts and fades; visibility flips to hidden at the end
   The overlay never intercepts pointer events, so a fast tap on SSR content
   still works during the hold. */
.splash {
  animation: splash-out 400ms cubic-bezier(0.16, 1, 0.3, 1) 700ms forwards;
}
.splash-mark {
  opacity: 0;
  transform: translateY(6px) scale(0.985);
  animation: splash-mark-in 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.splash-rule {
  transform: scaleX(0);
  opacity: 0.9;
  animation: splash-rule-in 450ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
}
@keyframes splash-mark-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes splash-rule-in {
  to {
    transform: scaleX(1);
  }
}
@keyframes splash-out {
  to {
    opacity: 0;
    transform: scale(1.012);
    visibility: hidden;
  }
}

/* Reduced motion: keep the brand, drop the movement — mark and rule are
   present immediately and only a short fade-out remains. */
@media (prefers-reduced-motion: reduce) {
  .splash-mark,
  .splash-rule {
    opacity: 1;
    transform: none;
    animation: none;
  }
  .splash {
    animation: splash-out 200ms linear 500ms forwards;
  }
}
</style>
```

- [ ] **Step 2: Build, verify the overlay is SSR-rendered with the animation classes and no inline timer dependency**

Run the measurement recipe (paste the line — it should be unchanged apart from a few bytes), then with the server running:

```bash
curl -s http://localhost:3123/ | grep -o 'class="splash [^"]*"' | head -1     # expected: contains "splash fixed inset-0 … pointer-events-none"
grep -c "splash-out" .output/public/_nuxt/style.*.css                          # expected ≥1
```

- [ ] **Step 3: Commit**

```bash
git add app/components/BrandSplash.vue
git commit -m "perf: drive the brand splash with CSS so it never waits for hydration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Slim the login chunk — crypto-js subpath imports, lazy sweetalert2

The chunk that carries `app/stores/login.js` (preloaded on every page) bundles all of `crypto-js` (~45 KB gzip) for one PBKDF2 + AES-CBC call in `app/composables/useEncryption.js`, and `sweetalert2` (~27 KB gzip) for toasts in `app/composables/useToast.js`.

**Files:**
- Modify: `app/composables/useEncryption.js`
- Modify: `app/composables/useToast.js`
- Create (throwaway, scratchpad): `/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad/encrypt-check.mjs`

**Interfaces:**
- Produces: `encryptData(data)` / `decrypteData(data)` unchanged signatures and byte-identical output (deterministic: fixed key, salt, IV). `useToast()` returns the same keys; `Toast(color, position)` now returns `{ fire(opts) → Promise }` (the only external caller, `app/stores/deposit.js:171,186`, already does `await Toast("green").fire({...})`).

- [ ] **Step 1: Record the current encryption output (the "test")**

Write the scratchpad script — it loads the *current* implementation through CommonJS `crypto-js` exactly as the composable does, for two fixed inputs:

```js
// encrypt-check.mjs — prints reference ciphertexts from the CURRENT useEncryption.js logic
import CryptoJS from "crypto-js";
const keyValue = "cXB4DaTfYrsYuPdZ", ivKey = "a2xhcgHgXCV6R4wD", salt = "BM3ex5RtPToYioP7";
const enc = (data) => {
  const key = CryptoJS.PBKDF2(keyValue, salt, { keySize: 256 / 32, iterations: 100 });
  const iv = CryptoJS.enc.Utf8.parse(ivKey);
  return CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv, mode: CryptoJS.mode.CBC }).ciphertext.toString(CryptoJS.enc.Hex);
};
console.log(enc("hunter2"));
console.log(enc({ utm_source: "x", utm_medium: "y" }));
```

Run: `node <scratchpad>/encrypt-check.mjs` from the repo root (so `crypto-js` resolves). Save the two hex lines as REFERENCE in the report.

- [ ] **Step 2: Rewrite `useEncryption.js` with subpath imports**

```js
// Subpath imports pull only the PBKDF2 + AES + Hex/Utf8 pieces of crypto-js
// (≈10 KB gzip) instead of the whole library (≈45 KB gzip) into the login
// chunk that is preloaded on every page. AES's default mode is already CBC
// with Pkcs7 padding, which is what the previous explicit `mode: CBC` used,
// so the output is byte-identical (verified against fixed inputs).
import PBKDF2 from "crypto-js/pbkdf2";
import AES from "crypto-js/aes";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";

const keyValue = "cXB4DaTfYrsYuPdZ"; // your key value (eg: key)
const ivKey = "a2xhcgHgXCV6R4wD";
const salt = "BM3ex5RtPToYioP7";

function deriveKey() {
  return PBKDF2(keyValue, salt, { keySize: 256 / 32, iterations: 100 });
}

export function encryptData(data) {
  if (data) {
    const key = deriveKey();
    const iv = Utf8.parse(ivKey);
    const encrypted = AES.encrypt(JSON.stringify(data), key, { iv });
    return encrypted.ciphertext.toString(Hex);
  }
}

export function decrypteData(data) {
  if (data) {
    const key = deriveKey();
    const iv = Utf8.parse(ivKey);
    const decrypted = AES.decrypt({ ciphertext: Hex.parse(data) }, key, { iv });
    return decrypted.toString(Utf8);
  }
}
```

- [ ] **Step 3: Verify byte-identical output**

Append to the scratchpad script (or write a second one) the same two inputs run through the **new** module logic — copy the four subpath imports and the `encryptData` body verbatim (the composable file itself uses the `@/` alias only for nothing here, so it can be imported directly):

```js
import { encryptData, decrypteData } from "/Users/leonardmbugua/Desktop/bandabet/app/composables/useEncryption.js";
console.log(encryptData("hunter2"));
console.log(encryptData({ utm_source: "x", utm_medium: "y" }));
console.log(decrypteData(encryptData("hunter2")));   // expected: "hunter2" wrapped in JSON quotes → "\"hunter2\""
```

Expected: the first two lines equal REFERENCE exactly; the third prints `"hunter2"`. If they differ, do not proceed — restore `mode: CBC` via `import CipherCore from "crypto-js/cipher-core"` (`mode: CipherCore.mode.CBC`) and re-check.

- [ ] **Step 4: Lazy sweetalert2 in `useToast.js`**

Replace the file with:

```js
// sweetalert2 (~27 KB gzip + injected CSS) is only needed once a toast
// actually fires, so it is imported on first use instead of being bundled
// into the login chunk that every page preloads.
let swalPromise = null;
const loadSwal = () =>
  (swalPromise ??= import("sweetalert2").then((m) => m.default));

const errorColor = "red";
const successColor = "green";
const successIcon = "success";
const errorIcon = "warning";

const positionTop = "top";
const positionBottomRight = "bottom-right";
const positionTopRight = "top-right";

export function useToast() {
  // Returns an object whose fire() resolves once sweetalert2 has loaded and
  // the toast has been shown — the same shape callers already await.
  const Toast = (color, position = positionTop) => ({
    async fire(options) {
      const Swal = await loadSwal();
      return Swal.mixin({
        toast: true,
        position: position,
        iconColor: color,
        customClass: {
          popup: "colored-toast",
        },
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      }).fire(options);
    },
  });

  function fireToast(color, icon, title, position = positionTop) {
    Toast(color, position).fire({ icon: icon, title: title });
  }

  function fireSuccessToast(title, position = positionTop) {
    fireToast(successColor, successIcon, title, position);
  }
  function fireErrorToast(title, position = positionTop) {
    fireToast(errorColor, errorIcon, title, position);
  }

  return {
    Toast,
    fireToast,
    errorColor,
    errorIcon,
    successIcon,
    successColor,
    fireErrorToast,
    fireSuccessToast,
    positionTopRight,
    positionBottomRight,
  };
}
```

Then confirm no caller uses anything from a `Toast(...)` result other than `.fire`:

```bash
grep -rn "Toast(" app | grep -v "fireToast\|fireSuccessToast\|fireErrorToast\|composables/useToast.js"
```

Expected: only `useToast();` lines and the two `await Toast("…").fire({` lines in `app/stores/deposit.js`. Anything else → adapt it and report.

- [ ] **Step 5: Build, measure**

Run the measurement recipe; expected `js_gzip` down ~50 KB. Also:

```bash
grep -l "SweetAlert2\|swal2-" .output/public/_nuxt/*.js | grep -v '\.gz$\|\.br$'
```

Take the chunk name(s) and confirm they are **not** in the home HTML modulepreload list (server up, `curl -s http://localhost:3123/ | grep -c <name>` → 0).

- [ ] **Step 6: Commit**

```bash
git add app/composables/useEncryption.js app/composables/useToast.js
git commit -m "perf: import only the crypto-js pieces we use and load sweetalert2 on first toast

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Casino thumbnails load only near the viewport

The mobile home page renders horizontally scrolling strips of casino game tiles (`app/components/mobile/TopGames.vue`, `app/components/mobile/GamesRow.vue`, `app/components/mobile/HotTabsSection.vue`) whose `<img loading="lazy">` images come from `agstatic.com` at ~90–146 KB each. Chrome's native lazy-load margin on slow networks is large enough that all 12 tiles in a strip load at once (1.35 MB on the audited page) even though only ~4 fit a 412 px viewport. Replace the native attribute with an IntersectionObserver that sets `src` only when a tile is within 150 px of the viewport (IntersectionObserver respects clipping by the horizontal scroll container, so off-screen tiles in the strip do not intersect).

**Files:**
- Create: `app/components/casino/NearViewportImage.vue`
- Modify: `app/components/mobile/TopGames.vue:136-141`
- Modify: `app/components/mobile/GamesRow.vue:67-72`
- Modify: `app/components/mobile/HotTabsSection.vue:446-451`

**Interfaces:**
- Produces: `<NearViewportImage :src :alt :class="…" />` — renders an `<img>` with `width="300" height="300" decoding="async"`; `src` is a 1×1 transparent GIF until the element is within `rootMargin` (default `150px`) of the viewport, then the real URL. Auto-registered by Nuxt as `CasinoNearViewportImage` **and** usable as `NearViewportImage`? — No: Nuxt prefixes nested folders, so the registered name is `CasinoNearViewportImage`. Import it explicitly in the three consumers to avoid depending on the prefix rule.

- [ ] **Step 1: Create the component**

```vue
<script setup>
// An <img> whose src is only assigned once the element is near the viewport.
// Chrome's native loading="lazy" margin on slow connections is wide enough to
// fetch every tile in a horizontally scrolling strip at once; this observer
// (150 px margin, honours clipping by the strip's overflow) fetches only
// the tiles a user is about to see.
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: "" },
  rootMargin: { type: String, default: "150px" },
});

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const el = ref(null);
const near = ref(false);
let observer = null;

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    near.value = true;
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        near.value = true;
        observer.disconnect();
        observer = null;
      }
    },
    { rootMargin: props.rootMargin },
  );
  observer.observe(el.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <img
    ref="el"
    :src="near ? src : PLACEHOLDER"
    :alt="alt"
    width="300"
    height="300"
    decoding="async"
  />
</template>
```

`ref`, `onMounted`, `onBeforeUnmount` are Nuxt auto-imports. Attributes such as `class` passed by the parent fall through to the `<img>` (single root element), so the existing `class="w-full h-full object-cover"` keeps working.

- [ ] **Step 2: Use it in the three strips**

In each file add to `<script setup>`:

```js
import NearViewportImage from "@/components/casino/NearViewportImage.vue";
```

and replace the tile `<img … loading="lazy" />` block:

`app/components/mobile/TopGames.vue` (lines 136-141) and `app/components/mobile/GamesRow.vue` (lines 67-72):

```vue
            <NearViewportImage
              :src="game.imgFullUrl"
              :alt="game.gameName"
              class="w-full h-full object-cover"
            />
```

`app/components/mobile/HotTabsSection.vue` (lines 446-451):

```vue
            <NearViewportImage
              :src="game.imgFullUrl"
              :alt="game.gameName"
              class="h-full w-full object-cover"
            />
```

Do **not** touch the small 16 px chip/category icons at lines ~339 and ~364 of `HotTabsSection.vue`.

- [ ] **Step 3: Build, measure**

Run the measurement recipe (JS numbers essentially unchanged — this task is about image bytes, which the script does not count). Confirm the three consumers compile: `pnpm build` exits 0 and

```bash
grep -c "NearViewportImage" app/components/mobile/TopGames.vue app/components/mobile/GamesRow.vue app/components/mobile/HotTabsSection.vue
```

shows 2 per file (import + usage). Browser verification (count of `agstatic.com` requests on load ≈ visible tiles only) is deferred to the controller's Task 9 review.

- [ ] **Step 4: Commit**

```bash
git add app/components/casino/NearViewportImage.vue app/components/mobile/TopGames.vue app/components/mobile/GamesRow.vue app/components/mobile/HotTabsSection.vue
git commit -m "perf: fetch casino tile thumbnails only when near the viewport

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Accessibility items from the audit

Lighthouse accessibility 90 → target ≥ 97. Three findings: the viewport meta disables zoom; no `<main>` landmark; low-contrast text (footer `text-muted-foreground/40…/70`, bottom tab bar inactive labels `text-gray-500`).

**Files:**
- Modify: `nuxt.config.js` (viewport meta, ~line 480 inside `app.head.meta`)
- Modify: `app/components/MobileSportsLayout.vue`, `app/components/DesktopSportsLayout.vue`, `app/layouts/default.vue`, `app/layouts/auth.vue` (`<main>`)
- Modify: `app/components/Footer.vue` (lines 55, 57, 69, 80, 98, 122, 145, 160, 166, 178, 183, 192)
- Modify: `app/components/mobile/MobileFooterV2.vue:75`

- [ ] **Step 1: Allow zoom**

In `nuxt.config.js`, the viewport meta `content` becomes exactly:

```js
content: "width=device-width, initial-scale=1.0",
```

- [ ] **Step 2: One `<main>` per rendered layout**

The home page uses `layout: false`, so its layouts are the two sports layouts; other pages use `default`/`auth`. In each, change the element that wraps the page's primary content from `<div …>` to `<main …>` **keeping every class**:

- `app/components/MobileSportsLayout.vue`: the `<div class="bg-gray-50 dark:bg-background">` that contains the banner, `<slot name="hero" />` and the match list → `<main class="bg-gray-50 dark:bg-background">` … `</main>`.
- `app/components/DesktopSportsLayout.vue`: `<div class="flex-1 min-w-0 max-w-[800px] 2xl:max-w-[1000px]">` (the "Main content" column) → `<main …same classes…>` … `</main>`.
- `app/layouts/default.vue`: in the large and medium branches, `<div class="flex-1 min-w-0 max-w-200 lg:max-w-250 py-3">` / `<div class="flex-1 min-w-0 py-3">` → `<main …>`; in the small branch `<div class="w-full grow px-2 py-3">` → `<main …>`. (Only one branch renders at a time, so there is still exactly one `<main>` in the DOM.)
- `app/layouts/auth.vue`: `<div class="flex-1 w-full max-w-4xl mx-auto px-3">` → `<main …>`.

Check there was no `<main>` already: `grep -rn "<main" app/layouts app/components/MobileSportsLayout.vue app/components/DesktopSportsLayout.vue` before editing (expected none).

- [ ] **Step 3: Footer contrast**

In `app/components/Footer.vue`, replace every `text-muted-foreground/40`, `/50`, `/60`, `/70` with plain `text-muted-foreground` on the lines listed above. Keep `hover:` classes and `bg-foreground/5` as they are. Verify:

```bash
grep -nE "text-muted-foreground/[0-9]+" app/components/Footer.vue    # expected: no output
```

- [ ] **Step 4: Bottom tab bar inactive labels**

`app/components/mobile/MobileFooterV2.vue:75`: `'text-gray-500 dark:text-gray-500'` → `'text-muted-foreground'` (Tailwind's gray ramp is remapped onto the coffee palette and that step fails 4.5:1 on the translucent bar).

- [ ] **Step 5: Build, verify markup**

Run the measurement recipe (numbers unchanged), then with the server running:

```bash
curl -s http://localhost:3123/ | grep -o '<meta name="viewport"[^>]*>'          # no user-scalable / maximum-scale
curl -s http://localhost:3123/ | grep -c '<main'                                  # expected 1
curl -s http://localhost:3123/login | grep -c '<main'                             # expected 1
```

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.js app/components/MobileSportsLayout.vue app/components/DesktopSportsLayout.vue app/layouts/default.vue app/layouts/auth.vue app/components/Footer.vue app/components/mobile/MobileFooterV2.vue
git commit -m "a11y: allow pinch-zoom, add main landmarks, fix footer and tab-bar contrast

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Final measurement and report (controller-run)

Not delegated — the controller runs this after Tasks 0–8 are merged on `main`.

- [ ] **Step 1: Lighthouse recipe with label `final`**; compare to LOCAL BASELINE from Task 0. Record perf + a11y scores and the five metrics.
- [ ] **Step 2: Measurement recipe** one last time; record the line next to BASELINE.
- [ ] **Step 3: Browser smoke test** (Claude in Chrome against `http://localhost:3123/`, mobile-width window): splash fades within ~1.5 s of paint; open Login modal → close → open Deposit modal (both mount, close transition plays); scroll the casino strip and confirm `agstatic.com` requests grow as tiles come into view rather than all at once (read_network_requests); footer renders and its links work after scrolling to it.
- [ ] **Step 4:** Append a `## Results` section to this plan file with the before/after table, commit it (`docs: record Lighthouse round-2 results`).
- [ ] **Step 5:** If the local perf score is < 80, list the next candidates with measured evidence (expected: the 62 KB stylesheet — per-route CSS splitting or `@source not "../../docs"` — and the remaining entry-chunk contents from `npx nuxi analyze`).

## Self-review

- **Spec coverage:** assessment rows 1→Task 1, 2→Task 2, 3→Task 3, 4→Task 4, 5→Task 5, 6→Task 6, 7→Task 7, 8→Task 8; measurement/verification→Tasks 0 and 9. No gaps.
- **Placeholders:** none — every code step carries the full file or exact replacement text; the only conditional step (Task 4 Step 6) states its decision rule and its time box.
- **Consistency:** `scripts/critical-bytes.mjs` output format is identical in Task 0 and the recipe; `useModalTypes()` keys used in Task 3 match the file's declarations; `Toast(color, position).fire(opts)` shape in Task 6 matches `app/stores/deposit.js`; `NearViewportImage` props (`src`, `alt`, `rootMargin`) match its three call sites.

## Results (2026-08-27, commits d820e1d..e71ec9c)

Local build, same machine, `node .output/server/index.mjs` with the dev `.env`.

### Critical-path bytes on `/` (`scripts/critical-bytes.mjs`)

| Stage | modulepreload | JS gzip | CSS gzip | prefetch links |
|---|---|---|---|---|
| Baseline | 80 | 557 KB | 58 KB | 69 |
| T1 datepicker removed | 80 | 497 KB | 54 KB | — |
| T2 mixpanel deferred | 80 | 377 KB | 54 KB | — |
| T3 lazy modals | 82 | 328 KB | 54 KB | — |
| T4 lazy hydration + manifest hook | 79 | 297 KB | 54 KB | 35 |
| T6 login chunk diet | 80 | 260 KB | 54 KB | — |
| **Final** | **80** | **260 KB (−53 %)** | **54 KB** | **35** |

The preload *count* barely moved because Vite re-split the modal/store graph into ~40 tiny (<1.5 KB) shared chunks; bytes are what the throttled simulation charges.

### Lighthouse 13 (Moto G Power emulation, slow 4G, mobile)

| Run | Perf | A11y | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|
| Deployed Vercel preview, before (Google PSI, 2026-08-27 15:08) | 55 | 90 | 4.5 s | 6.1 s | 330 ms | 0.024 | 7.4 s |
| Local baseline, simulated throttling (no API env) | 55 | — | 6.4 s | 8.1 s | 247 ms | — | 6.4 s |
| Local final, simulated throttling (no API env) | 62 | 95 | 4.8 s | 7.1 s | 180 ms | 0.019 | 4.8 s |
| Local final, **devtools throttling**, no API env | 86 | — | 2.5 s | 2.5 s | 349 ms | — | 3.1 s |
| Local final, **devtools throttling**, real API env | **78** | **95** | 2.5 s | 2.5 s | 613 ms | — | 3.1 s |

Notes on reading this:
- Simulated ("Lantern") throttling is what PSI uses, and it is dominated by request count and the render-blocking stylesheet; devtools throttling measures the real timeline. Both point the same direction; the deployed PSI number after these commits ship is the one that counts.
- With the real API env, TBT rises to ~600 ms because the home page's XHRs (`matches`, `matches-grouped`, `bets`, three parallel `sg-categories` calls) all resolve during the first idle window and each triggers a render.
- The 4.8 s observed FCP in the simulated run is an artefact of the un-configured env (empty API URLs → error paths); the devtools run against the configured server is the trustworthy local figure.

### Verified in headless Chrome (412×823, mobile)
- Splash hidden 1.3 s after navigation start (CSS-timed; was ≥ hydration + 1.8 s).
- Casino strips: 12 tiles rendered, 4 thumbnails fetched on load, 8 after scrolling the strip (was all 12 immediately).
- Login modal opens through `useModalStore().openModal("login")` and closes on Escape (chunk loaded on demand).
- Exactly one `<main>`; viewport meta allows zoom; footer renders with 11 links after scrolling; no page errors (only CORS errors from the API on `localhost`, expected).

### Next candidates (measured, not yet done)
1. **Swiper chunk** (`BPLZ7ch52`, 26 KB gz, 990 ms main-thread incl. forced reflow) — hydrate the banner `hydrate-on-visible`/on-interaction instead of idle, or replace the mobile banner Swiper with CSS scroll-snap.
2. **Three parallel `sg-categories` fetches** on the home page (`TheLanding`, `MobileTest`, `TopGames`, `HotTabsSection`, `TheSidebar` all call `fetchCategoriesWithGames` on mount) — dedupe with an in-flight promise in `stores/casino.js`.
3. **Render-blocking stylesheet** (54 KB gz, 872 ms on slow 4G): 254 KB raw of Tailwind utilities + 125 KB scoped CSS for every route in one file — per-route CSS (`cssCodeSplit: true` plus the manifest hook, now that the per-component `<link>` duplication is gone) or critical-CSS inlining via `features.inlineStyles` scoped to the home route.
4. **Login-store chunk** (`B2pk-8sl`, 24 KB gz, 467 ms long task on load) — `app/stores/login.js` runs on every page via `plugins/auth-ssr.js`; audit what it does at init.
5. Desktop/casino pages still use plain `<img loading="lazy">` for `imgFullUrl` tiles (9 components) — apply `NearViewportImage` there.
