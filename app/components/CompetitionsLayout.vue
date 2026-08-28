<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { storeToRefs } from "pinia";
import { useMatchesStore } from "../stores/matches";

const { fetchCountryMatches } = useMatchesStore();
const { meta, landingIsPending, sportIsPending, dayIsPending } = storeToRefs(
  useMatchesStore()
);

function fetchCompetitions(country) {
  fetchCountryMatches(country);
}

function isLoading() {
  return landingIsPending.value || sportIsPending.value || dayIsPending.value;
}

defineProps({
  categories: { type: Array, required: true },
});
</script>
<template>
  <AppTabs
    v-if="!isLoading()"
    role="tablist"
    aria-label="Competitions"
    class="flex space-x-4 max-w-5xl overflow-x-scroll scrollbar-hide px-1.5 sm:px-3"
  >
    <AppTab v-slot="{ selected, attrs }" as="template" @click="fetchCompetitions('')">
      <div
        :class="[
          'w-full cursor-pointer py-2 sm:py-4 whitespace-nowrap text-sm font-semibold flex space-x-1 justify-center items-center',
          ' focus:outline-hidden',
          selected
            ? 'text-brand-mid'
            : 'text-gray-800 dark:text-gray-100',
        ]"
        :style="[selected ? 'border-bottom: 2px solid var(--brand-bright);' : '']"
        v-bind="attrs"
      >
        <span>All</span>
        <span
          :class="[
            selected
              ? 'bg-brand-mid text-primary-foreground'
              : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-950',
          ]"
          class="rounded-full p-1 h-5 flex justify-center items-center text-center"
        >
          {{ meta?.total }}</span
        >
      </div>
    </AppTab>
    <AppTab
      v-for="category in categories"
      :key="category.countryName"
      v-slot="{ selected, attrs }"
      as="template"
      @click="fetchCompetitions(category.countryName)"
    >
      <div
        :class="[
          'w-full cursor-pointer py-2 sm:py-4 whitespace-nowrap text-sm font-semibold flex space-x-1 justify-center items-center',
          ' focus:outline-hidden',
          selected ? 'text-brand-mid' : 'text-gray-800 dark:text-gray-100',
        ]"
        :style="[selected ? 'border-bottom: 2px solid var(--brand-bright);' : '']"
        v-bind="attrs"
      >
        <span>{{ category.countryName }}</span>
        <span
          :class="[
            selected
              ? 'bg-brand-mid text-primary-foreground'
              : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-950',
          ]"
          class="rounded-full p-1 h-5 flex justify-center items-center text-center"
          >{{ category.matchCount }}</span
        >
      </div>
    </AppTab>
  </AppTabs>
</template>
