<script setup>
import AppListbox from "@/components/ui/AppListbox.vue";
import { useMatchesStore } from "../stores/matches";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

const { markets } = storeToRefs(useMatchesStore());

// Local selection mirrored from the store: the store exposes only `markets`
// (no selected-market state or action), so the selection lives here and
// re-syncs to the first market whenever the store list changes.
const selectedMarket = ref(markets.value[0]);
watch(markets, (list) => {
  selectedMarket.value = list?.[0];
});
</script>

<template>
  <div
    v-if="selectedMarket"
    class="flex w-full justify-center items-center py-1.5"
  >
    <div class="w-full">
      <AppListbox
        v-model="selectedMarket"
        by="subTypeId"
        class="relative"
        :button-class="[
          'bg-gray-300 dark:bg-surface-active',
          'relative flex px-2 items-center w-full cursor-default rounded-md text-left shadow-md focus:outline-hidden text-sm',
        ]"
        :options-class="[
          'bg-gray-100 dark:bg-background ring-white/5',
          'absolute max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 focus:outline-hidden sm:text-sm',
        ]"
      >
        <template #button>
          <span
            :class="['text-gray-700', 'dark:text-gray-50']"
            class="block truncate font-medium pr-2 py-1"
            >{{ selectedMarket.oddType }}</span
          >
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center"
          >
            <Icon
              name="tabler:selector"
              :class="['text-muted-foreground', 'dark:text-muted-foreground']"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </span>
        </template>

        <template #default="{ select, isSelected }">
          <li
            v-for="market in markets"
            :key="market.subTypeId"
            role="option"
            :aria-selected="isSelected(market)"
            class="relative cursor-pointer select-none pl-10 py-2"
            :class="[
              'text-gray-900 dark:text-gray-100',
              'focus:bg-gray-300 dark:focus:bg-surface-active focus:text-red-900 dark:focus:text-red-500',
              'hover:bg-gray-300 dark:hover:bg-surface-active hover:text-red-900 dark:hover:text-red-500',
            ]"
            @click="select(market)"
          >
            <span
              class="block truncate"
              :class="[isSelected(market) ? 'font-medium' : 'font-normal']"
              >{{ market.oddType }}</span
            >
            <span
              v-if="isSelected(market)"
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
