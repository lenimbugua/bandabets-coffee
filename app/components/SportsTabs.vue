<script setup>
import { useScrollToSelected } from "@/composables/useScrollToSelectedSport";
import { useSports } from "@/composables/useSports";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { toRefs } from "vue";
import { useSportsStore } from "../stores/sports";
import { useSportsNavigationStore } from "../stores/sports-navigation";
import SportsIcons from "./SportsIcons.vue";


const { selectedSportId } = toRefs(useSportsNavigationStore());
const { setSelectedSportId } = useSportsNavigationStore();
const { elementRefs: sportRefs } = useScrollToSelected(selectedSportId);

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
  <!-- as="div": parents (SportsFilterBar/MatchFilters) have scoped styles, and a
       renderless root can't receive their data-v attribute during SSR. -->
  <AppTabs>
    <!-- w-max, not justify-between: the row scrolls inside SportsFilterBar, and a
         distributed row would squeeze the tabs instead of letting them overflow. -->
    <div role="tablist" aria-label="Sports categories" class="flex items-center gap-5 w-max">
      <AppTab
        v-for="thisSport in games"
        :key="thisSport.id"
        v-slot="{ attrs }"
        as="template"
        @click="getMatches(thisSport.id, thisSport.name, thisSport.icon, false)"
      >
        <div
          :ref="(el) => (sportRefs[thisSport.id] = el)"
          :class="[
            'relative cursor-pointer flex flex-row items-center gap-1.5 shrink-0 py-2 text-sm whitespace-nowrap capitalize font-bold transition-colors duration-150',
            'focus:outline-hidden',
            isSelected(thisSport.id)
              ? 'text-selected [&_svg]:text-selected'
              : 'text-foreground hover:text-selected [&_svg]:text-foreground',
          ]"
          v-bind="attrs"
        >
          <!-- Icon -->
          <SportsIcons :icon="thisSport.icon" size="h-4.5 w-4.5" />

          <!-- Sport name -->
          <span class="leading-none">{{ thisSport.name }}</span>

          <!-- Selected underline -->
          <span
            v-if="isSelected(thisSport.id)"
            class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-selected"
            aria-hidden="true"
          ></span>
        </div>
      </AppTab>
    </div>
  </AppTabs>
</template>
