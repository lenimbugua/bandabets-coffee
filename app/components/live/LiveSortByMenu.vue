<script setup>
import AppMenu from "@/components/ui/AppMenu.vue";
import { useNewLiveStore } from "@/stores/new-live";
import { ref } from "vue";

const { setSortBy, getLiveMatches } = useNewLiveStore();

const menus = ref([
  { name: "Highlights", value: "" },
  { name: "Top Leagues", value: "top_league" },
  { name: "Ending Soon", value: "ending_soon" },
  { name: "Just Started", value: "start_date" },
]);

const getMatches = (sortBy) => {
  setSortBy(sortBy);
  getLiveMatches();
};
</script>

<template>
  <div class="text-right">
    <AppMenu
      class="relative inline-block text-left z-25"
      button-class="sort-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[0.65rem] font-semibold transition-all duration-150 cursor-pointer focus:outline-hidden"
      items-class="sort-dropdown absolute right-0 mt-1.5 w-36 origin-top-right rounded-xl overflow-hidden focus:outline-hidden"
    >
      <template #button>
        <span class="text-gray-600 dark:text-white/55">Sort by</span>
        <Icon
          name="tabler:chevron-down"
          class="h-3.5 w-3.5 text-gray-400 dark:text-white/35"
          aria-hidden="true"
        />
      </template>

      <div class="py-1">
        <button
          v-for="menu in menus"
          :key="menu.name"
          type="button"
          role="menuitem"
          :class="[
            'text-gray-600 dark:text-white/60',
            'focus:bg-gray-100 dark:focus:bg-white/8 focus:text-gray-900 dark:focus:text-white',
            'hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white',
          ]"
          class="flex w-full items-center px-3 py-2 text-[0.65rem] font-medium transition-colors"
          @click="getMatches(menu.value)"
        >
          {{ menu.name }}
        </button>
      </div>
    </AppMenu>
  </div>
</template>

<style scoped>
/* `.sort-btn` / `.sort-dropdown` are passed to AppMenu via props, so they land on
   elements inside the child: `:deep()` for the light rules, `:global()` for the
   `[data-theme="dark"]` ancestor rules (the html element carries no scope id). */
:deep(.sort-btn) {
  background: oklch(96% 0.005 258 / 0.6);
}
:global([data-theme="dark"] .sort-btn) {
  background: oklch(26% 0.04 258 / 0.5);
}
:deep(.sort-btn:hover) {
  background: oklch(93% 0.005 258 / 0.7);
}
:global([data-theme="dark"] .sort-btn:hover) {
  background: oklch(29% 0.04 258 / 0.6);
}

:deep(.sort-dropdown) {
  background: white;
  box-shadow:
    0 4px 16px oklch(0% 0 0 / 0.08),
    0 1px 3px oklch(0% 0 0 / 0.06);
}
:global([data-theme="dark"] .sort-dropdown) {
  background: var(--card);
  box-shadow:
    0 4px 16px oklch(0% 0 0 / 0.3),
    0 1px 3px oklch(0% 0 0 / 0.2);
}
</style>
