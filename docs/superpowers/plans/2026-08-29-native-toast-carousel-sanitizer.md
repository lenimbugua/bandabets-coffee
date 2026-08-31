# Native Toast, Carousel and HTML Sanitizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `sweetalert2`, `swiper` and `dompurify` from the app by replacing them with a native toast stack, a CSS scroll-snap carousel primitive, and an isomorphic allow-list HTML sanitizer built on `ultrahtml` (already a dependency of Nuxt itself).

**Architecture:** (1) `useToast.js` keeps its public API (`Toast(color, position).fire({icon,title})`, `fireToast`, `fireSuccessToast`, `fireErrorToast`, position/colour constants) but pushes into a module-level reactive queue rendered once by `app/components/ui/AppToaster.vue` mounted in `app/app.vue`. (2) `app/components/ui/AppCarousel.vue` + `AppCarouselSlide.vue` implement a one-slide-per-view scroll-snap track (the technique `TheBanner.vue` already uses) and provide/expose `{ index, count, isFirst, isLast, prev, next, goTo }`; the three swiper consumers switch to it. (3) `app/utils/sanitizeHtml.js` parses with `ultrahtml`, drops dangerous elements, unwraps unknown ones, allow-lists attributes per element, rejects unsafe `href`/`src` schemes and forces `rel="noopener noreferrer"` on `target="_blank"`; it runs identically during SSR and on the client, so `PromotionDetails.vue` no longer ships unsanitised CMS HTML in the server response (DOMPurify was a no-op on the server).

**Tech Stack:** Nuxt 4 (JS only), Vue 3.5, Tailwind CSS 4 semantic tokens, `@nuxt/icon` (Tabler), `ultrahtml` 1.7.

**Spec:** the in-chat design approved on 2026-08-29 ("go"); this file is the written record.

## Global Constraints

- JavaScript only — no `.ts` files, no TypeScript syntax.
- Only dependency changes allowed: **add** `ultrahtml` (`^1.7.0`, already present in `node_modules/.pnpm`) and **remove** `sweetalert2`, `swiper`, `dompurify`. Nothing else in `package.json` changes.
- Semantic Tailwind tokens only (`bg-card`, `text-destructive`, `text-success`, `border-border-strong`, `text-muted-foreground`, `text-brand-bright`…) — no literal colours, no `bg-gray-*`/`bg-green-*`, no hex values anywhere below `app/assets/css/style.css` layer 2.
- The public API of `useToast()` must not change — the 19 consumer files must compile and behave without edits. `Toast(color, position).fire(options)` must still return a Promise (callers `await` it inside fire-and-forget IIFEs).
- Components under `app/components/ui/` are imported explicitly (`import AppDialog from "@/components/ui/AppDialog.vue"` is the existing convention) — do not rely on auto-registration for them.
- Do not edit `Dockerfile`, CI files, `docs/INFRA-HANDOFF.md`, or `.env`; never commit `.env` or `.vercel/`.
- Commit messages: `type: summary` (conventional), ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Do not push.
- Never leave a dev/preview server running when a task finishes.
- `pnpm build` must succeed with zero errors after every task. `pnpm exec eslint <changed files>` must not add errors beyond the pre-existing `no-undef`-on-Nuxt-auto-imports class documented in CLAUDE.md.

---

### Task 1: Native toast stack (`useToast` + `AppToaster`), remove `sweetalert2`

