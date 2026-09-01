<script setup>
import SecondaryNav from "./SecondaryNav.vue";
import MatchFilters from "./mobile/MatchFilters.vue";

defineProps({
  seoTitle: { type: String, default: "" },
  showSportsTabs: { type: Boolean, default: true },
});
</script>

<template>
  <h1 v-if="seoTitle" class="sr-only">{{ seoTitle }}</h1>
  <HeaderLinks />
  <div class="max-w-[1680px] mx-auto px-4">
    <div class="w-full pt-3 flex justify-between gap-5">
      <!-- Sidebar -->
      <div class="shrink-0">
        <TheSidebar />
      </div>

      <!-- Main content -->
      <main class="flex-1 min-w-0 max-w-[800px] 2xl:max-w-[1000px]">
        <!-- Main category nav now lives in the header (HeaderNavLinks) at lg+ -->

        <!-- Banner (always shown on sports desktop). aspect-[3/1] matches
             TheBanner's own slide ratio (its .banner-slide is 100% wide at
             lg+, with an aspect-[3/1] button inside) so this box reserves
             the banner's real height before the hydrate-on-idle component
             mounts. Without it, the wrapper is 0px until idle fires,
             pushing the secondary nav / hero / sports-filter-card down by
             the banner's full height in one shot — confirmed via a
             Lighthouse trace: a fixed ~210px-tall node (the hero's
             TopGames section) and .sports-filter-card both moved down by
             ~229px, matching the banner's measured ~229px rendered height,
             at the exact moment it would have finished loading. -->
        <div class="my-3 rounded-xl overflow-hidden aspect-[3/1]">
          <LazyTheBanner hydrate-on-idle />
        </div>

        <!-- Secondary nav — game links below the banner -->
        <div class="mb-3 rounded-xl secondary-nav-sticky top-16 bg-gray-100 dark:bg-card">
          <SecondaryNav />
        </div>

        <!-- Hero content (HotSection, LivePreview — landing only) -->
        <slot name="hero" />

        <!-- Custom content override OR default sports filter + match list -->
        <template v-if="$slots.content">
          <slot name="content" />
        </template>
        <template v-else>
          <!-- Sports filter + Match list (unified card) -->
          <div class="rounded-xl sports-filter-card overflow-hidden" :class="{ 'mt-3': $slots.hero }">
            <!-- Reusable filter strip (desktop + mobile) -->
            <MatchFilters
              :sticky="false"
              :container-class="showSportsTabs ? 'rounded-none' : 'hidden'"
            />

            <!-- Match list -->
            <InfiniteScroll desktop />
          </div>

          <LazySEOMarkupContent hydrate-on-visible />
        </template>
      </main>

      <!-- Betslip panel -->
      <div class="shrink-0">
        <SportsBetslipPanel />
      </div>
    </div>
  </div>
  <slot name="after-content" />
  <LazyFooter hydrate-on-visible />
</template>

<style scoped>
.secondary-nav-sticky {
  position: sticky;
  z-index: 30;
  overflow: hidden;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .secondary-nav-sticky {
  border-bottom-color: oklch(100% 0 0 / 0.06);
}

.sports-filter-card {
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.06);
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.05),
    0 4px 16px oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .sports-filter-card {
  background: var(--surface-elevated);
  border-color: transparent;
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.12),
    0 4px 16px oklch(0% 0 0 / 0.2);
}
</style>
