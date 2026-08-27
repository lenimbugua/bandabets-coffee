<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import HeaderLinks from "./HeaderLinks.vue";
import InfiniteScroll from "./InfiniteScroll.vue";
import LazyInfinityScroll from "./LazyInfinityScroll.vue";
import CategoryPills from "./mobile/CategoryPills.vue";
import MobileFooterV2 from "./mobile/MobileFooterV2.vue";
import MatchFilters from "./mobile/MatchFilters.vue";
// DEPOSIT BAR DISABLED — restore later
// import TheDepositBar from "./TheDepositBar.vue";

defineProps({
  seoTitle: { type: String, default: "" },
});

// Measure the pinned top block (deposit + header + pills) so the sports
// filter bar always sticks directly below it, regardless of header height.
// The block lives inside a lazily-rendered <Lazy> wrapper, so we watch the
// ref and (re)attach the observer whenever it actually mounts.
const stickyTopEl = ref(null);
const stickyTopHeight = ref(0);
let ro = null;

const measure = () => {
  if (stickyTopEl.value) stickyTopHeight.value = stickyTopEl.value.offsetHeight;
};

watch(
  stickyTopEl,
  (el) => {
    ro?.disconnect();
    ro = null;
    if (!el) return;
    measure();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});
</script>

<template>
  <LazyInfinityScroll>
    <h1 v-if="seoTitle" class="sr-only">{{ seoTitle }}</h1>

    <!-- Pinned top block: deposit bar (mobile) + header + category pills -->
    <div ref="stickyTopEl" class="sticky top-0 z-60 bg-white dark:bg-background">
      <!-- DEPOSIT BAR DISABLED — restore later
      <TheDepositBar class="md:hidden" /> -->
      <HeaderLinks />
      <CategoryPills :sticky="false" />
    </div>

    <!-- Scrollable content -->
    <main class="bg-gray-50 dark:bg-background">
      <!-- Banner (always shown on mobile sports). Outer div clips the peeking
           next slide at the screen edge; slides carry their own rounding. -->
      <div class="overflow-hidden pt-3">
        <div class="mx-3">
          <LazyTheBanner hydrate-on-idle />
        </div>
      </div>

      <!-- Hero content (landing only) -->
      <slot name="hero" />

      <!-- Custom content override OR default sports filter + match list -->
      <template v-if="$slots.content">
        <slot name="content" />
      </template>
      <template v-else>
        <MatchFilters :sticky-top="(stickyTopHeight || 120) + 'px'" />
        <div class="sports-matches mx-3 rounded-b-xl overflow-hidden">
          <InfiniteScroll :flat="true" />
        </div>
      </template>
    </main>

    <LazySEOMarkupContent hydrate-on-visible />
    <LazyFooter hydrate-on-visible />
    <MobileFooterV2 />
  </LazyInfinityScroll>
</template>

<style scoped>
.sports-matches {
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.06);
  border-top: none;
}
[data-theme="dark"] .sports-matches {
  background: var(--surface-elevated);
  border-color: transparent;
}
</style>