**Files:**
- Modify: `app/composables/useToast.js` (full rewrite, currently 65 lines)
- Create: `app/components/ui/AppToast.vue`
- Create: `app/components/ui/AppToaster.vue`
- Modify: `app/app.vue` (mount `<AppToaster />` after `<CollectAllModals />`)
- Modify: `app/assets/css/style.css` (replace the `/* SweetAlert2 toast theming */` block, ≈ lines 1375–1400)
- Modify: `package.json` + `pnpm-lock.yaml` (`pnpm remove sweetalert2`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `useToast()` — identical API to today. New named exports from `app/composables/useToast.js`: `toasts` (reactive array of `{ id, kind, title, position, duration }`), `dismissToast(id)`, `TOAST_DURATION_MS` (4000). Positions: `"top"`, `"top-right"`, `"bottom-right"`. Kinds: `"success"`, `"error"`, `"info"`.

- [ ] **Step 1: Rewrite `app/composables/useToast.js`**

```js
// Native toast queue — replaces sweetalert2 (~27 KB gzip + injected CSS).
// The queue lives at module level so every caller (Pinia stores included)
// shares it; AppToaster.vue (mounted once in app.vue) renders it. The
// public useToast() API is unchanged from the sweetalert2 version.
import { reactive } from "vue";

export const TOAST_DURATION_MS = 4000;
export const toasts = reactive([]);
let seq = 0;

export function dismissToast(id) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i > -1) toasts.splice(i, 1);
}

const errorColor = "red";
const successColor = "green";
const successIcon = "success";
const errorIcon = "warning";

const positionTop = "top";
const positionBottomRight = "bottom-right";
const positionTopRight = "top-right";

const KNOWN_POSITIONS = new Set([positionTop, positionTopRight, positionBottomRight]);

// sweetalert2 callers expressed intent as (iconColor, icon); collapse both
// onto one kind so the toaster only needs three visual variants.
function toKind(color, icon) {
  if (color === errorColor || icon === "warning" || icon === "error") return "error";
  if (icon === "info" || icon === "question") return "info";
  return "success";
}

function pushToast({ color, icon, title, position }) {
  // Toasts are a client concern; a store firing during SSR just no-ops.
  if (import.meta.server) return Promise.resolve();
  const id = ++seq;
  toasts.push({
    id,
    kind: toKind(color, icon),
    title: title == null ? "" : String(title),
    position: KNOWN_POSITIONS.has(position) ? position : positionTop,
    duration: TOAST_DURATION_MS,
  });
  return Promise.resolve({ id });
}

export function useToast() {
  // Same shape callers already use: Toast(color, position).fire({ icon, title }).
  const Toast = (color, position = positionTop) => ({
    fire(options = {}) {
      return pushToast({ color, icon: options.icon, title: options.title, position });
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

- [ ] **Step 2: Create `app/components/ui/AppToast.vue`**

```vue
<script setup>
/**
 * AppToast — one toast row. Owns its own auto-dismiss timer (pauses while
 * hovered or focused, like sweetalert2's timerProgressBar did) and emits
 * `dismiss` when the timer ends or the close button is pressed.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  toast: { type: Object, required: true },
});
const emit = defineEmits(["dismiss"]);

const ICONS = {
  success: "tabler:circle-check",
  error: "tabler:alert-triangle",
  info: "tabler:info-circle",
};
const ICON_CLASS = {
  success: "text-success",
  error: "text-destructive",
  info: "text-muted-foreground",
};

let timer = null;
let startedAt = 0;
let remaining = props.toast.duration;
const running = ref(false);

function start() {
  if (timer || remaining <= 0) return;
  startedAt = performance.now();
  running.value = true;
  timer = setTimeout(() => emit("dismiss"), remaining);
}
function pause() {
  if (!timer) return;
  clearTimeout(timer);
  timer = null;
  remaining -= performance.now() - startedAt;
  running.value = false;
}

onMounted(start);
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div
    class="app-toast pointer-events-auto relative flex w-full items-start gap-2.5 overflow-hidden rounded-lg border border-border-strong bg-card px-3 py-2.5 text-card-foreground elevation-3"
    :class="toast.kind === 'error' ? 'text-destructive' : ''"
    @mouseenter="pause"
    @mouseleave="start"
    @focusin="pause"
    @focusout="start"
  >
    <Icon
      :name="ICONS[toast.kind] ?? ICONS.info"
      class="mt-px h-5 w-5 shrink-0"
      :class="ICON_CLASS[toast.kind] ?? ICON_CLASS.info"
      aria-hidden="true"
    />
    <p class="grow text-sm font-medium leading-snug">{{ toast.title }}</p>
    <button
      type="button"
      class="-mr-1 -mt-0.5 shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      aria-label="Dismiss notification"
      @click="emit('dismiss')"
    >
      <Icon name="tabler:x" class="h-4 w-4" aria-hidden="true" />
    </button>
    <span
      class="app-toast-progress absolute bottom-0 left-0 h-0.5 w-full bg-current"
      :class="running ? 'app-toast-progress--running' : ''"
      :style="{ animationDuration: toast.duration + 'ms' }"
      aria-hidden="true"
    ></span>
  </div>
</template>
```

- [ ] **Step 3: Create `app/components/ui/AppToaster.vue`**

```vue
<script setup>
/**
 * AppToaster — renders the shared toast queue from useToast.js. Mounted once
 * in app.vue. One fixed stack per position; each stack is a polite live
 * region so screen readers announce new toasts without focus moving. During
 * SSR it renders only the (empty) live regions.
 */
import { computed } from "vue";
import { toasts, dismissToast } from "@/composables/useToast";
import AppToast from "./AppToast.vue";

const POSITIONS = ["top", "top-right", "bottom-right"];
const POSITION_CLASS = {
  top: "top-3 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-3 right-3 items-end",
  "bottom-right": "bottom-3 right-3 items-end",
};

const groups = computed(() =>
  POSITIONS.map((position) => ({
    position,
    items: toasts.filter((t) => t.position === position),
  }))
);
</script>

<template>
  <div data-app-toaster>
    <div
      v-for="group in groups"
      :key="group.position"
      class="pointer-events-none fixed z-[100] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2"
      :class="POSITION_CLASS[group.position]"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="app-toast">
        <AppToast
          v-for="t in group.items"
          :key="t.id"
          :toast="t"
          @dismiss="dismissToast(t.id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Mount in `app/app.vue`**

Add `import AppToaster from "@/components/ui/AppToaster.vue";` next to the `CollectAllModals` import and render `<AppToaster />` immediately after `<CollectAllModals />` in the template.

- [ ] **Step 5: Replace the CSS block in `app/assets/css/style.css`**

Replace everything from the comment `/* SweetAlert2 toast theming */` through the closing brace of `.colored-toast .swal2-html-container { … }` with:

```css
/* Native toast (AppToast.vue / AppToaster.vue) */
.app-toast-progress {
  transform-origin: left;
  animation: app-toast-shrink linear forwards;
  animation-play-state: paused;
  opacity: 0.6;
}
.app-toast-progress--running {
  animation-play-state: running;
}
@keyframes app-toast-shrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
.app-toast-enter-active,
.app-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
@media (prefers-reduced-motion: reduce) {
  .app-toast-enter-active,
  .app-toast-leave-active {
    transition: none;
  }
}
```

- [ ] **Step 6: Remove the package**

Run: `pnpm remove sweetalert2`
Run: `grep -rn "sweetalert\|swal2\|colored-toast" app nuxt.config.js package.json` → Expected: no output.

- [ ] **Step 7: Verify**

Run: `pnpm build 2>&1 | tail -5` → Expected: build succeeds.
Run: `PORT=3131 node .output/server/index.mjs & sleep 4; curl -s http://localhost:3131/ | grep -o 'data-app-toaster' | head -1; kill %1` → Expected: `data-app-toaster` (the live regions are SSR'd).
Browser check: temporarily add `onMounted(() => useToast().fireSuccessToast("Toast OK", "top-right"))` to `app/app.vue` (import `useToast` from `@/composables/useToast`), run `pnpm dev` in the background, open `http://localhost:5079/` in headless Chrome (`npx --yes playwright@latest screenshot` is NOT available — use `google-chrome --headless=new --screenshot` / the Chrome MCP tools, or `curl` the page and inspect the client bundle) and confirm an `.app-toast` element with text "Toast OK" appears top-right, its progress bar shrinks, and it disappears after ≈4 s. Then **remove the temporary line before committing** — `git diff app/app.vue` must show only the import and the `<AppToaster />` mount. Kill the dev server.

- [ ] **Step 8: Commit**

```bash
git add app/composables/useToast.js app/components/ui/AppToast.vue app/components/ui/AppToaster.vue app/app.vue app/assets/css/style.css package.json pnpm-lock.yaml
git commit -m "feat(ui): native toast stack, drop sweetalert2

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `AppCarousel` scroll-snap primitive, migrate the three swiper consumers, remove `swiper`

**Files:**
- Create: `app/components/ui/AppCarousel.vue`
- Create: `app/components/ui/AppCarouselSlide.vue`
- Modify: `app/assets/css/style.css` (append carousel utilities right after the toast block from Task 1)
- Modify: `app/components/community-bets/CategoryPagination.vue` (rewrite)
- Modify: `app/components/community-bets/BookedBetsCategory.vue` (imports lines 4–11; `<swiper>` block lines 45–58)
- Modify: `app/components/community-bets/SelectionsCard.vue` (imports lines 5–15; `<swiper>` block lines 78–100)
- Modify: `app/components/affiliate/AffiliateSwiper.vue` (rewrite)
- Modify: `nuxt.config.js:715` (comment mentions "swiper-vue" CSS — reword)
- Modify: `package.json` + `pnpm-lock.yaml` (`pnpm remove swiper`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `AppCarousel` props `{ count: Number (required), autoplay: Number ms (0 = off), ariaLabel: String, trackClass: String }`, emits `change(index)`, provides `"app-carousel"` = reactive `{ index, count, isFirst, isLast, prev(), next(), goTo(i) }` and exposes the same object via `defineExpose`; slot `default` (slides, each wrapped in `<AppCarouselSlide>`), slot `controls` receives that API as slot props.

- [ ] **Step 1: Create `app/components/ui/AppCarousel.vue`**

```vue
<script setup>
/**
 * AppCarousel — native replacement for Swiper (one slide per view, 30 px
 * gap, no infinite loop). The browser does the swiping via CSS scroll-snap
 * (see TheBanner.vue for the same technique); JS only tracks the active
 * index, drives prev/next/goTo, and runs an optional autoplay tick that
 * wraps to the first slide. Slides go in the default slot, each wrapped in
 * <AppCarouselSlide>. The `controls` slot (and inject("app-carousel"))
 * receive { index, count, isFirst, isLast, prev, next, goTo }.
 *
 * Keyboard: the track is focusable; ArrowLeft/ArrowRight move one slide.
 * Autoplay respects prefers-reduced-motion and pauses while the tab is
 * hidden. It is not paused on hover, matching Swiper's
 * `disableOnInteraction: false` behaviour the affiliate slider relied on.
 */
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from "vue";

const props = defineProps({
  count: { type: Number, required: true },
  /** Autoplay interval in ms; 0 disables autoplay. */
  autoplay: { type: Number, default: 0 },
  ariaLabel: { type: String, default: "Carousel" },
  /** Extra classes for the scrolling track (e.g. "h-full"). */
  trackClass: { type: String, default: "" },
});
const emit = defineEmits(["change"]);

const track = ref(null);
const index = ref(0);

function stride(el) {
  const first = el?.firstElementChild;
  if (!first) return 0;
  return first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
}

function goTo(i, behavior = "smooth") {
  const el = track.value;
  if (!el || props.count < 1) return;
  const target = Math.min(Math.max(i, 0), props.count - 1);
  const s = stride(el);
  if (s > 0) el.scrollTo({ left: target * s, behavior });
}
function prev() {
  goTo(index.value - 1);
}
function next() {
  goTo(index.value + 1);
}
function autoplayNext() {
  goTo(index.value >= props.count - 1 ? 0 : index.value + 1);
}

let raf = null;
function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = null;
    const el = track.value;
    const s = stride(el);
    const i = s > 0 ? Math.round(el.scrollLeft / s) : 0;
    if (i !== index.value) {
      index.value = i;
      emit("change", i);
    }
  });
}

