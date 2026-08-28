<script setup>
import AppListbox from "@/components/ui/AppListbox.vue";
import { useMatchesStore } from "../stores/matches";

const { fetchSortedMatches } = useMatchesStore();

import { ref } from "vue";

function fetchSortedBy(sortBy) {
  fetchSortedMatches(sortBy);
}
const sorts = ref(["league", "time"]);

const selectedSort = ref(sorts.value[0]);
</script>

<template>
  <div class="flex w-full items-center py-1.5">
    <div class="w-full">
      <AppListbox
        v-model="selectedSort"
        class="relative"
        :button-class="[
          'bg-gray-300 dark:bg-surface-active',
          'relative flex px-2 items-center w-full cursor-default rounded-md text-left shadow-md focus:outline-hidden text-sm',
        ]"
        :options-class="[
          'bg-gray-200 dark:bg-background ring-white/5',
          'absolute max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 focus:outline-hidden sm:text-sm',
        ]"
      >
        <template #button>
          <span
            :class="['text-gray-900', 'dark:text-gray-50']"
            class="block truncate font-medium pr-2 py-1 capitalize"
            >Sort by {{ selectedSort }}</span
          >
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center"
          >
            <Icon
              name="tabler:selector"
              :class="['text-primary-400', 'dark:text-primary-450']"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </span>
        </template>

        <template #default="{ select, isSelected }">
          <li
            v-for="sort in sorts"
            :key="sort"
            role="option"
            :aria-selected="isSelected(sort)"
            class="relative cursor-pointer select-none pl-10 py-2"
            :class="[
              'text-gray-900 dark:text-gray-300',
              'focus:bg-gray-300 dark:focus:bg-surface-active hover:bg-gray-300 dark:hover:bg-surface-active',
            ]"
            @click="
              select(sort);
              fetchSortedBy(sort);
            "
          >
            <span
              class="block truncate capitalize"
              :class="[isSelected(sort) ? 'font-medium' : 'font-normal']"
              >Sort by {{ sort }}</span
            >
            <span
              v-if="isSelected(sort)"
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600"
            >
              <Icon name="tabler:check" class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </template>
      </AppListbox>
    </div>
  </div>
</template>
