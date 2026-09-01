<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useCasinoStore } from "@/stores/casino";
import { useCasino } from "@/composables/useCasino";
import { casinoCategoryIconPath } from "@/composables/useCasinoCategoryIcons";
import NearViewportImage from "@/components/casino/NearViewportImage.vue";

const router = useRouter();
const casinoStore = useCasinoStore();
const { categoriesWithGames, categoriesFetched } = storeToRefs(casinoStore);
const { launchCasino } = useCasino();

onMounted(() => {
  if (!categoriesWithGames.value?.length) {
    casinoStore.fetchCategoriesWithGames();
  }
});

const hotCategory = computed(() => {
  if (!categoriesWithGames.value?.length) return null;
  return (
    categoriesWithGames.value.find((c) => c.slug === "hot-games-in-kenya") ||
    categoriesWithGames.value.find((c) =>
      c.name?.toLowerCase().includes("hot")
    ) ||
    categoriesWithGames.value[0]
  );
});

// null = "follow the hot category", so the section keeps its default view until
// the user actually picks a pill.
const selectedCategoryId = ref(null);

const categoryPills = computed(() =>
  categoriesWithGames.value.map((cat) => ({
    id: cat.id,
    name: cat.name,
    iconPath: casinoCategoryIconPath(cat.name),
  }))
);

const activeCategory = computed(() => {
  if (!selectedCategoryId.value) return hotCategory.value;
  return (
    categoriesWithGames.value.find((c) => c.id === selectedCategoryId.value) ||
    hotCategory.value
  );
});

const topGames = computed(() => activeCategory.value?.games?.slice(0, 12) || []);

const heading = computed(() =>
  (activeCategory.value?.name || "Top Games in Kenya").toUpperCase()
);

// This is the desktop landing page's hero content — it sits directly above
// `.sports-filter-card` (DesktopSportsLayout's match list). The category
// data is a client-only fetch (see onMounted below), so without a
// reservation this section is 0px through SSR and first paint, then pops in
// full height once the fetch resolves — pushing the match list down after
// the user has already started looking at it. That's exactly the
// `div.sports-filter-card` shift PSI blamed twice (~0.073 each): a
// Lighthouse trace confirms the card's own top position moving down in two
// waves that line up with this section (and the sibling casino row next to
// it) appearing.
//
// Mirrors HotTabsSection's `gamesPending` (its mobile equivalent — same
// casino fetch, already reserves space the same way): true until a fetch
// has actually answered (SSR, pre-mount, in flight), so the section
// occupies its final height from first paint. Once `categoriesFetched` is
// true with genuinely nothing to show, the section collapses (unchanged
// prior behavior for that edge case).
const gamesPending = computed(
  () => !topGames.value.length && !categoriesFetched.value
);
const skeletonPillWidths = ["w-16", "w-20", "w-14", "w-16", "w-20"];

function routeNameFor(categoryName = "") {
  const lower = categoryName.toLowerCase();
  if (lower.includes("crash")) return "crash-games";
  if (lower.includes("virtual")) return "virtuals-games";
  return "casino";
}

function play(game) {
  launchCasino(
    game.id,
    game.gameName,
    routeNameFor(activeCategory.value?.name || ""),
    game.providerName
  );
}

function viewAll() {
  router.push({ name: "casino-home", query: { category: "all" } });
}
</script>

<template>
  <section v-if="gamesPending || topGames.length" class="mx-3 sm:mx-0 mt-3">
    <div class="rounded-xl bg-card p-3">
      <header class="flex items-start justify-between mb-2">
        <div>
          <h2 class="flex items-center gap-2 text-sm font-extrabold text-foreground tracking-wide">
            <span aria-hidden="true">🔥</span>
            <span>{{ heading }}</span>
          </h2>
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-selected hover:text-selected/80"
          @click="viewAll"
        >
          ALL
          <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </header>

      <template v-if="gamesPending">
        <!-- Skeleton: reserves the pills row + game tile row so the section
             occupies its final height before the casino fetch answers,
             instead of popping in above the match list once it does. -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2.5" aria-hidden="true">
          <div
            v-for="(w, i) in skeletonPillWidths"
            :key="i"
            class="h-5 shrink-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 bg-size-[200%_100%] animate-shimmer"
            :class="w"
          ></div>
        </div>
        <div class="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1" aria-hidden="true">
          <div
            v-for="i in 6"
            :key="i"
            class="aspect-square shrink-0 w-20 sm:w-24 md:w-28 lg:w-32 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 bg-size-[200%_100%] animate-shimmer"
          ></div>
        </div>
      </template>

      <template v-else>
        <!-- Casino category pills — same structure as the casino home nav -->
        <div
          v-if="categoryPills.length"
          class="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2.5"
        >
          <button
            v-for="pill in categoryPills"
            :key="pill.id"
            type="button"
            class="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-semibold whitespace-nowrap transition-all cursor-pointer"
            :class="activeCategory?.id === pill.id
              ? 'bg-pill-selected text-pill-selected-foreground'
              : 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/75 hover:bg-gray-200 dark:hover:bg-white/12'"
            @click="selectedCategoryId = pill.id"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-3 h-3 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="pill.iconPath" />
            </svg>
            <span>{{ pill.name }}</span>
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          <button
            v-for="game in topGames"
            :key="game.id"
            type="button"
            class="shrink-0 w-20 sm:w-24 md:w-28 lg:w-32 rounded-lg overflow-hidden bg-surface-deepest text-left hover:shadow-md transition-shadow"
            @click="play(game)"
          >
            <div class="relative aspect-square overflow-hidden">
              <NearViewportImage
                :src="game.imgFullUrl"
                :alt="game.gameName"
                class="w-full h-full object-cover"
              />
              <span class="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-background/70 text-xs sm:text-sm" aria-hidden="true">🔥</span>
            </div>
          </button>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