let timer = null;
function startAutoplay() {
  stopAutoplay();
  if (!props.autoplay || props.count < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = setInterval(autoplayNext, props.autoplay);
}
function stopAutoplay() {
  if (timer) clearInterval(timer);
  timer = null;
}
function onVisibility() {
  document.hidden ? stopAutoplay() : startAutoplay();
}

function onKeydown(e) {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  }
}

onMounted(() => {
  startAutoplay();
  document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
  stopAutoplay();
  document.removeEventListener("visibilitychange", onVisibility);
  if (raf) cancelAnimationFrame(raf);
});
watch(
  () => props.count,
  (c) => {
    if (index.value > c - 1) goTo(Math.max(c - 1, 0), "auto");
    startAutoplay();
  }
);

const api = reactive({
  index,
  count: computed(() => props.count),
  isFirst: computed(() => index.value <= 0),
  isLast: computed(() => index.value >= props.count - 1),
  prev,
  next,
  goTo,
});
provide("app-carousel", api);
defineExpose(api);
</script>

<template>
  <div
    class="relative"
    role="region"
    :aria-label="ariaLabel"
    aria-roledescription="carousel"
    @keydown="onKeydown"
  >
    <div
      ref="track"
      class="app-carousel-track"
      :class="trackClass"
      tabindex="0"
      @scroll.passive="onScroll"
    >
      <slot />
    </div>
    <slot name="controls" v-bind="api" />
  </div>
