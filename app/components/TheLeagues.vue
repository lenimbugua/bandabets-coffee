<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";
import AppListbox from "@/components/ui/AppListbox.vue";

import { useMatchesStore } from "../stores/matches";

const { competitions, meta } = storeToRefs(useMatchesStore());

// Local selection: the store has no selected-competition state or action, and
// the original Listbox had no v-model, so the choice is held here ("All" or a
// competition object) purely to drive the selected styling/aria-selected.
const selectedLeague = ref("All");

function sameLeague(a, b) {
  if (a === b) return true;
  return !!a && !!b && typeof a === "object" && typeof b === "object" && a.name === b.name;
}
</script>
<template>
  <div class="max-w-sm">
    <AppListbox
      v-model="selectedLeague"
      :by="sameLeague"
      class="mt-1"
      button-class="relative w-full cursor-default rounded-md border dark:border-border bg-white dark:bg-surface-deepest py-1 pl-3 pr-10 text-left shadow-md focus:outline-hidden focus-visible:border-gold-650 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
      options-class="absolute mt-1 max-w-96 h-96 overflow-auto rounded-md bg-white dark:bg-background py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm"
    >
      <template #button>
        <span class="block truncate text-gray-950 dark:text-gray-50"
          >Leagues</span
        >
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <Icon
            name="tabler:selector"
            class="h-5 w-5 text-gray-950 dark:text-gray-400"
            aria-hidden="true"
          />
        </span>
      </template>

      <template #default="{ select, isSelected }">
        <BaseEmptyState
          v-if="!competitions || !competitions.length"
          icon="tabler:flag"
          title="No leagues"
          description="No competitions available"
          size="sm"
          compact
        />
        <li
          role="option"
          :aria-selected="isSelected('All')"
          :class="[
            'text-gray-900 dark:text-white',
            'focus:bg-amber-100 focus:text-amber-900 dark:focus:text-white hover:bg-amber-100 hover:text-amber-900 dark:hover:text-white',
            'relative cursor-default select-none py-2 pl-10 pr-4',
          ]"
          @click="select('All')"
        >
          <span
            :class="[
              isSelected('All') ? 'font-medium' : 'font-normal',
              'block truncate',
            ]"
            >All ({{ meta.total }})</span
          >
          <span
            v-if="isSelected('All')"
            class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
          >
            <Icon name="tabler:check" class="h-5 w-5" aria-hidden="true" />
          </span>
        </li>
        <li
          v-for="competition in competitions"
          :key="competition.name"
          role="option"
          :aria-selected="isSelected(competition)"
          :class="[
            'text-gray-900 dark:text-white',
            'focus:bg-amber-100 focus:text-amber-900 dark:focus:text-amber-900 hover:bg-amber-100 hover:text-amber-900 dark:hover:text-amber-900',
            'relative cursor-default select-none py-2 pl-10 pr-4',
          ]"
          @click="select(competition)"
        >
          <span
            :class="[
              isSelected(competition) ? 'font-medium' : 'font-normal',
              'block truncate',
            ]"
            >{{ competition.competitionName }} ({{
              competition.matchCount
            }})</span
          >
          <span
            v-if="isSelected(competition)"
            class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
          >
            <Icon name="tabler:check" class="h-5 w-5" aria-hidden="true" />
          </span>
        </li>
      </template>
    </AppListbox>
  </div>
</template>
