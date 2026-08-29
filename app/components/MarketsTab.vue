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
  <!-- Before the first response there are no markets yet; three shimmer pills
       stand in at the chips' exact height (h-[22px] + py-0.5) so the row is
       36 px from the SSR render onward instead of collapsing to 14 px and
       shifting the match list when the chips arrive. -->
  <div
    v-if="!markets?.length"
    class="market-placeholder flex w-full items-center gap-2 py-0.5"
    aria-hidden="true"
  >
    <div
      v-for="n in 3"
      :key="n"
      class="h-[22px] shrink-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 bg-size-[200%_100%] animate-shimmer"
      :class="n === 1 ? 'w-14' : n === 2 ? 'w-20' : 'w-24'"
      :style="{ animationDelay: `${n * 0.1}s` }"
    ></div>
  </div>
  <AppTabs
    v-else
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
