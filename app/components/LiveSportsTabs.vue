<script setup>
import { useScrollToSelected } from "@/composables/useScrollToSelectedSport";
import formatStuff from "@/utilities/format-stuff";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { toRefs } from "vue";
import { useRouter } from "vue-router";
import { useLiveMatchesStore } from "../stores/live-matches";
import { useLiveSportsNavigationStore } from "../stores/live-sports-navigation";
import { useNewLiveStore } from "../stores/new-live";

const router = useRouter();

const { slugify } = formatStuff();

const { sports } = toRefs(useLiveMatchesStore());

const { selectedSportId } = toRefs(useLiveSportsNavigationStore());
const { setSelectedSportId } = useLiveSportsNavigationStore();
const { elementRefs: sportRefs } = useScrollToSelected(selectedSportId);

const { setSport, setSelectedSport, getLiveMatches, resetSortBy } =
  useNewLiveStore();

const getMatches = async (sport) => {
  setSelectedSportId(sport.sportId);
  setSelectedSport(sport);
  setSport(sport.sportId);
  resetSortBy();

  const sportName = slugify(sport.sportName);
  router.push({ name: "live", params: { sport: sportName } });
  await getLiveMatches();
};
const isSelected = (id) => {
  return selectedSportId.value == id;
};
</script>
<template>
  <div
    class="live-sports-bar flex items-center w-full overflow-x-auto scrollbar-hide rounded-xl"
  >
    <div class="flex items-center gap-3 px-3 py-2.5">
      <span class="text-base font-bold text-gray-900 dark:text-white italic shrink-0">
        Live
      </span>
      <div class="w-px h-4 bg-gray-300 dark:bg-white/20 shrink-0"></div>
      <AppTabs role="tablist" aria-label="Live sports categories" class="flex items-center gap-3">
        <AppTab
          v-for="sport in sports"
          :key="sport.sportName"
          v-slot="{ attrs }"
          as="template"
          @click="getMatches(sport)"
        >
          <button
            :ref="(el) => (sportRefs[sport.sportId] = el)"
            :class="[
              isSelected(sport.sportId)
                ? 'text-red-500 font-semibold'
                : 'text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80',
            ]"
            class="text-[0.75rem] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus:outline-hidden capitalize"
            v-bind="attrs"
          >
            {{ sport.sportName }}
          </button>
        </AppTab>
      </AppTabs>
    </div>
  </div>
</template>

<style scoped>
.live-sports-bar {
  background: white;
  border: 1px solid var(--border);
  box-shadow:
    0 1px 2px oklch(0% 0 0 / 0.04),
    0 2px 8px oklch(0% 0 0 / 0.02);
}
[data-theme="dark"] .live-sports-bar {
  background: var(--card);
  border-color: transparent;
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.12),
    0 4px 12px oklch(0% 0 0 / 0.15);
}
</style>
