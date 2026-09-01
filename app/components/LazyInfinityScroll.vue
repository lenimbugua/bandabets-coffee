<script setup>
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, ref, toRefs, watch } from "vue";
import { useMatches2Store } from "../stores/matches2";
import { useSportsQueryParamsStore } from "../stores/sports-query-params";

const matchesStore = useMatches2Store();
const { getMatches } = matchesStore;
const { matches } = storeToRefs(matchesStore);
const { layout } = toRefs(useSportsQueryParamsStore());

const listEl = ref(null);
const sentinelEl = ref(null);

/* --- Infinite scroll ---
   A 1px sentinel sits after the slot content; an IntersectionObserver rooted
   on the scroll container fires when the sentinel comes within 600px of the
   viewport, and we fetch the next page. Rules that keep it sane:
   - `loadingMore` gates concurrent fetches.
   - scrollTop is never touched after a fetch: appended items simply extend
     the list below the user's position. (The old vueuse version set
     scrollTop = scrollHeight here — a no-op against the <Lazy> component
     instance it was written for, but a jump-to-bottom loop against a real
     element.)
   - After a fetch that grew the list, the sentinel is re-observed so a
     still-short page keeps filling until it overflows the container.
   - A fetch that grows nothing marks the feed exhausted; any change to the
     match list (new sport, new filter) re-arms it. */
let observer = null;
let loadingMore = false;
let exhausted = false;

function pokeObserver() {
  if (observer && sentinelEl.value) {
    observer.unobserve(sentinelEl.value);
    observer.observe(sentinelEl.value);
  }
}

async function loadMore() {
  if (loadingMore || exhausted || layout.value === "grid") return;
  loadingMore = true;
  const before = matches.value?.length ?? 0;
  try {
    await getMatches();
  } finally {
    loadingMore = false;
  }
  const after = matches.value?.length ?? 0;
  if (after > before) {
    pokeObserver();
  } else {
    exhausted = true;
  }
}

watch(
  () => matches.value?.length ?? 0,
  (now, prev) => {
    // The list was replaced or reset (sport/filter change) — start over.
    if (now < prev) {
      exhausted = false;
      pokeObserver();
    }
  },
);

watch(layout, (val) => {
  if (val !== "grid") {
    exhausted = false;
    pokeObserver();
  }
});

// --- Scroll lock: prevent browser/infinite-scroll from jumping past hero ---
const scrollLocked = ref(true);
let lockTimer = null;

function forceScrollTop() {
  // Forced-reflow source (Lighthouse forced-reflow-insight, traced via
  // sourcemap to this line): `el.scrollTop` read/write is a layout-forcing
  // pair (the browser must resolve current layout to answer the read /
  // clamp the write). Called at a point where the ~6,000-node desktop
  // tree is mid-hydration, this used to force a full-tree synchronous
  // layout every time — measured 700-980 dirty layout objects per call in
  // a Lighthouse trace. Skipping the write once already pinned at 0 (same
  // guard-before-write idiom as useScrollToSelectedSport's scrollIntoView
  // guard) avoids the write's own layout invalidation carrying into the
  // next call; scheduleForceScrollTop below is what caps how often this
  // read/write pair runs at all and moves it off the synchronous
  // mount/scroll-event call stack.
  const el = listEl.value;
  if (el && el.scrollTop !== 0) el.scrollTop = 0;
}

// Both the initial mount-time correction and every native 'scroll' event
// during the lock window (a scroll gesture can fire many per animation
// frame) used to call forceScrollTop() synchronously, mid-hydration —
// each call a forced reflow of the still-mounting tree. Routing every
// call through one rAF-scheduled slot per frame (a) coalesces N scroll
// events down to at most 1 check per frame, and (b) moves the read/write
// to a rAF boundary, a point the browser has already settled layout for
// the frame rather than a random point mid-script during active DOM
// mutation — both still run well before the next paint, so there is no
// visible scroll jump.
let scrollRafId = null;

function scheduleForceScrollTop() {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    if (scrollLocked.value) forceScrollTop();
  });
}

function onScrollWhileLocked() {
  if (scrollLocked.value) scheduleForceScrollTop();
}

function unlock() {
  scrollLocked.value = false;
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
  if (listEl.value) listEl.value.removeEventListener("scroll", onScrollWhileLocked);
}

function lockScroll(duration = 1200) {
  // Don't lock if we should restore scroll (coming back from match-details)
  if (matchesStore.restoreScroll) return;

  scrollLocked.value = true;
  clearTimeout(lockTimer);
  scheduleForceScrollTop();

  if (listEl.value) {
    listEl.value.addEventListener("scroll", onScrollWhileLocked);
  }

  lockTimer = setTimeout(unlock, duration);
}

onMounted(() => {
  lockScroll();

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    },
    { root: listEl.value, rootMargin: "600px 0px" },
  );
  if (sentinelEl.value) observer.observe(sentinelEl.value);
});

onBeforeUnmount(() => {
  clearTimeout(lockTimer);
  unlock();
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>
<template>
  <!-- Plain div, NOT <Lazy>: this wraps the page's entire main content, and
       Lazy.vue's IntersectionObserver-gated slot renders nothing during SSR,
       which blanked the landing/sports pages' server HTML. -->
  <div
    ref="listEl"
    class="matches-scroll-container h-dvh w-full overflow-scroll dark:border-border-darkest scrollbar-hide"
  >
    <slot />
    <div ref="sentinelEl" class="h-px" aria-hidden="true"></div>
  </div>
</template>