</template>
```

- [ ] **Step 2: Create `app/components/ui/AppCarouselSlide.vue`**

```vue
<script setup>
/** One AppCarousel slide: full track width, snaps at the start edge. */
</script>

<template>
  <div class="app-carousel-slide" role="group" aria-roledescription="slide">
    <slot />
  </div>
</template>
```

- [ ] **Step 3: Append carousel CSS to `app/assets/css/style.css`** (directly after the toast block)

```css
/* Native carousel (AppCarousel.vue) — 30 px gap matches the old Swiper spaceBetween */
.app-carousel-track {
  display: flex;
  column-gap: 1.875rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  outline: none;
}
.app-carousel-track::-webkit-scrollbar {
  display: none;
}
.app-carousel-track:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
.app-carousel-slide {
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

- [ ] **Step 4: Rewrite `app/components/community-bets/CategoryPagination.vue`**

```vue
<script setup>
// Prev / counter / Next for an AppCarousel; must be rendered inside the
// carousel's `controls` slot so inject() finds it.
import { inject } from "vue";

const carousel = inject("app-carousel", null);
if (!carousel) {
  throw new Error("CategoryPagination must be used inside <AppCarousel>");
}
</script>

<template>
  <div class="flex items-center justify-between pt-3">
    <button
      type="button"
      :disabled="carousel.isFirst"
      :class="carousel.isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:text-brand-bright/80'"
      class="flex items-center gap-0.5 text-xs font-medium text-brand-bright transition-colors"
      aria-label="Previous bet"
      @click="carousel.prev()"
    >
      <Icon name="tabler:chevron-left" class="w-4 h-4" />
      Prev
    </button>

    <span class="text-xs text-muted-foreground tabular-nums">
      {{ carousel.index + 1 }} / {{ carousel.count }}
    </span>

    <button
      type="button"
      :disabled="carousel.isLast"
      :class="carousel.isLast ? 'opacity-30 cursor-not-allowed' : 'hover:text-brand-bright/80'"
      class="flex items-center gap-0.5 text-xs font-medium text-brand-bright transition-colors"
      aria-label="Next bet"
      @click="carousel.next()"
    >
      Next
      <Icon name="tabler:chevron-right" class="w-4 h-4" />
    </button>
  </div>
</template>
```

- [ ] **Step 5: Migrate `BookedBetsCategory.vue`**

Script: delete the three swiper imports and `const modules = …`; add `import AppCarousel from "../ui/AppCarousel.vue"; import AppCarouselSlide from "../ui/AppCarouselSlide.vue";` (the file already uses relative imports).

Template — replace the `<swiper …>…</swiper>` block with:

```vue
        <AppCarousel :count="hub.bets.length" :aria-label="`${hub.categoryName} bets`">
          <AppCarouselSlide v-for="bet in hub.bets" :key="bet.shareBet">
            <SelectionsCard :booking-code="bet.shareBet" :selections="bet.slip" />
          </AppCarouselSlide>
          <template #controls>
            <CategoryPagination />
          </template>
        </AppCarousel>
```

- [ ] **Step 6: Migrate `SelectionsCard.vue`**

Script: delete the four swiper imports and `const modules = …`; add `import AppCarousel from "../ui/AppCarousel.vue"; import AppCarouselSlide from "../ui/AppCarouselSlide.vue";`.

Template — replace the `<swiper …>…</swiper>` block with:

```vue
      <AppCarousel :count="chunkedItems.length" aria-label="Selections">
        <AppCarouselSlide v-for="(pair, index) in chunkedItems" :key="index">
          <div
            class="bg-card cursor-pointer rounded-lg p-2.5 pb-4 space-y-2 border border-border/30"
            @click="addToBetslip"
          >
            <BookedSelection
              v-for="(item, index2) in pair"
              :key="index2"
              :selection="item"
              :index="index * chunkSize + index2"
            />
          </div>
        </AppCarouselSlide>
        <template #controls="{ index: active, count, isFirst, isLast, prev, next, goTo }">
          <template v-if="count > 1">
            <button
              type="button"
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 rounded-full bg-card/90 border border-border p-1 text-foreground hover:text-brand-bright disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="isFirst"
              aria-label="Previous selections"
              @click="prev()"
            >
              <Icon name="tabler:chevron-left" class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 rounded-full bg-card/90 border border-border p-1 text-foreground hover:text-brand-bright disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="isLast"
              aria-label="Next selections"
              @click="next()"
            >
              <Icon name="tabler:chevron-right" class="w-4 h-4" />
            </button>
            <div class="flex justify-center gap-1.5 pt-2">
              <button
                v-for="i in count"
                :key="i"
                type="button"
                class="h-1.5 rounded-full transition-all"
                :class="i - 1 === active ? 'w-4 bg-brand-bright' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground'"
                :aria-label="`Go to selections ${i} of ${count}`"
                :aria-current="i - 1 === active ? 'true' : undefined"
                @click="goTo(i - 1)"
              ></button>
            </div>
          </template>
        </template>
      </AppCarousel>
```

(`index` is renamed `active` in the slot destructure because the outer `v-for` already binds `index`.) The arrow buttons must be positioned relative to the carousel root, which already has `class="relative"`; the track is the arrows' sibling, so they overlay its edges.

- [ ] **Step 7: Rewrite `AffiliateSwiper.vue`**

```vue
<script setup>
import { onMounted, ref } from "vue";
import AppCarousel from "../ui/AppCarousel.vue";
import AppCarouselSlide from "../ui/AppCarouselSlide.vue";
import TopEarners from "./TopEarners.vue";

const autoplayDelay = 10000;

const loaderStyle = ref({
  width: "0%",
  transition: "none",
});

const startLoader = () => {
  loaderStyle.value = { width: "0%", transition: "none" };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loaderStyle.value = {
        width: "100%",
        transition: `width ${autoplayDelay}ms linear`,
      };
    });
  });
};

onMounted(() => {
  startLoader();
});
</script>

<template>
  <div class="w-full overflow-hidden mb-4">
    <div class="relative w-full h-32 md:h-48 rounded-xl overflow-hidden bg-card">
      <AppCarousel
        :count="2"
        :autoplay="autoplayDelay"
        aria-label="Affiliate highlights"
        class="h-full"
        track-class="h-full"
        @change="startLoader"
      >
        <AppCarouselSlide class="h-full">
          <AffiliateCall />
        </AppCarouselSlide>
        <AppCarouselSlide class="h-full">
          <TopEarners />
        </AppCarouselSlide>
      </AppCarousel>

      <!-- Progress bar -->
      <div class="absolute z-10 bottom-0 w-full">
        <div class="h-0.5 bg-border/30">
          <div
            class="h-full bg-brand-bright"
            :style="loaderStyle"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 8: `nuxt.config.js` comment + remove the package**

At `nuxt.config.js:715` change `(swiper-vue, useFlyToBetslip)` to `(useFlyToBetslip)`. Then:
Run: `pnpm remove swiper`
Run: `grep -rn "swiper" app nuxt.config.js package.json` → Expected: only the historical comment in `app/components/TheBanner.vue` (leave it).

- [ ] **Step 9: Verify**

Run: `pnpm build 2>&1 | tail -5` → Expected: success.
Run: `grep -l "swiper" .output/public/_nuxt/*.js | head` → Expected: no output (no swiper code in the bundle).
Browser check with `pnpm dev` (background, port 5079) and headless Chrome / the Chrome MCP tools: open `/share-bets` (renders `BookedBetsCategory` via `ShareBetsPage.vue`) and `/join-affiliate`; confirm (a) a category card shows one bet at a time, Prev is disabled at `1 / N`, Next advances the counter and the visible bet, the selections card's dots/arrows work and the arrows disable at the ends; (b) the affiliate slider advances by itself after 10 s and the progress bar restarts from 0. Record the observations in the report. If `/share-bets` has no data locally, note that and verify the component logic via the `/join-affiliate` slider plus a build-time check only. Kill the dev server.

- [ ] **Step 10: Commit**

```bash
git add app/components/ui/AppCarousel.vue app/components/ui/AppCarouselSlide.vue app/assets/css/style.css app/components/community-bets app/components/affiliate/AffiliateSwiper.vue nuxt.config.js package.json pnpm-lock.yaml
git commit -m "feat(ui): scroll-snap AppCarousel, drop swiper

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Isomorphic `sanitizeHtml` on `ultrahtml`, remove `dompurify`

**Files:**
- Create: `app/utils/sanitizeHtml.js`
- Create: `scripts/test-sanitize-html.mjs` (plain-node assertion script; no test framework exists in this repo)
- Modify: `app/components/promos/PromotionDetails.vue` (line 5 import; lines 12–18 computed; line 128 comment)
- Modify: `package.json` + `pnpm-lock.yaml` (`pnpm add ultrahtml@^1.7.0`, then `pnpm remove dompurify`)

**Interfaces:**
- Produces: `sanitizeHtml(html) => string` from `@/utils/sanitizeHtml` (also auto-imported by Nuxt from `app/utils/`).

- [ ] **Step 1: Add the dependency**

Run: `pnpm add ultrahtml@^1.7.0` → Expected: `package.json` gains `"ultrahtml": "^1.7.0"` under `dependencies`; `ls node_modules/ultrahtml/dist/index.js` exists. `git diff package.json` shows no other change.

- [ ] **Step 2: Write the failing test script `scripts/test-sanitize-html.mjs`**

```js
// Assertion script for app/utils/sanitizeHtml.js (no test framework in this
// repo). Run: node scripts/test-sanitize-html.mjs
import assert from "node:assert/strict";
import { sanitizeHtml } from "../app/utils/sanitizeHtml.js";

const cases = [
  ["keeps prose", "<p>Hi <strong>there</strong></p>", "<p>Hi <strong>there</strong></p>"],
  ["drops script with content", "<script>alert(1)</script><p>x</p>", "<p>x</p>"],
  ["drops event handlers", '<img src="x.png" onerror="alert(1)">', '<img src="x.png">'],
  ["drops javascript: href", '<a href="javascript:alert(1)">l</a>', "<a>l</a>"],
  ["drops obfuscated javascript: href", '<a href=" JaVa\tScRiPt:alert(1)">l</a>', "<a>l</a>"],
  ["drops data: href", '<a href="data:text/html,x">l</a>', "<a>l</a>"],
  ["drops protocol-relative href", '<a href="//evil.example/x">l</a>', "<a>l</a>"],
  ["keeps https href, forces rel on _blank", '<a href="https://x.y/p?q=1&amp;r=2" target="_blank">l</a>', '<a href="https://x.y/p?q=1&amp;r=2" target="_blank" rel="noopener noreferrer">l</a>'],
  ["drops rel/target when not _blank", '<a href="/promo" target="_self" rel="opener">l</a>', '<a href="/promo">l</a>'],
  ["keeps mailto and tel", '<a href="mailto:a@b.c">m</a><a href="tel:+254700000000">t</a>', '<a href="mailto:a@b.c">m</a><a href="tel:+254700000000">t</a>'],
  ["drops style/class/onclick", '<div style="color:red" class="x" onclick="x()">t</div>', "<div>t</div>"],
  ["drops iframe entirely", '<iframe src="https://evil"></iframe>', ""],
  ["drops svg and its children", "<svg><script>1</script><a href='x'>y</a></svg>", ""],
  ["drops custom elements", "<my-el>t</my-el>", ""],
  ["drops form controls", '<form action="/x"><input name="a"><button>go</button></form>', ""],
  ["unwraps unknown elements but keeps text", "<section><article>t</article></section>", "t"],
  ["keeps entities untouched", "<p>Tom &amp; Jerry &lt;3 &nbsp;ok</p>", "<p>Tom &amp; Jerry &lt;3 &nbsp;ok</p>"],
  ["escapes stray < in text", "<p>a < b</p>", "<p>a &lt; b</p>"],
  ["escapes quotes in attribute values", `<a href="https://x" title='"><img src=x onerror=1>'>l</a>`, '<a href="https://x" title="&quot;&gt;&lt;img src=x onerror=1&gt;">l</a>'],
  ["lowercases tags and drops unknown attrs", '<P CLASS="x" ID="y">t</P>', "<p>t</p>"],
  ["keeps table structure", '<table><tr><td colspan="2">c</td></tr></table>', '<table><tr><td colspan="2">c</td></tr></table>'],
  ["drops comments", "<!-- hi --><p>t</p>", "<p>t</p>"],
  ["empty string", "", ""],
  ["null", null, ""],
  ["undefined", undefined, ""],
];

let failed = 0;
for (const [name, input, expected] of cases) {
  const actual = sanitizeHtml(input);
  try {
    assert.equal(actual, expected);
    console.log("ok   ", name);
  } catch {
    failed++;
    console.log("FAIL ", name, "\n   expected:", JSON.stringify(expected), "\n   actual:  ", JSON.stringify(actual));
  }
}
if (failed) {
  console.log(`${failed} failing`);
  process.exit(1);
}
console.log(`all ${cases.length} passed`);
```

Run: `node scripts/test-sanitize-html.mjs` → Expected: fails with `Cannot find module …/app/utils/sanitizeHtml.js`.

- [ ] **Step 3: Create `app/utils/sanitizeHtml.js`**

```js
// Allow-list HTML sanitiser for CMS-authored rich text (promotion
// descriptions) rendered via v-html. Built on ultrahtml — a small pure-JS
// parser that Nuxt itself depends on — so it runs identically during SSR
// and on the client (DOMPurify was a no-op on the server, which meant the
// server response carried the raw CMS HTML until hydration).
//
// Policy: elements not in ALLOWED are unwrapped (their text survives);
// elements in DROP — and any custom element — are removed with their
// subtree; only the attributes listed per element survive; href/src must
// use a safe scheme or be same-origin relative; target is only ever
// "_blank" and then always carries rel="noopener noreferrer"; comments and
// doctypes are removed.
import {
  COMMENT_NODE,
  DOCTYPE_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  parse,
  renderSync,
  walkSync,
} from "ultrahtml";

const LINK_ATTRS = ["href", "target", "rel", "title"];
const CELL_ATTRS = ["colspan", "rowspan"];

const ALLOWED = {
  p: [], br: [], hr: [],
  strong: [], b: [], em: [], i: [], u: [], s: [], small: [], sub: [], sup: [],
  span: [], div: [], blockquote: [], pre: [], code: [],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
  ul: [], ol: ["start"], li: [],
  a: LINK_ATTRS,
  img: ["src", "alt", "width", "height"],
  table: [], thead: [], tbody: [], tfoot: [], tr: [],
  th: CELL_ATTRS, td: CELL_ATTRS,
};

const DROP = new Set([
  "script", "style", "iframe", "frame", "object", "embed", "svg", "math",
  "template", "form", "input", "button", "textarea", "select", "option",
  "link", "meta", "base", "noscript", "video", "audio", "source", "canvas",
]);

// http(s), mailto, tel, same-origin relative ("/x" but not "//host"), "#x", "./x", "../x"
const SAFE_URL = /^(?:https?:|mailto:|tel:|\/(?!\/)|#|\.{1,2}\/)/i;
// ASCII control characters and whitespace that browsers ignore inside a
// scheme ("java\tscript:"), plus C1 controls.
const URL_NOISE = /[\u0000-\u0020\u007f-\u009f]/g;

function isSafeUrl(value) {
  const cleaned = value.replace(URL_NOISE, "");
  return cleaned === "" || SAFE_URL.test(cleaned);
}

function escapeAttr(value) {
  return value.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cleanAttributes(name, attributes, allowed) {
  const out = {};
  for (const [rawKey, rawValue] of Object.entries(attributes ?? {})) {
    const key = rawKey.toLowerCase();
    if (!allowed.includes(key)) continue;
    const value = rawValue == null ? "" : String(rawValue);
    if ((key === "href" || key === "src") && !isSafeUrl(value)) continue;
    out[key] = escapeAttr(value);
  }
  if (name === "a") {
    if (out.target !== "_blank") delete out.target;
    if (out.target === "_blank") out.rel = "noopener noreferrer";
    else delete out.rel;
  }
  return out;
}

function removeChild(parent, node) {
  if (!parent?.children) return;
  parent.children = parent.children.filter((child) => child !== node);
}

function unwrapChild(parent, node) {
  if (!parent?.children) return;
  parent.children = parent.children.flatMap((child) => (child === node ? child.children : child));
}

export function sanitizeHtml(html) {
  if (html == null || html === "") return "";
  const doc = parse(String(html));
  const actions = [];

  walkSync(doc, (node, parent) => {
    switch (node.type) {
      case COMMENT_NODE:
      case DOCTYPE_NODE:
        actions.push(() => removeChild(parent, node));
        return;
      case TEXT_NODE:
        // ultrahtml keeps text verbatim (entities untouched); a bare "<"
        // it did not treat as a tag could still open one for the browser.
        actions.push(() => {
          node.value = node.value.replace(/</g, "&lt;");
        });
        return;
      case ELEMENT_NODE: {
        const name = node.name.toLowerCase();
        if (DROP.has(name) || name.includes("-")) {
          actions.push(() => removeChild(parent, node));
          return;
        }
        const allowed = ALLOWED[name];
        if (!allowed) {
          actions.push(() => unwrapChild(parent, node));
          return;
        }
        actions.push(() => {
          node.name = name;
          node.attributes = cleanAttributes(name, node.attributes, allowed);
        });
        return;
      }
      default:
        return;
    }
  });

  // Children before parents, so a dropped subtree never gets rewritten
  // into a parent that is itself about to be unwrapped.
  for (let i = actions.length - 1; i >= 0; i--) actions[i]();
  return renderSync(doc);
}
```

- [ ] **Step 4: Run the test script**

Run: `node scripts/test-sanitize-html.mjs` → Expected: `all 25 passed`. If ultrahtml's `renderSync` output differs in a purely syntactic way (e.g. it renders `<img …>` as `<img … />`, or `<br>` as `<br />`), adjust the **expected strings** to the actual serialisation — but any case where dangerous content survives (a script, an event handler, an unsafe URL, an unescaped quote) is a bug in the sanitiser to fix, never in the test. Note in the report every expectation you changed and why. If `walkSync` does not pass `parent` as the second callback argument in this ultrahtml version, read `node_modules/ultrahtml/dist/index.js` and adapt (`node.parent` is set on every node by the parser).

- [ ] **Step 5: Wire into `PromotionDetails.vue`**

Delete `import DOMPurify from "dompurify";`. Replace the `sanitizedDescription` computed with:

```js
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const sanitizedDescription = computed(() =>
  sanitizeHtml(selectedPromo.value?.description)
);
```

Change the template comment `<!-- sanitized via DOMPurify in sanitizedDescription computed -->` to `<!-- sanitized via sanitizeHtml (ultrahtml allow-list, runs on server and client) -->`.

- [ ] **Step 6: Remove `dompurify`, verify**

Run: `pnpm remove dompurify`
Run: `grep -rn "dompurify\|DOMPurify" app package.json nuxt.config.js` → Expected: no output.
Run: `pnpm build 2>&1 | tail -5` → Expected: success.
Run: `node scripts/test-sanitize-html.mjs` → Expected: all passed.
Run: `PORT=3131 node .output/server/index.mjs & sleep 4; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3131/promotion-details/test; kill %1` → Expected: `200` (the page renders with an empty description when no promo is selected). Kill the server.

- [ ] **Step 7: Commit**

```bash
git add app/utils/sanitizeHtml.js scripts/test-sanitize-html.mjs app/components/promos/PromotionDetails.vue package.json pnpm-lock.yaml
git commit -m "feat: isomorphic allow-list HTML sanitizer on ultrahtml, drop dompurify

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Whole-change verification and results note

**Files:**
- Modify: `docs/superpowers/plans/2026-08-29-native-toast-carousel-sanitizer.md` (append a `## Results` section)

- [ ] **Step 1: Dependency and bundle audit**

Run: `git diff e42fc69 -- package.json` → Expected: exactly three removed dependency lines (`dompurify`, `sweetalert2`, `swiper`) and one added (`ultrahtml`).
Run: `pnpm install --frozen-lockfile 2>&1 | tail -2` → Expected: succeeds (lockfile consistent).
Run: `pnpm build 2>&1 | tail -3`, then `node scripts/critical-bytes.mjs` the way `docs/superpowers/plans/2026-08-27-lighthouse-perf-round-6.md` documents → record the home-page critical-bytes line.
Run: `du -sh .output/public/_nuxt | cut -f1` and `ls .output/public/_nuxt/*.js | wc -l` → record.

- [ ] **Step 2: Lighthouse a11y + perf, local**

Load `.env` with a `while read` loop (never `source` it — the file uses `KEY= value`), start the built server on port 3131, and run
`npx lighthouse http://localhost:3131/ --only-categories=performance,accessibility --output=json --output-path=<scratchpad>/lh-native-libs.json --chrome-flags="--headless=new" --quiet` with `npm_config_cache` pointing into the scratchpad. Extract perf/a11y scores and the four core metrics. Also run accessibility-only against `/share-bets` and `/join-affiliate`. Kill the server.

- [ ] **Step 3: Append the `## Results` section** to this plan with: packages removed/added (sweetalert2 ≈27 KB gzip, swiper ≈26 KB gzip per the earlier measurements; ultrahtml size from `du -sh node_modules/ultrahtml/dist`), bundle numbers from Step 1, Lighthouse numbers from Step 2, browser observations from Tasks 1–2, anything deferred.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-08-29-native-toast-carousel-sanitizer.md
git commit -m "docs: results for the native toast/carousel/sanitizer plan

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Results

### Commits

- `a81fda2` — feat(ui): native toast stack, drop sweetalert2
- `3d69747` — fix(ui): resume toast timer only when neither hovered nor focused
- `1169777` — feat(ui): scroll-snap AppCarousel, drop swiper
- `972ae69` — feat: isomorphic allow-list HTML sanitizer on ultrahtml, drop dompurify
- `8d4a62b` — fix(security): decode entities before URL scheme check in sanitizeHtml

### Step 1: Dependency and bundle audit

`git diff e42fc69 -- package.json` matches expectation exactly: three dependency lines removed (`dompurify: "^3.4.10"`, `sweetalert2: "^11.26.25"`, `swiper: "^14.0.7"`), one added (`ultrahtml: "^1.7.0"`). No other `dependencies`/`devDependencies` entries touched. (Two docs-only commits, `3998363` and `d7ce391`, sit between `e42fc69` and the code work; they don't affect this diff.)

`pnpm install --frozen-lockfile` succeeded — lockfile is consistent with `package.json`.

`pnpm build` succeeded (`✨ Build complete!`, `Σ Total size: 45.3 MB (10.4 MB gzip)`).

Home-page critical-path bytes (`node scripts/critical-bytes.mjs http://localhost:3131/`):

```
modulepreload=67 js_gzip=219KB stylesheets=1 css_gzip=36KB html_gzip=39KB
```

Bundle footprint: `.output/public/_nuxt` = **4.6M**, **187** JS files.

Package sizes removed/added:
- `sweetalert2` ≈ 27 KB gzip (removed, per the earlier round-6-era measurement)
- `swiper` ≈ 26 KB gzip (removed, per the earlier measurement)
- `dompurify` (removed; no earlier gzip figure recorded for it in this plan)
- `ultrahtml` added — `du -sh node_modules/ultrahtml/dist` = **168K** on disk (uncompressed dist folder, not a gzip bundle-contribution figure)

### Step 2: Lighthouse, local (built server, port 3131)

Home page (`/`), performance + accessibility, run twice to gauge noise:

| Run | Perf | A11y | FCP | LCP | TBT | CLS |
|-----|------|------|-----|-----|-----|-----|
| 1 | 60 | 95 | 4.4 s | 6.0 s | 330 ms | 0.031 |
| 2 | 60 | 95 | 4.5 s | 6.0 s | 300 ms | 0.034 |

Perf and a11y scores were identical across both runs; only TBT and CLS show typical run-to-run noise. No regression signal versus prior rounds — this task did not touch anything on the home page's critical rendering path (toast/carousel/sanitizer code is not loaded/executed on `/` by default).

Accessibility-only, other pages:

| Page | A11y |
|------|------|
| `/share-bets` | 95 |
| `/join-affiliate` | 85 |

`/join-affiliate` scores lower because, per Task 2's browser verification, direct unauthenticated navigation to that `ssr:false` + auth-gated route falls through to the app's client-side 404 shell rather than rendering the real page — a pre-existing routing/auth-guard behavior unrelated to the carousel migration (confirmed via `curl`: HTTP 200, default SPA-shell title, no SSR content). The 404 shell itself is what Lighthouse audited, not the migrated `AffiliateSwiper`/`AppCarousel` content.

### Browser observations (from Tasks 1–2, not re-run here)

- **Toast (Task 1):** headless-Chrome screenshots confirmed an `.app-toast` element renders top-right with the correct icon/text/close button, and fully auto-dismisses within its ~4000ms window. The independent hover/focus timer-restart bug found in review was fixed in `3d69747` (module-scoped `hovered`/`focused` booleans, `resumeIfIdle()`). SSR check: `data-app-toaster` present in the initial HTML on port 3131.
- **Carousel (Task 2):** `/share-bets` rendered its `EmptyState` locally (no booked-bets data in this dev environment), so `BookedBetsCategory`/`SelectionsCard` carousel paths were verified by code-match + clean build/bundle/eslint rather than live interaction. `/join-affiliate`, reached via a synthetic local session cookie (fabricated, not a real credential) to get past the auth gate, showed the `AppCarousel` autoplay correctly advancing between `AffiliateCall` and `TopEarners` slides (~10s interval) with the progress bar resetting on each `@change`, matching the old Swiper `@slide-change` behavior. No console errors attributable to any of the migrated components.
- **Sanitizer (Task 3):** `scripts/test-sanitize-html.mjs` — all 41 cases pass (27 original/adjusted + 14 CRITICAL entity-decoding regressions + 1 deep-nesting fail-closed case + 1 quote-escaping case, added in the `8d4a62b` security-review fix round). SSR check: `/promotion-details/test` returns `200`, but the whole-branch review found `app/components/promos/PromotionDetails.vue` is not referenced by any page — `app/pages/promotion-details/[name].vue` renders `PromoIndex.vue` instead — so `sanitizeHtml` is currently dormant, exactly as DOMPurify was before it (same dead component); runtime parity is preserved and `ultrahtml` adds zero bytes to any chunk. The sanitizer itself is fully unit-tested (41 cases) and becomes active if/when `PromotionDetails.vue` is wired into the page, a product decision deliberately not made in this plan.

### Deferred / worth a second look

- `app/app.vue` carries 10 pre-existing `import/first` ESLint errors (9 before Task 1, +1 from `AppToaster`'s import landing in the same disordered import block); not fixed, as it's out of this plan's scope (`app.vue` was only meant to receive two lines) and pre-exists the migration.
- `sanitizeHtml.js`'s `decodeEntities` runs its hex/decimal/named regex passes sequentially over the same string rather than as one non-chaining scan, so a contrived chained encoding (e.g. `&#x26;#106;`) could in principle double-decode. No known payload in the current test suite exercises this; flagged in the Task 3 report for a future review.
- `isSafeUrl`'s allow-list (`http`, `https`, `mailto`, `tel` schemes; anything with no scheme prefix at all treated as relative/safe) is slightly broader than the brief's original one-line description — correct against the test suite and DOMPurify's baseline, but worth a second look if promo HTML content policy needs tightening further (e.g. constraining query-string-only or fragment-only hrefs).
- No earlier gzip measurement for `dompurify` was available in this plan's history, so only sweetalert2 (~27 KB gzip) and swiper (~26 KB gzip) removals are quantified above; the `ultrahtml` addition is reported as an on-disk dist size (168K), not a directly comparable gzip figure.
- Both local Lighthouse runs on `/` scored perf 60, consistent with pre-existing baseline performance issues on this page (unrelated to this plan, which targeted no perf-affecting code on the home page) — not a regression introduced by this work, but not improved by it either since none of the removed libraries loaded on `/`.
