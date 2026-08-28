<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { ref } from "vue";

import { usePopularStore } from "../stores/popular";

import { useGamesMenus } from "../composables/useGamesMenus";

const { getGamesByCategory } = usePopularStore();

const { popular, crash, virtuals, spins } = useGamesMenus();

const tabs = ref([
  {
    name: "all",
    icon: "all",
  },
  {
    name: crash,
    icon: "crash",
  },
  {
    name: virtuals,
    icon: "virtuals",
  },
  {
    name: spins,
    icon: "spins",
  },
]);

getGamesByCategory(popular);
</script>
<template>
  <div
    class="scrollbar-hide items-end flex justify-between space-x-3 lg:space-x-4 whitespace-nowrap no-scrollbar overflow-x-scroll"
  >
    <AppTabs role="tablist">
      <AppTab
        v-for="category in tabs"
        :key="category.name"
        v-slot="{ selected, attrs }"
        as="template"
        @click="getGamesByCategory(category.name)"
      >
        <div
          class="flex-col justify-center items-center inline-flex text-center text-slate-500 hover:text-muted-foreground cursor-pointer py-2"
          data-state="closed"
          v-bind="attrs"
        >
          <div
            :class="[
              selected
                ? 'bg-red-500/20  text-md shadow-sm'
                : 'dark:bg-white/10 bg-black/10',
            ]"
            class="w-10 h-10 p-1.5 flex justify-center items-center rounded-lg shadow-sm"
          >
            <CasinoIcons
              :icon-css="'text-gray-700 dark:text-brand-mid h-6 w-6'"
              :icon="category.icon"
            />
          </div>
          <div class="text-xs font-medium mt-1 text-slate-3400">
            {{ category.name }}
          </div>
        </div>
      </AppTab>
    </AppTabs>
  </div>
</template>
