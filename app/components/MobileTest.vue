<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCasinoStore } from "@/stores/casino";
import QuickAccessBar from "@/components/mobile/QuickAccessBar.vue";
import HotTabsSection from "@/components/mobile/HotTabsSection.vue";
// FREEBET DISABLED — restore later
// import WelcomeGiftStrip from "@/components/WelcomeGiftStrip.vue";

const casinoStore = useCasinoStore();
const { categoriesWithGames } = storeToRefs(casinoStore);

onMounted(() => {
  if (!categoriesWithGames.value?.length) {
    casinoStore.fetchCategoriesWithGames();
  }
});

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
  <MobileSportsLayout seo-title="Sports Betting – Fixtures & Odds | Bandabets">
    <template #hero>
      <!-- FREEBET DISABLED — restore later
      New-player nudge: claim the welcome gift if not yet claimed
      <WelcomeGiftStrip /> -->

      <!-- Quick access: merged game/sport navigation -->
      <QuickAccessBar />

      <!-- Hot tabs: Live / Codes / Top Games (absorbs the old TopGames strip) -->
      <HotTabsSection />

      <!-- Below the fold at 412x915 (measured): remaining casino category
           strips, deferred until scrolled into view.
           NB: this file lives at app/components/mobile/GamesRow.vue, so
           Nuxt's directory-based auto-naming registers it as
           MobileGamesRow / LazyMobileGamesRow — a bare <LazyGamesRow> tag
           resolves to nothing and the strip silently renders empty. -->
      <LazyMobileGamesRow
        v-for="cat in otherCategories"
        :key="cat.id"
        hydrate-on-visible
        :title="cat.name"
        :games="cat.games"
        :view-all-route="casinoHomeRoute(cat.slug)"
      />

      <div class="h-3" aria-hidden="true"></div>
    </template>
  </MobileSportsLayout>
</template>
