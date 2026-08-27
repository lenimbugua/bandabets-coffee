<script setup>
import SecondaryNavIcons from "@/components/SecondaryNavIcons.vue";
// import { useScrollToSelected } from "@/composables/useScrollToSelectedSport";
import { useSports } from "@/composables/useSports";
import { useSportsStore } from "@/stores/sports";
import { toRefs } from "vue";

import { useSportsNavigationStore } from "@/stores/sports-navigation";

const { selectedSportId } = toRefs(useSportsNavigationStore());
const { setSelectedSportId } = useSportsNavigationStore();
// const { elementRefs: sportRefs } = useScrollToSelected(selectedSportId);

const { setViewToDisplay } = useSportsStore();

const { fetchMatches, games } = useSports();
const getMatches = (sportId, name, icon, goToSports) => {
  setViewToDisplay("sport");
  setSelectedSportId(sportId);
  fetchMatches(sportId, name, icon, goToSports);
};

const isSelected = (id) => {
  return selectedSportId.value == id;
};
</script>
<template>
  <div
    v-for="link in games"
    :key="link.name"
    class="text-center text-slate-500 hover:text-muted-foreground cursor-pointer"
    @click="getMatches(link.id, link.name, link.icon, true)"
  >
    <div
      class="flex-col justify-center items-center inline-flex"
    >
      <div
        class="w-10 h-10 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
      >
        <SecondaryNavIcons
          :icon="link.icon"
          :icon-css="`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${isSelected(link.id) ? 'text-primary' : 'text-foreground/70'}`"
        />
      </div>
      <div
        :class="[
          isSelected(link.id)
            ? 'text-brand-bright font-semibold'
            : 'dark:text-gray-100/90 text-gray-800',
        ]"
        class="text-xs font-medium mt-1 w-14 text-ellipsis whitespace-nowrap overflow-hidden"
      >
        {{ link.name }}
      </div>
    </div>
  </div>
</template>
