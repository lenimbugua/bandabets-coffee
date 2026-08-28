<script setup>
import { useCompetionsStore } from "@/stores/competitions";
import { useCountriesStore } from "@/stores/countries";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { toRefs } from "vue";

const { setSelectedCompetition } = useCountriesStore();
const { fetchCompetions, selectCompetitions } = useCompetionsStore();

const { selectedCompetitions, selectedCompetition } = toRefs(
  useCountriesStore()
);

function fetchGame(competition) {
  selectCompetitions([competition.competitionId]);
  setSelectedCompetition(competition.competitionName);
  fetchCompetions();
}

const competitionIsSelected = (competitionName) =>
  competitionName === selectedCompetition.value;
</script>
<template>
  <AppTabs role="tablist" aria-label="Competition filters" class="comp-bar">
    <AppTab
      v-for="competition in selectedCompetitions"
      :key="competition"
      v-slot="{ attrs }"
      as="template"
      @click="fetchGame(competition)"
    >
      <button
        :class="['comp-pill', competitionIsSelected(competition.competitionName) && 'comp-pill--active']"
        v-bind="attrs"
      >
        {{ competition.competitionName }}
      </button>
    </AppTab>
  </AppTabs>
</template>

<style scoped>
.comp-bar {
  display: flex;
  gap: 0.375rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.comp-bar::-webkit-scrollbar {
  display: none;
}

.comp-pill {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.6rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
  outline: none;
  background: oklch(0% 0 0 / 0.04);
  color: oklch(40% 0 0);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
.comp-pill:hover {
  background: oklch(0% 0 0 / 0.07);
  color: oklch(25% 0 0);
}
[data-theme="dark"] .comp-pill {
  background: oklch(100% 0 0 / 0.04);
  color: oklch(100% 0 0 / 0.5);
  border-color: oklch(100% 0 0 / 0.06);
}
[data-theme="dark"] .comp-pill:hover {
  background: oklch(100% 0 0 / 0.08);
  color: oklch(100% 0 0 / 0.7);
}

.comp-pill--active {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
  font-weight: 600;
}
.comp-pill--active:hover {
  background: var(--secondary);
  color: var(--primary-foreground);
}
[data-theme="dark"] .comp-pill--active {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
[data-theme="dark"] .comp-pill--active:hover {
  background: var(--secondary);
  color: var(--primary-foreground);
}
</style>
