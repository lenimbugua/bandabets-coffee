<script setup>
import { useCompetionsStore } from "@/stores/competitions";
import { useMatches2Store } from "@/stores/matches2";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { ref, toRefs } from "vue";

const { fetchCompetions, selectCompetitions } = useCompetionsStore();

/* Ported from Rada: three tabs, with the resource name used directly as the
   layout value. Countries is no longer a fourth tab — it sits beside these as
   its own chip (LeaguesButton), matching Rada. */
const highlights = ref([
  { name: "highlight" },
  { name: "upcoming" },
  { name: "grid" },
]);

const { setResource, setDay, setLayout } = useSportsQueryParamsStore();
const { layout } = toRefs(useSportsQueryParamsStore());
const { markets } = toRefs(useCompetionsStore());

const { getMatches, emptyMatches, setCalendarIsPending, setMarkets } =
  useMatches2Store();

const fetchCompetitions = async () => {
  selectCompetitions([]);
  await fetchCompetions();
  setMarkets(markets.value);
};

async function fetchMatches(resource) {
  setLayout(resource);
  if (resource === "grid") {
    fetchCompetitions();
    return;
  }
  emptyMatches();
  setDay("");
  setResource(resource);
  setCalendarIsPending(true);
  await getMatches();
  setCalendarIsPending(false);
}

function isSelected(selected) {
  if (layout.value) {
    return selected === layout.value;
  }
  // Default to highlights on first load, so one tab always reads as active.
  return selected === "highlight";
}
</script>

<template>
  <!-- min-w-0 at every flex level: without it the tab list can't shrink below
       its content width, so overflow-x-auto never engages and the tabs bleed
       under the calendar button on narrow screens. -->
  <div class="flex items-center justify-between min-w-0 text-sm text-foreground">
    <div class="flex items-center min-w-0">
      <AppTabs
        role="tablist"
        aria-label="Match highlight filters"
        class="flex w-full min-w-0 overflow-x-auto scrollbar-hide"
      >
        <AppTab
          v-for="category in highlights"
          :key="category.name"
          v-slot="{ attrs }"
          as="template"
          @click="fetchMatches(category.name)"
        >
          <button
            :class="[
              'inline-flex h-8 sm:h-9 shrink-0 items-center justify-center px-1.5 sm:px-4',
              // first:pl-0 keeps the leading label flush with the row gutter
              // without reaching outside this component to do it
              'first:pl-0',
              'text-[0.8rem] sm:text-[0.95rem] font-bold whitespace-nowrap capitalize',
              'border-b-2 transition-colors focus:outline-hidden',
              isSelected(category.name)
                ? 'border-selected text-selected'
                : 'border-transparent text-foreground hover:text-selected',
            ]"
            v-bind="attrs"
          >
            <div v-if="category.name === 'grid'">Popular</div>
            <span v-else>{{ category.name }}</span>
          </button>
        </AppTab>
      </AppTabs>
    </div>
  </div>
</template>
