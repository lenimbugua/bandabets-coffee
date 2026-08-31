<script setup>
import { useDefaultSport } from "@/composables/useDefaultSport";
import { useMatches2Store } from "@/stores/matches2";
import { useScreenSizes } from "@/composables/useScreenSizes";
import { useScrollToViewedMatch } from "@/composables/useScrollToViewedMatch";
import { useCasinoStore } from "@/stores/casino";
import { storeToRefs } from "pinia";
import TopGames from "@/components/mobile/TopGames.vue";
// Must be imported explicitly. `Lazy` is a reserved Nuxt prefix, so a bare
// <LazyInfinityScroll> tag is parsed as "lazy-load a component named
// InfinityScroll" — which does not exist — and Vue renders nothing. That
// silently emptied this page's entire desktop (isLargeScreen) branch.
import LazyInfinityScroll from "@/components/LazyInfinityScroll.vue";
// import LiveMatchesPreviewDesktop from "@/components/LiveMatchesPreviewDesktop.vue";
import MobileTest from "@/components/MobileTest.vue";
// FREEBET DISABLED — restore later
// import WelcomeGiftStrip from "@/components/WelcomeGiftStrip.vue";
import { computed, onMounted, ref } from "vue";

const matchesStore = useMatches2Store();
const { initDefaultSport } = useDefaultSport();
const gameSection = ref(null);

const casinoStore = useCasinoStore();
const { categoriesWithGames } = storeToRefs(casinoStore);

onMounted(async () => {
  if (!categoriesWithGames.value?.length) {
    casinoStore.fetchCategoriesWithGames();
  }
  if (!matchesStore.restoreScroll) {
    initDefaultSport(true);
    return;
  }

  const { scrollToViewedMatch } = useScrollToViewedMatch();
  await scrollToViewedMatch();
});

const { isLargeScreen } = useScreenSizes();

const API_TO_CASINO_SLUG = {
  "hot-games-in-kenya": "all",
  "top-crash-games": "crash",
  virtuals: "virtuals",
  slots: "slots",
  instant: "crash",
  "table-games": "table",
};

function casinoHomeRoute(slug) {
  return {
    name: "casino-home",
    query: { category: API_TO_CASINO_SLUG[slug] || "all" },
  };
}

const otherCategories = computed(() => {
  if (!categoriesWithGames.value?.length) return [];
  return categoriesWithGames.value
    .filter((c) => c.slug === "slots")
    .map((cat) => ({
      ...cat,
      games: (cat.games || []).map((g) => ({ ...g, categoryName: cat.name })),
    }));
});
</script>

<template>
  <LazyInfinityScroll v-if="isLargeScreen" class="bg-gray-50 dark:bg-background">
    <DesktopSportsLayout
      seo-title="Sports Betting - Live Odds & Matches | Bandabets Kenya"
      show-sports-tabs
    >
      <template #hero>
        <!-- FREEBET DISABLED — restore later
        New-player nudge: claim the welcome gift if not yet claimed
        <WelcomeGiftStrip /> -->

        <!-- Hot Games headline (mirrors mobile) -->
        <TopGames />

        <!-- Remaining API categories: below the fold on desktop, deferred
             until scrolled into view.
             NB: The Lazy prefix splits GamesRow out of the entry chunk (code-splitting
             win). Hydration strategies do not apply because these rows are client-only
             (casino data from client-side fetch, no SSR markup). -->
        <LazyMobileGamesRow
          v-for="cat in otherCategories"
          :key="cat.id"
          :title="cat.name"
          :games="cat.games"
          :view-all-route="casinoHomeRoute(cat.slug)"
        />

      </template>

      <template #after-content>
        <div ref="gameSection"></div>
      </template>
    </DesktopSportsLayout>
  </LazyInfinityScroll>

  <div v-else class="block">
    <MobileTest />
  </div>
</template>
