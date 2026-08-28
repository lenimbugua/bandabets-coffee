<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { useMatches2Store } from "../stores/matches2";

const { setSelectedMarket, resetSelectedMarket } = useMatches2Store();
const { markets } = storeToRefs(useMatches2Store());

function fetchMatches(subtype) {
  setSelectedMarket(subtype);
}

onBeforeMount(() => {
  resetSelectedMarket();
});
</script>

<template>
  <!-- Ported from Rada: free-standing pills rather than the dropdown this
       used to be, and rather than a segmented bar — the labels vary from
       "1x2" to "Both Teams To Score", and forcing them to equal widths
       squeezed the long ones. Each chip sizes to its text and the row
       scrolls. -->
  <AppTabs
    role="tablist"
    aria-label="Betting markets"
    class="flex w-full items-center gap-2 overflow-x-auto scrollbar-hide py-0.5"
  >
    <AppTab
      v-for="category in markets"
      :key="category.name"
      v-slot="{ selected, attrs }"
      as="template"
    >
      <button
        :class="[
          'inline-flex h-[22px] shrink-0 items-center cursor-pointer whitespace-nowrap rounded-full px-2.5 text-[0.8rem] font-bold transition-colors',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
          selected
            ? 'bg-pill-selected text-pill-selected-foreground'
            : 'bg-surface-interactive text-foreground/80 hover:text-foreground',
        ]"
        v-bind="attrs"
        @click="fetchMatches(category.subTypeId)"
      >
        {{ category.oddType }}
      </button>
    </AppTab>
  </AppTabs>
</template>
