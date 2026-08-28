<script setup>
import AppMenu from "@/components/ui/AppMenu.vue";
import { useMatchesStore } from "../stores/matches";
import { ref } from "vue";
const { fetchHourMatches } = useMatchesStore();

function fetchMatchesByDate(hour) {
  fetchHourMatches(hour);
}

const hours = ref([3, 6, 9, 12]);

</script>

<template>
  <AppMenu
    class="relative inline-block text-left"
    button-class="inline-flex w-full justify-center items-center text-md font-bold focus:outline-hidden"
    items-class="absolute -right-3 mt-2 w-20 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-surface-interactive shadow-lg ring-1 ring-black/5 focus:outline-hidden"
  >
    <template #button>
      HRS
      <Icon
        name="tabler:chevron-down"
        class="-mr-1 h-5 w-5"
        aria-hidden="true"
      />
    </template>

    <div class="px-1 py-1">
      <button
        v-for="hour in hours"
        :key="hour"
        type="button"
        role="menuitem"
        :class="[
          'text-gray-900 dark:text-gray-300',
          'focus:bg-surface-deepest focus:text-white dark:focus:text-white hover:bg-surface-deepest hover:text-white dark:hover:text-white',
          'group flex w-full items-center rounded-md px-2 py-2 text-sm',
        ]"
        @click="fetchMatchesByDate(hour)"
      >
        {{ hour }} HRS
      </button>
    </div>
  </AppMenu>
</template>
